import { getStore } from './lib/get-store.mjs';
import webPush from 'web-push';
import { applyOrderToInventory, restoreOrderInventory } from '../../florea-inventory-shared.mjs';
import { getInventoryStore, readInventory, updateInventory } from './lib/inventory-store.mjs';
import { snapshotOrderItemCosts } from '../../florea-accounting.mjs';
import {
    formatOrderItem,
    getOrderTotal,
    matchesCustomerName,
    validateOrderItems,
    validatePushSubscription
} from './lib/order-validation.mjs';
import { getCashierSession, verifyCashierSession } from './lib/cashier-session.mjs';
import { isTwilioSmsConfigured, sendOrderStatusSms } from './lib/twilio-sms.mjs';
import { maintenanceResponse } from './lib/maintenance.mjs';

export const config = { path: '/api/orders/:orderId' };

function jsonResponse(statusCode, body) {
    return new Response(JSON.stringify(body), {
        status: statusCode,
        headers: { 'content-type': 'application/json; charset=utf-8' }
    });
}

async function sendPushWithRetry(subscription, message, orderId) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
            await webPush.sendNotification(subscription, JSON.stringify(message), {
                TTL: 86400,
                urgency: 'high'
            });
            return;
        } catch (error) {
            const retryable = error.statusCode === 429 || error.statusCode >= 500;
            if (!retryable || attempt === 3) {
                console.error(`Unable to send order status notification for ${orderId}.`, error);
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, attempt * 300));
        }
    }
}

