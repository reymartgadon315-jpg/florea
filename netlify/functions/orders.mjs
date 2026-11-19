import { getStore } from './lib/get-store.mjs';
import { applyOrderToInventory, restoreOrderInventory } from '../../florea-inventory-shared.mjs';
import { getInventoryStore, updateInventory } from './lib/inventory-store.mjs';
import {
    formatOrderItem,
    getOrderTotal,
    validateOrderItems,
    validatePushSubscription
} from './lib/order-validation.mjs';
import { isTwilioSmsConfigured } from './lib/twilio-sms.mjs';
import { maintenanceResponse } from './lib/maintenance.mjs';

export const config = { path: '/api/orders' };

function jsonResponse(statusCode, body) {
    return new Response(JSON.stringify(body), {
        status: statusCode,
        headers: { 'content-type': 'application/json; charset=utf-8' }
    });
}

export default async function handler(request) {
    const maintenance = maintenanceResponse();
    if (maintenance) return maintenance;
    const store = getStore('florea-orders', { consistency: 'strong' });

    if (request.method === 'GET') {
        const orders = [];

        for await (const page of store.list({ prefix: 'order:', paginate: true })) {
            const pageOrders = await Promise.all(
                page.blobs.map(({ key }) => store.get(key, { type: 'json' }))
            );
            orders.push(...pageOrders.filter(Boolean));
        }

        orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return jsonResponse(200, { orders });
    }

    if (request.method !== 'POST') {
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

    const customerName = typeof payload.customerName === 'string'
        ? payload.customerName.trim().slice(0, 80)
        : '';
    const requestId = payload.requestId === undefined ? crypto.randomUUID() : payload.requestId;
    const submittedItems = payload.itemDetails;
    const pushSubscription = payload.pushSubscription;
    const smsOptIn = payload.smsOptIn === true;
    const smsPhone = typeof payload.smsPhone === 'string' ? payload.smsPhone.trim() : '';
    const orderType = payload.orderType === undefined ? 'Not specified' : payload.orderType;
    const specialInstructions = payload.specialInstructions === undefined ? '' : payload.specialInstructions;
    const validatedItems = validateOrderItems(submittedItems);

    if (!customerName) {
        return jsonResponse(400, { error: 'A customer name and at least one valid item are required.' });
    }
    if (typeof requestId !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
        return jsonResponse(400, { error: 'A valid order request ID is required.' });
    }
    if (!['Dine-in', 'Takeout', 'Not specified'].includes(orderType) ||
        typeof specialInstructions !== 'string' || specialInstructions.length > 500) {
        return jsonResponse(400, { error: 'Order type or special instructions are invalid.' });
    }
    if (validatedItems.error) {
        return jsonResponse(400, { error: validatedItems.error });
    }
    if (smsOptIn && !/^\+[1-9]\d{7,14}$/.test(smsPhone)) {
        return jsonResponse(400, { error: 'Enter a valid phone number in international format to receive SMS updates.' });
    }
    if (!validatePushSubscription(pushSubscription).valid) {
        return jsonResponse(400, { error: 'The notification subscription is invalid.' });
    }

    const itemDetails = validatedItems.itemDetails;
    const orderId = `ORD-${requestId}`;
    const orderKey = `order:${orderId}`;
    const existingOrder = await store.get(orderKey, { type: 'json' });
    if (existingOrder) {
        if (existingOrder.requestId === requestId) {
            return jsonResponse(200, {
                order: existingOrder,
                notificationConfigured: false,
                smsConfigured: false
            });
        }
        return jsonResponse(409, { error: 'This order request ID has already been used.' });
    }

    const order = {
        id: orderId,
        requestId,
        customerName,
        items: itemDetails.map(formatOrderItem),
        itemDetails,
        total: getOrderTotal(itemDetails),
        table: 'Walk-in',
        orderType,
        specialInstructions: specialInstructions.trim(),
        paymentMethod: '',
        paymentStatus: 'pending',
        timestamp: new Date().toISOString(),
        additionIds: [],
        status: 'new'
    };

    const inventoryStore = getInventoryStore();
    const deduction = await updateInventory(inventory => {
        const result = applyOrderToInventory(inventory, order.id, itemDetails);
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
                error: `Not enough stock to place this order. ${shortageText}`,
                shortages: deduction.shortages
            });
        }
        return jsonResponse(409, { error: deduction.error || 'One or more items are not configured in shared inventory.' });
    }

    try {
        const saved = await store.setJSON(orderKey, order, { onlyIfNew: true });
        if (!saved.modified) {
            const duplicate = await store.get(orderKey, { type: 'json' });
            if (duplicate?.requestId === requestId) {
                return jsonResponse(200, {
                    order: duplicate,
                    notificationConfigured: false,
                    smsConfigured: false
                });
            }
            throw new Error(`Order ${order.id} already exists.`);
        }
    } catch (error) {
        let duplicate;
        try {
            duplicate = await store.get(orderKey, { type: 'json' });
        } catch (readError) {
            console.error(`Unable to verify whether order ${order.id} was already saved.`, readError);
        }
        if (duplicate?.requestId === requestId) {
            return jsonResponse(200, {
                order: duplicate,
                notificationConfigured: false,
                smsConfigured: false
            });
        }
        const rollback = await updateInventory(inventory => {
            const result = restoreOrderInventory(inventory, order.id, itemDetails);
            if (!result.success || result.alreadyRestored) {
                return { changed: false, ...result };
            }
            return { changed: true, inventory: result.inventory, ...result };
        }, inventoryStore);
        if (!rollback.success) {
            console.error(`Unable to restore inventory after order persistence failed for ${order.id}.`, rollback.error);
        }
        console.error(`Unable to save order ${order.id}.`, error);
        return jsonResponse(500, { error: 'The order could not be saved. Any stock deduction was reverted where possible.' });
    }
    let notificationConfigured = false;
    if (pushSubscription) {
        try {
            const notificationStore = getStore('florea-order-notifications', { consistency: 'strong' });
            await notificationStore.setJSON(`order:${order.id}`, pushSubscription);
            notificationConfigured = true;
        } catch (error) {
            console.error(`Unable to save notification subscription for ${order.id}.`, error);
        }
    }
    let smsConfigured = false;
    if (smsOptIn && isTwilioSmsConfigured()) {
        try {
            const smsStore = getStore('florea-order-sms', { consistency: 'strong' });
            await smsStore.setJSON(`order:${order.id}`, { phone: smsPhone });
            smsConfigured = true;
        } catch (error) {
            console.error(`Unable to save SMS contact for ${order.id}.`, error);
        }
    }
    return jsonResponse(201, { order, notificationConfigured, smsConfigured });
}