export default async function handler(request, context) {
    const maintenance = maintenanceResponse();
    if (maintenance) return maintenance;
    const store = getStore('florea-orders', { consistency: 'strong' });
    const orderId = context.params.orderId;
    if (!/^ORD-[\w-]{1,60}$/.test(orderId)) {
        return jsonResponse(400, { error: 'Invalid order ID.' });
    }

    const key = `order:${orderId}`;
    const orderRecord = await store.getWithMetadata(key, { type: 'json' });
    const order = orderRecord?.data;
    if (!order) {
        return jsonResponse(404, { error: 'Order not found.' });
    }

    if (request.method === 'GET') {
        return new Response(JSON.stringify({ order }), {
            status: 200,
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'cache-control': 'no-store'
            }
        });
    }

    if (request.method === 'DELETE') {
        const cashierSession = getCashierSession(request, process.env.CASHIER_SESSION_SECRET);
        if (!cashierSession) {
            return jsonResponse(401, { error: 'A valid cashier session is required.' });
        }
        await store.delete(key);
        const notificationStore = getStore('florea-order-notifications', { consistency: 'strong' });
        await notificationStore.delete(key);
        const smsStore = getStore('florea-order-sms', { consistency: 'strong' });
        await smsStore.delete(key);
        return new Response(null, { status: 204 });
    }

    if (request.method !== 'PATCH') {
        return jsonResponse(405, { error: 'Method not allowed.' });
    }

    let payload;
    try {
        payload = await request.json();
    } catch {
        return jsonResponse(400, { error: 'Request body must be valid JSON.' });
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return jsonResponse(400, { error: 'Request body must be a JSON object.' });
    }

    if (payload.action === 'appendItems') {
        const additionId = payload.additionId;
        const customerName = typeof payload.customerName === 'string'
            ? payload.customerName.trim().slice(0, 80)
            : '';
        const validatedItems = validateOrderItems(payload.itemDetails);
        const pushSubscription = payload.pushSubscription;
        const smsOptIn = payload.smsOptIn === true;
        const smsPhone = typeof payload.smsPhone === 'string' ? payload.smsPhone.trim() : '';

        if (typeof additionId !== 'string' || !/^[\w-]{8,80}$/.test(additionId)) {
            return jsonResponse(400, { error: 'A valid addition ID is required.' });
        }
        if (Array.isArray(order.additionIds) && order.additionIds.includes(additionId)) {
            return jsonResponse(200, { order, appended: true, notificationConfigured: false, smsConfigured: false });
        }
        if (!customerName || validatedItems.error) {
            return jsonResponse(400, { error: validatedItems.error || 'A customer name is required.' });
        }
        if (!matchesCustomerName(order.customerName, customerName)) {
            return jsonResponse(409, {
                code: 'CUSTOMER_MISMATCH',
                error: 'This open order belongs to a different customer.'
            });
        }
        if ((payload.orderType !== undefined &&
                !['Dine-in', 'Takeout', 'Not specified'].includes(payload.orderType)) ||
            (payload.specialInstructions !== undefined &&
                (typeof payload.specialInstructions !== 'string' || payload.specialInstructions.length > 500))) {
            return jsonResponse(400, { error: 'Order type or special instructions are invalid.' });
        }
        if (!['new', 'preparing'].includes(order.status)) {
            return jsonResponse(409, {
                code: 'ORDER_CLOSED',
                error: 'This order is already complete and can no longer be changed.'
            });
        }
        if (!validatePushSubscription(pushSubscription).valid) {
            return jsonResponse(400, { error: 'The notification subscription is invalid.' });
        }
        if (smsOptIn && !/^\+[1-9]\d{7,14}$/.test(smsPhone)) {
            return jsonResponse(400, { error: 'Enter a valid phone number in international format to receive SMS updates.' });
        }

        const itemDetails = validatedItems.itemDetails;
        const transactionId = `${orderId}:ADD:${additionId}`;
        const inventoryStore = getInventoryStore();
        const deduction = await updateInventory(inventory => {
            const result = applyOrderToInventory(inventory, transactionId, itemDetails);
            if (!result.success || result.alreadyApplied) {
                return { changed: false, ...result };
            }
            return { changed: true, inventory: result.inventory, ...result };
        }, inventoryStore);

        if (!deduction.success) {
            if (deduction.shortages) {
                const shortageText = deduction.shortages
                    .map(item => `${item.name}: ${item.available} ${item.unit} available, ${item.required} required`)
                    .join('; ');
                return jsonResponse(409, {
                    code: 'OUT_OF_STOCK',
                    error: `Not enough stock to add these items. ${shortageText}`,
                    shortages: deduction.shortages
                });
            }
            return jsonResponse(409, {
                code: 'INVENTORY_ERROR',
                error: deduction.error || 'One or more items are not configured in shared inventory.'
            });
        }

        const updatedItems = [...(order.itemDetails || []), ...itemDetails];
        const updatedOrder = {
            ...order,
            items: updatedItems.map(formatOrderItem),
            itemDetails: updatedItems,
            total: getOrderTotal(updatedItems),
            ...(payload.orderType === undefined ? {} : { orderType: payload.orderType }),
            ...(payload.specialInstructions === undefined ? {} : { specialInstructions: payload.specialInstructions.trim() }),
            updatedAt: new Date().toISOString(),
            additionIds: [...(order.additionIds || []), additionId]
        };
        let saved;
        try {
            saved = await store.setJSON(key, updatedOrder, { onlyIfMatch: orderRecord.etag });
        } catch (error) {
            console.error(`Unable to append items to ${orderId}.`, error);
        }

        if (!saved?.modified) {
            let latestOrder;
            let verificationFailed = false;
            try {
                latestOrder = await store.get(key, { type: 'json' });
            } catch (error) {
                console.error(`Unable to verify an item addition to ${orderId}.`, error);
                verificationFailed = true;
            }
            if (latestOrder?.additionIds?.includes(additionId)) {
                return jsonResponse(200, {
                    order: latestOrder,
                    appended: true,
                    notificationConfigured: false,
                    smsConfigured: false
                });
            }
            if (verificationFailed) {
                return jsonResponse(503, {
                    code: 'ORDER_UPDATE_UNVERIFIED',
                    error: 'The result could not be confirmed. Please retry the same selection before changing it.'
                });
            }

            const rollback = await updateInventory(inventory => {
                const result = restoreOrderInventory(inventory, transactionId, itemDetails);
                if (!result.success || result.alreadyRestored) {
                    return { changed: false, ...result };
                }
                return { changed: true, inventory: result.inventory, ...result };
            }, inventoryStore);
            if (!rollback.success) {
                console.error(`Unable to restore inventory after an item addition failed for ${orderId}.`, rollback.error);
            }
            if (latestOrder && !['new', 'preparing'].includes(latestOrder.status)) {
                return jsonResponse(409, {
                    code: 'ORDER_CLOSED',
                    error: 'This order is already complete and can no longer be changed.'
                });
            }
            return jsonResponse(409, {
                code: 'ORDER_UPDATED',
                error: 'This order changed while items were being added. Please try again.'
            });
        }

        let notificationConfigured = false;
        if (pushSubscription) {
            try {
                const notificationStore = getStore('florea-order-notifications', { consistency: 'strong' });
                await notificationStore.setJSON(key, pushSubscription);
                notificationConfigured = true;
            } catch (error) {
                console.error(`Unable to update notification subscription for ${orderId}.`, error);
            }
        }
        let smsConfigured = false;
        if (smsOptIn && isTwilioSmsConfigured()) {
            try {
                const smsStore = getStore('florea-order-sms', { consistency: 'strong' });
                await smsStore.setJSON(key, { phone: smsPhone });
                smsConfigured = true;
            } catch (error) {
                console.error(`Unable to update SMS contact for ${orderId}.`, error);
            }
        }
        return jsonResponse(200, { order: updatedOrder, appended: true, notificationConfigured, smsConfigured });
    }

    if (!verifyCashierSession(request, process.env.CASHIER_SESSION_SECRET)) {
        return jsonResponse(401, { error: 'A valid cashier session is required.' });
    }

    if (payload.action === 'verifyPayment') {
        const paymentMethods = ['Cash', 'GCash', 'Card', 'Other'];
        if (!paymentMethods.includes(payload.paymentMethod)) {
            return jsonResponse(400, { error: 'Choose a valid payment method.' });
        }
        if (order.status === 'cancelled') {
            return jsonResponse(409, { error: 'Cancelled orders cannot be marked as paid.' });
        }
        if (order.paymentStatus === 'paid') {
            if (order.paymentMethod === payload.paymentMethod) {
                return jsonResponse(200, { order });
            }
            return jsonResponse(409, { error: 'Payment is already verified and cannot be changed.' });
        }

        const inventory = await readInventory(getInventoryStore());
        const itemDetails = snapshotOrderItemCosts(order.itemDetails || [], inventory);
        const updatedOrder = {
            ...order,
            itemDetails,
            paymentStatus: 'paid',
            paymentMethod: payload.paymentMethod,
            paymentVerifiedAt: new Date().toISOString(),
            costSnapshotAt: new Date().toISOString(),
            paymentProcessedBy: cashierSession.username,
            updatedAt: new Date().toISOString()
        };
        const paymentUpdate = await store.setJSON(key, updatedOrder, { onlyIfMatch: orderRecord.etag });
        if (!paymentUpdate.modified) {
            return jsonResponse(409, {
                code: 'ORDER_UPDATED',
                error: 'This order changed while payment was being verified. Refresh and try again.'
            });
        }
        return jsonResponse(200, { order: updatedOrder });
    }

    const nextStatus = payload.status;
    const allowedTransition =
        (nextStatus === 'preparing' && order.status === 'new') ||
        (nextStatus === 'ready' && order.status === 'preparing') ||
        (nextStatus === 'completed' && order.status === 'ready' && order.paymentStatus === 'paid') ||
        (nextStatus === 'cancelled' && ['new', 'preparing', 'ready'].includes(order.status));
    if (!allowedTransition) {
        return jsonResponse(409, {
            error: nextStatus === 'completed' && order.paymentStatus !== 'paid'
                ? 'Verify payment before completing this order.'
                : 'This order cannot move to the requested status.'
        });
    }

    const previousStatus = order.status;
    const itemDetails = Array.isArray(order.itemDetails) ? order.itemDetails : [];
    let restoredInventory = false;
    if (nextStatus === 'cancelled') {
        if (!itemDetails.length) {
            return jsonResponse(409, { error: 'This order has no saved item details, so it cannot be safely cancelled.' });
        }
        const inventoryUpdate = await updateInventory(inventory => {
            const result = restoreOrderInventory(inventory, order.id, itemDetails);
            if (!result.success || result.alreadyRestored) {
                return { changed: false, ...result };
            }
            return { changed: true, ...result };
        }, getInventoryStore());
        if (!inventoryUpdate.success) {
            return jsonResponse(409, {
                error: inventoryUpdate.error || 'Inventory could not be restored. The order was not cancelled.'
            });
        }
        restoredInventory = !inventoryUpdate.alreadyRestored;
    }

    const updatedOrder = {
        ...order,
        status: nextStatus,
        lastProcessedBy: cashierSession.username,
        updatedAt: new Date().toISOString(),
        ...(nextStatus === 'completed' ? {
            completedAt: new Date().toISOString(),
            completedBy: cashierSession.username
        } : {}),
        ...(nextStatus === 'cancelled' ? { cancelledAt: new Date().toISOString() } : {})
    };
    const statusUpdate = await store.setJSON(key, updatedOrder, { onlyIfMatch: orderRecord.etag });
    if (!statusUpdate.modified) {
        const latestOrder = await store.get(key, { type: 'json' });
        if (latestOrder?.status === 'cancelled') {
            return jsonResponse(200, { order: latestOrder, notificationSent: false, notificationStatus: 'not_attempted', smsSent: false });
        }
        if (restoredInventory) {
            const compensation = await updateInventory(inventory => {
                const result = applyOrderToInventory(inventory, order.id, itemDetails);
                if (!result.success || result.alreadyApplied) {
                    return { changed: false, ...result };
                }
                return { changed: true, ...result };
            }, getInventoryStore());
            if (!compensation.success) {
                console.error(`Unable to restore inventory deduction after cancellation failed for ${orderId}.`, compensation.error);
            }
        }
        return jsonResponse(409, {
            code: 'ORDER_UPDATED',
            error: 'This order changed while its status was being updated. Please refresh and try again.'
        });
    }
    let notificationSent = false;
    let notificationStatus = previousStatus === nextStatus ? 'not_attempted' : 'not_subscribed';
    let smsSent = false;
    if (previousStatus !== nextStatus && ['preparing', 'ready', 'completed'].includes(nextStatus)) {
        const notificationStore = getStore('florea-order-notifications', { consistency: 'strong' });
        try {
            const subscription = await notificationStore.get(key, { type: 'json' });
            if (subscription) {
                notificationStatus = 'failed';
                const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
                if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
                    console.error(`Push notification keys are not configured for ${orderId}.`);
                } else {
                    try {
                        webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
                        const ready = nextStatus === 'ready';
                        const completed = nextStatus === 'completed';
                        const customerName = typeof order.customerName === 'string' && order.customerName.trim()
                            ? order.customerName.trim()
                            : 'Customer';
                        await sendPushWithRetry(subscription, {
                            title: 'Floréa',
                            body: completed
                                ? `${customerName}, THANK YOU SO MUCH!`
                                : ready
                                    ? `${customerName}, OKAY NA PO ORDERS NIYO`
                                    : `${customerName}, PA WAIT LANG PO ORDERS NIYO`,
                            url: '/menu',
                            orderId,
                            status: payload.status
                        }, orderId);
                        notificationSent = true;
                        notificationStatus = 'sent';
                    } catch (error) {
                        console.error(`Unable to deliver ${payload.status} push notification for ${orderId} (HTTP ${error.statusCode || 'unknown'}).`);
                        if (error.statusCode === 404 || error.statusCode === 410) {
                            try {
                                await notificationStore.delete(key);
                            } catch (deleteError) {
                                console.error(`Unable to remove the expired notification subscription for ${orderId}.`, deleteError);
                            }
                        }
                    }
                    if (notificationSent && payload.status === 'completed') {
                        try {
                            await notificationStore.delete(key);
                        } catch (error) {
                            console.error(`Unable to clear the notification subscription after order ${orderId} was ready.`, error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`Unable to look up ${payload.status} notification for ${orderId}.`, error);
            notificationStatus = 'failed';
        }

        const smsStore = getStore('florea-order-sms', { consistency: 'strong' });
        try {
            const smsContact = await smsStore.get(key, { type: 'json' });
            if (smsContact?.phone) {
                try {
                    await sendOrderStatusSms(smsContact.phone, order.customerName || 'Customer', nextStatus);
                    smsSent = true;
                } catch (error) {
                    console.error(`Unable to send ${nextStatus} SMS for ${orderId}.`, error);
                }
            }
        } catch (error) {
            console.error(`Unable to look up ${nextStatus} SMS contact for ${orderId}.`, error);
        }
        if (nextStatus === 'completed') {
            try {
                await smsStore.delete(key);
            } catch (error) {
                console.error(`Unable to clear the SMS contact after order ${orderId} was ready.`, error);
            }
        }
    }
    return jsonResponse(200, { order: updatedOrder, notificationSent, notificationStatus, smsSent });
}
