(function () {
    let orders = [];
    let cashierFilter = 'overview';
    let cashierNotifications = [];
    let customerFeedback = [];
    let initialized = false;
    let syncing = false;
    let syncingCustomerFeedback = false;
    let hasSyncError = false;
    let hasFeedbackSyncError = false;
    let syncTimer = null;
    let sessionTimer = null;

    const cashierScreen = document.getElementById('cashier-dashboard');
    const newOrdersList = document.getElementById('new-orders-list-dash');
    const activeOrdersList = document.getElementById('active-orders-list-dash');
    const readyOrdersList = document.getElementById('ready-orders-list-dash');
    const pendingCountEl = document.getElementById('pending-count-dash');
    const preparingCountEl = document.getElementById('preparing-count-dash');
    const readyCountEl = document.getElementById('ready-count-dash');
    const liveCountEl = document.getElementById('live-count-dash');
    const currentTimeEl = document.getElementById('current-time-dash');

    function escapeText(value) {
        return FloreaOrderSync.escapeText(String(value == null ? '' : value));
    }

    function orderStatus(order) {
        return order.status === 'pending' ? 'new' : order.status;
    }

    function parseAmount(value) {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        const amount = Number(String(value == null ? '' : value).replace(/[^\d.-]/g, ''));
        return Number.isFinite(amount) ? amount : 0;
    }

    function formatCurrency(value) {
        return `₱${parseAmount(value).toLocaleString('en-PH', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })}`;
    }

    function formatDate(value) {
        const date = new Date(value);
        return Number.isNaN(date.getTime())
            ? 'Time unavailable'
            : date.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
    }

    function orderTypeLabel(order) {
        return typeof order.orderType === 'string' && order.orderType
            ? order.orderType
            : 'Not specified';
    }

    function paymentLabel(order) {
        if (order.paymentStatus === 'paid') {
            return `Paid${order.paymentMethod ? ` · ${order.paymentMethod}` : ''}`;
        }
        return order.paymentStatus === 'pending' ? 'Pending verification' : 'Not recorded';
    }

    function actionMarkup(order, modalMode) {
        const status = orderStatus(order);
        const escapedId = escapeText(order.id);
        const actions = [];
        if (status === 'new') {
            actions.push(`<button type="button" class="cashier-action-button is-primary" data-order-action="preparing" data-order-id="${escapedId}">Confirm Order</button>`);
        } else if (status === 'preparing') {
            actions.push(`<button type="button" class="cashier-action-button is-primary" data-order-action="ready" data-order-id="${escapedId}">Mark as Ready</button>`);
        } else if (status === 'ready') {
            const unpaid = order.paymentStatus !== 'paid';
            actions.push(`<button type="button" class="cashier-action-button is-primary" data-order-action="completed" data-order-id="${escapedId}"${unpaid ? ' disabled title="Verify payment before completing"' : ''}>Complete Order</button>`);
        }
        if (!['completed', 'cancelled'].includes(status)) {
            actions.push(`<button type="button" class="cashier-action-button is-danger" data-order-action="cancelled" data-order-id="${escapedId}">Cancel Order</button>`);
        }

        const payment = order.paymentStatus !== 'paid' && status !== 'cancelled'
            ? `<div class="cashier-order-card__payment">
                <select aria-label="Payment method for ${escapedId}" data-payment-method>
                    <option value="Cash">Cash</option><option value="GCash">GCash</option><option value="Card">Card</option><option value="Other">Other</option>
                </select>
                <button type="button" class="cashier-action-button" data-order-action="verifyPayment" data-order-id="${escapedId}">Verify Payment</button>
            </div>`
            : '';
        const viewButton = modalMode ? '' : `<button type="button" class="cashier-action-button" data-order-view="${escapedId}">View Details</button>`;
        return `${payment}${actions.length || viewButton ? `<div class="cashier-order-card__actions">${viewButton}${actions.join('')}</div>` : ''}`;
    }

    function createOrderCard(order) {
        const status = orderStatus(order);
        const orderId = escapeText(order.id || 'Order');
        const customer = escapeText(order.customerName || 'Guest');
        const paymentClass = order.paymentStatus === 'paid' ? 'is-paid' :
            order.paymentStatus === 'pending' ? 'is-pending' : '';
        const instructions = typeof order.specialInstructions === 'string' && order.specialInstructions.trim()
            ? `<p class="cashier-order-card__instructions"><b>Note:</b> ${escapeText(order.specialInstructions.trim())}</p>`
            : '';
        return `
            <article class="cashier-order-card" data-status="${escapeText(status)}" data-order-id="${orderId}">
                <div class="cashier-order-card__top">
                    <div class="cashier-order-card__customer">${customer}</div>
                    <span class="cashier-status-badge">${escapeText(status)}</span>
                </div>
                <div class="cashier-order-card__time">${escapeText(formatDate(order.timestamp))}</div>
                <div class="cashier-order-card__meta">
                    <span>${escapeText(orderTypeLabel(order))}</span>
                    <span class="cashier-payment-badge ${paymentClass}">${escapeText(paymentLabel(order))}</span>
                </div>
                <div class="order-items">${FloreaOrderSync.renderOrderItems(order)}</div>
                ${instructions}
                <div class="cashier-order-card__footer"><span class="cashier-order-card__total">${formatCurrency(order.total)}</span><span class="cashier-order-card__time">${escapeText(order.table || '')}</span></div>
                ${actionMarkup(order, false)}
            </article>
        `;
    }

    function renderOrderGroup(element, groupOrders, emptyMessage) {
        element.innerHTML = groupOrders.length
            ? groupOrders.map(createOrderCard).join('')
            : `<div class="cashier-empty-state">${escapeText(emptyMessage)}</div>`;
    }

    function renderOrders() {
        const newOrders = orders.filter(order => orderStatus(order) === 'new');
        const activeOrders = orders.filter(order => orderStatus(order) === 'preparing');
        const readyOrders = orders.filter(order => orderStatus(order) === 'ready');
        document.getElementById('cashier-new-group-count').textContent = String(newOrders.length);
        document.getElementById('cashier-active-group-count').textContent = String(activeOrders.length);
        document.getElementById('cashier-ready-group-count').textContent = String(readyOrders.length);
        document.getElementById('cashier-order-count').textContent = String(orders.length);
        renderOrderGroup(newOrdersList, newOrders, 'No new orders yet.');
        renderOrderGroup(activeOrdersList, activeOrders, 'No orders are being prepared.');
        renderOrderGroup(readyOrdersList, readyOrders, 'No orders are ready for pickup.');

        const search = document.getElementById('cashier-order-search').value.trim().toLocaleLowerCase();
        const filtering = cashierFilter !== 'overview' || Boolean(search);
        const workboard = document.getElementById('cashier-order-workboard');
        const filteredView = document.getElementById('cashier-filtered-view');
        workboard.hidden = filtering;
        filteredView.hidden = !filtering;
        if (!filtering) return;

        const visibleOrders = orders.filter(order => {
            const status = orderStatus(order);
            const matchesFilter = cashierFilter === 'all' || cashierFilter === 'overview' || status === cashierFilter;
            const matchesSearch = !search ||
                String(order.id || '').toLocaleLowerCase().includes(search) ||
                String(order.customerName || '').toLocaleLowerCase().includes(search);
            return matchesFilter && matchesSearch;
        });
        const filterNames = {
            all: 'All Orders', new: 'New Orders', preparing: 'Preparing',
            ready: 'Ready for Pickup', completed: 'Completed Orders', cancelled: 'Cancelled Orders'
        };
        document.getElementById('cashier-filter-heading').textContent = filterNames[cashierFilter] || 'Search Results';
        document.getElementById('cashier-filtered-count').textContent = String(visibleOrders.length);
        renderOrderGroup(document.getElementById('cashier-filtered-list'), visibleOrders, 'No matching orders found.');
    }

    function setCashierFilter(filter) {
        cashierFilter = filter;
        document.querySelectorAll('[data-cashier-filter]').forEach(button => {
            button.classList.toggle('is-active', button.dataset.cashierFilter === filter);
        });
        renderOrders();
        document.getElementById('cashier-order-management').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function showFeedback(message, isError) {
        const feedback = document.getElementById('cashier-feedback');
        feedback.textContent = message;
        feedback.classList.toggle('is-error', Boolean(isError));
        feedback.hidden = false;
        window.clearTimeout(showFeedback.timeout);
        showFeedback.timeout = window.setTimeout(() => { feedback.hidden = true; }, 6000);
    }

    function setOrders(nextOrders) {
        orders = nextOrders.map(order => ({ ...order }));
        window.orders = orders;
        const topOrder = orders[0];
        if (topOrder && topOrder.customerName && typeof window.renderLiveOrderManagementRow === 'function') {
            window.renderLiveOrderManagementRow(topOrder);
        }
    }

    function isPaidCompletedOrder(order) {
        return orderStatus(order) === 'completed' && order.paymentStatus === 'paid';
    }

    function completionDate(order) {
        return order.completedAt || order.updatedAt || order.timestamp;
    }

    function updateTransactionSummary() {
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const paidToday = orders.filter(order => {
            const completed = new Date(completionDate(order));
            const localDate = `${completed.getFullYear()}-${String(completed.getMonth() + 1).padStart(2, '0')}-${String(completed.getDate()).padStart(2, '0')}`;
            return isPaidCompletedOrder(order) && !Number.isNaN(completed.getTime()) && localDate === today;
        });
        const recent = orders.filter(isPaidCompletedOrder)
            .sort((left, right) => new Date(completionDate(right)) - new Date(completionDate(left)))
            .slice(0, 8);
        const sales = paidToday.reduce((sum, order) => sum + parseAmount(order.total), 0);
        document.getElementById('cashier-sales-count').textContent = formatCurrency(sales);
        document.getElementById('cashier-sales-transactions').textContent = String(paidToday.length);
        document.getElementById('cashier-today-sales').textContent = formatCurrency(sales);
        document.getElementById('cashier-today-count').textContent = String(paidToday.length);
        document.getElementById('cashier-recent-count').textContent = String(recent.length);
        document.getElementById('cashier-today-label').textContent = now.toLocaleDateString('en-PH', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        });
        document.getElementById('cashier-recent-transactions').innerHTML = recent.length
            ? recent.map(order => `
                <div class="cashier-transaction-row">
                    <div><strong>${escapeText(order.id)} · ${escapeText(order.customerName || 'Guest')}</strong><small>${escapeText(formatDate(completionDate(order)))} · ${escapeText(order.paymentMethod || 'Payment method not recorded')}</small></div>
                    <span class="cashier-transaction-row__amount">${formatCurrency(order.total)}</span>
                </div>
            `).join('')
            : '<div class="cashier-empty-state">No completed and paid transactions today.</div>';
    }

    function isValidFeedbackList(value) {
        return Array.isArray(value) && value.every(item =>
            item && typeof item === 'object' &&
            typeof item.customerName === 'string' &&
            typeof item.message === 'string' &&
            typeof item.createdAt === 'string'
        );
    }

    function renderCustomerFeedback(errorMessage = '') {
        const count = document.getElementById('cashier-customer-feedback-count');
        const navCount = document.getElementById('cashier-feedback-nav-count');
        const list = document.getElementById('cashier-customer-feedback-list');
        count.textContent = String(customerFeedback.length);
        navCount.textContent = customerFeedback.length > 99 ? '99+' : String(customerFeedback.length);
        if (errorMessage) {
            list.innerHTML = `<div class="cashier-empty-state">${escapeText(errorMessage)}</div>`;
            return;
        }
        list.innerHTML = customerFeedback.length
            ? customerFeedback.map(item => `
                <article class="cashier-customer-feedback-card">
                    <div class="cashier-customer-feedback-card__header">
                        <strong>${escapeText(item.customerName || 'Guest')}</strong>
                        <time datetime="${escapeText(item.createdAt || '')}">${escapeText(formatDate(item.createdAt))}</time>
                    </div>
                    <p class="cashier-customer-feedback-card__message">${escapeText(item.message || '')}</p>
                </article>
            `).join('')
            : '<div class="cashier-empty-state">No customer feedback yet. New messages will appear here.</div>';
    }

    async function syncCustomerFeedback() {
        if (!initialized || syncingCustomerFeedback ||
            !cashierScreen.classList.contains('active')) return;
        syncingCustomerFeedback = true;
        try {
            const nextFeedback = usesLocalOrderStorage()
                ? JSON.parse(localStorage.getItem('florea-customer-feedback') || '[]')
                : (await FloreaOrderSync.request('/api/feedback')).feedback;
            if (!isValidFeedbackList(nextFeedback)) {
                throw new Error('The feedback service returned an invalid list.');
            }
            if (!initialized) return;
            customerFeedback = nextFeedback;
            renderCustomerFeedback();
            hasFeedbackSyncError = false;
        } catch (error) {
            if (!hasFeedbackSyncError) {
                console.error('Unable to sync customer feedback.', error);
                hasFeedbackSyncError = true;
            }
            renderCustomerFeedback(`Feedback could not be loaded. ${error.message}`);
        } finally {
            syncingCustomerFeedback = false;
        }
    }

    function updateStats() {
        pendingCountEl.textContent = String(orders.filter(order => ['new', 'pending'].includes(order.status)).length);
        preparingCountEl.textContent = String(orders.filter(order => order.status === 'preparing').length);
        readyCountEl.textContent = String(orders.filter(order => order.status === 'ready').length);
        liveCountEl.textContent = String(orders.filter(order => !['completed', 'cancelled'].includes(order.status)).length);
        updateTransactionSummary();
    }

    function playAlertSound() {
        if (window.FloreaCashierSound && typeof window.FloreaCashierSound.play === 'function') {
            window.FloreaCashierSound.play();
        }
    }

    function addNotification(type, order) {
        const messages = {
            new: `New order ${order.id} from ${order.customerName || 'a customer'}.`,
            payment: `Payment verified for order ${order.id}.`,
            ready: `Order ${order.id} is ready for pickup.`,
            cancelled: `Order ${order.id} was cancelled.`
        };
        cashierNotifications.unshift({
            id: `${type}:${order.id}:${Date.now()}`,
            type,
            message: messages[type],
            orderId: order.id,
            createdAt: new Date().toISOString(),
            read: false
        });
        cashierNotifications = cashierNotifications.slice(0, 30);
        renderNotifications();
        playAlertSound();
    }

    function trackChanges(nextOrders) {
        const previousById = new Map(orders.map(order => [String(order.id), order]));
        nextOrders.forEach(order => {
            const previous = previousById.get(String(order.id));
            if (!previous) {
                if (orderStatus(order) === 'new') addNotification('new', order);
                return;
            }
            if (previous.paymentStatus !== 'paid' && order.paymentStatus === 'paid') addNotification('payment', order);
            if (orderStatus(previous) !== 'ready' && orderStatus(order) === 'ready') addNotification('ready', order);
            if (orderStatus(previous) !== 'cancelled' && orderStatus(order) === 'cancelled') addNotification('cancelled', order);
        });
    }

    function renderNotifications() {
        const unread = cashierNotifications.filter(notification => !notification.read).length;
        const count = document.getElementById('cashier-notification-count');
        count.textContent = String(unread);
        count.hidden = unread === 0;
        document.getElementById('cashier-notifications-list').innerHTML = cashierNotifications.length
            ? cashierNotifications.map(notification => `
                <div class="cashier-notification-row${notification.read ? '' : ' is-unread'}">
                    <div><strong>${escapeText(notification.message)}</strong><small>${escapeText(formatDate(notification.createdAt))}</small></div>
                    <button type="button" class="cashier-action-button" data-order-view="${escapeText(notification.orderId)}">View Order</button>
                </div>
            `).join('')
            : '<div class="cashier-empty-state">No notifications yet. New orders and status updates will appear here.</div>';
    }

    function toggleNotifications() {
        const panel = document.getElementById('cashier-notifications-panel');
        panel.hidden = !panel.hidden;
        if (!panel.hidden) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function markNotificationsRead() {
        cashierNotifications.forEach(notification => { notification.read = true; });
        renderNotifications();
    }

    function updateTime() {
        currentTimeEl.textContent = new Date().toLocaleTimeString('en-PH', {
            hour: '2-digit', minute: '2-digit'
        });
    }

    function openOrderModal(orderId) {
        const order = orders.find(item => String(item.id) === String(orderId));
        if (!order) return;
        document.getElementById('modal-order-id').textContent = order.id;
        document.getElementById('modal-table').textContent = order.table || 'Not specified';
        document.getElementById('modal-customer').textContent = order.customerName || 'Guest';
        document.getElementById('modal-order-type').textContent = orderTypeLabel(order);
        document.getElementById('modal-time').textContent = formatDate(order.timestamp);
        document.getElementById('modal-items').innerHTML = FloreaOrderSync.renderOrderItems(order, '56px');
        document.getElementById('modal-special-instructions').textContent =
            typeof order.specialInstructions === 'string' && order.specialInstructions.trim()
                ? order.specialInstructions.trim()
                : 'None';
        document.getElementById('modal-total').textContent = formatCurrency(order.total);
        document.getElementById('modal-status').textContent = orderStatus(order);
        document.getElementById('modal-payment').textContent = paymentLabel(order);
        document.getElementById('modal-actions').innerHTML = actionMarkup(order, true);
        document.getElementById('order-detail-modal').style.display = 'flex';
    }

    function closeOrderModal() {
        document.getElementById('order-detail-modal').style.display = 'none';
    }

    function resetCashierDashboard() {
        initialized = false;
        syncing = false;
        if (syncTimer !== null) window.clearInterval(syncTimer);
        if (sessionTimer !== null) window.clearInterval(sessionTimer);
        syncTimer = null;
        sessionTimer = null;
        cashierNotifications = [];
        customerFeedback = [];
        hasFeedbackSyncError = false;
        orders = [];
        window.orders = orders;
        cashierFilter = 'overview';
        document.getElementById('cashier-order-search').value = '';
        document.getElementById('cashier-notifications-panel').hidden = true;
        document.querySelectorAll('.cashier-navigation [data-cashier-nav]').forEach(button => {
            button.classList.toggle('is-active', button.dataset.cashierNav === 'dashboard');
        });
        document.querySelectorAll('[data-cashier-filter]').forEach(button => button.classList.remove('is-active'));
        closeOrderModal();
        renderNotifications();
        renderCustomerFeedback();
        renderOrders();
        updateStats();
    }

    async function verifySession() {
        if (typeof usesLocalOrderStorage === 'function' && usesLocalOrderStorage()) return true;
        try {
            await FloreaOrderSync.request('/api/cashier-auth');
            return true;
        } catch (error) {
            setAuthenticated('cashier', false);
            window.cashierInitialized = false;
            const loginError = document.getElementById('cashier-login-error');
            if (loginError) {
                loginError.textContent = `Your cashier session ended. Sign in again. ${error.message}`;
                loginError.dataset.state = 'error';
                loginError.hidden = false;
            }
            window.go('cashier-login');
            return false;
        }
    }

    async function initCashier() {
        if (initialized) return;
        if (!await verifySession()) return;
        initialized = true;
        showFeedback('Loading saved orders...');
        try {
            if (usesLocalOrderStorage()) {
                setOrders(JSON.parse(localStorage.getItem('florea-cashier-orders') || '[]'));
            } else {
                const result = await FloreaOrderSync.request('/api/orders');
                setOrders(result.orders);
            }
            renderNotifications();
            renderOrders();
            updateStats();
            updateTime();
            hasSyncError = false;
            document.getElementById('cashier-feedback').hidden = true;
        } catch (error) {
            console.error('Unable to load cashier orders.', error);
            hasSyncError = true;
            showFeedback(`Orders could not be loaded. ${error.message}`, true);
        } finally {
            void syncCustomerFeedback();
            if (syncTimer === null) {
                syncTimer = window.setInterval(() => {
                    void syncOrders();
                    void syncCustomerFeedback();
                }, 3000);
            }
            if (sessionTimer === null) sessionTimer = window.setInterval(verifySession, 60000);
        }
    }

    function isAllowedLocalTransition(order, nextStatus) {
        const status = orderStatus(order);
        return (status === 'new' && nextStatus === 'preparing') ||
            (status === 'preparing' && nextStatus === 'ready') ||
            (status === 'ready' && nextStatus === 'completed' && order.paymentStatus === 'paid') ||
            (['new', 'preparing', 'ready'].includes(status) && nextStatus === 'cancelled');
    }

    async function saveOrderStatus(orderId, nextStatus) {
        const order = orders.find(item => String(item.id) === String(orderId));
        if (!order) throw new Error('This order is no longer available. Refresh and try again.');
        if (!usesLocalOrderStorage()) {
            return FloreaOrderSync.request(`/api/orders/${encodeURIComponent(orderId)}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: nextStatus })
            });
        }
        if (!isAllowedLocalTransition(order, nextStatus)) {
            throw new Error('This order cannot move to the requested status.');
        }
        let restoredInventory = false;
        if (nextStatus === 'cancelled') {
            const result = await window.FloreaInventory.restoreLocalOrder(order.id, order.itemDetails || []);
            if (!result.success) throw new Error(result.error || 'Inventory could not be restored.');
            restoredInventory = !result.alreadyRestored;
        }
        const updatedOrder = {
            ...order,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
            ...(nextStatus === 'completed' ? { completedAt: new Date().toISOString() } : {}),
            ...(nextStatus === 'cancelled' ? { cancelledAt: new Date().toISOString() } : {})
        };
        const updatedOrders = orders.map(item => item.id === order.id ? updatedOrder : item);
        try {
            localStorage.setItem('florea-cashier-orders', JSON.stringify(updatedOrders));
        } catch (error) {
            if (restoredInventory) {
                const compensation = await window.FloreaInventory.applyLocalOrder(order.id, order.itemDetails || []);
                if (!compensation.success) {
                    console.error('Unable to restore the stock deduction after the cancellation could not be saved.', compensation.error);
                }
            }
            throw error;
        }
        return { order: updatedOrder };
    }

    async function verifyPayment(orderId, paymentMethod) {
        const order = orders.find(item => String(item.id) === String(orderId));
        if (!order) throw new Error('This order is no longer available. Refresh and try again.');
        if (!['Cash', 'GCash', 'Card', 'Other'].includes(paymentMethod)) {
            throw new Error('Choose a valid payment method.');
        }
        if (order.paymentStatus === 'paid') {
            if (order.paymentMethod === paymentMethod) return { order };
            throw new Error('Payment is already verified and cannot be changed.');
        }
        if (!usesLocalOrderStorage()) {
            return FloreaOrderSync.request(`/api/orders/${encodeURIComponent(orderId)}`, {
                method: 'PATCH',
                body: JSON.stringify({ action: 'verifyPayment', paymentMethod })
            });
        }
        if (orderStatus(order) === 'cancelled') throw new Error('Cancelled orders cannot be marked as paid.');
        const updatedOrder = {
            ...order,
            paymentStatus: 'paid',
            paymentMethod,
            paymentVerifiedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const updatedOrders = orders.map(item => item.id === order.id ? updatedOrder : item);
        localStorage.setItem('florea-cashier-orders', JSON.stringify(updatedOrders));
        return { order: updatedOrder };
    }

    async function handleOrderAction(event) {
        const button = event.target.closest('[data-order-action]');
        if (!button || button.disabled) return;
        event.preventDefault();
        event.stopPropagation();
        button.disabled = true;
        const orderId = button.dataset.orderId;
        const action = button.dataset.orderAction;
        try {
            if (action === 'cancelled' &&
                !window.confirm(`Cancel order ${orderId}? Its reserved inventory will be returned to stock.`)) {
                return;
            }
            let result;
            if (action === 'verifyPayment') {
                const container = button.closest('.cashier-order-card') || button.closest('#modal-actions');
                result = await verifyPayment(orderId, container.querySelector('[data-payment-method]').value);
            } else {
                result = await saveOrderStatus(orderId, action);
            }
            const updatedOrder = result && result.order;
            if (!updatedOrder) throw new Error('The server did not return the updated order.');
            trackChanges(orders.map(order => order.id === updatedOrder.id ? updatedOrder : order));
            setOrders(orders.map(order => order.id === updatedOrder.id ? updatedOrder : order));
            renderOrders();
            updateStats();
            if (action === 'preparing') showFeedback(`Order ${orderId} confirmed and marked as preparing.`);
            else if (action === 'ready') {
                showFeedback(`Order ${orderId} is ready for pickup.`);
                if (!usesLocalOrderStorage() && !result.notificationSent) {
                    const message = result.notificationStatus === 'not_subscribed'
                        ? 'No customer phone notification subscription is saved for this order.'
                        : result.notificationStatus === 'failed'
                            ? 'The customer push notification could not be delivered.'
                            : '';
                    if (message) showFeedback(`Order ${orderId} is ready. ${message}`, true);
                }
            } else if (action === 'completed') showFeedback(`Order ${orderId} completed and saved to transactions.`);
            else if (action === 'cancelled') showFeedback(`Order ${orderId} cancelled; stock was restored.`);
            else if (action === 'verifyPayment') showFeedback(`Payment verified for order ${orderId}.`);
            if (document.getElementById('order-detail-modal').style.display === 'flex') openOrderModal(orderId);
        } catch (error) {
            console.error('Unable to update cashier order.', error);
            showFeedback(error.message || 'The order could not be updated.', true);
        } finally {
            if (button.isConnected) button.disabled = false;
        }
    }

    async function syncOrders() {
        if (!initialized || syncing || !document.getElementById('cashier-dashboard').classList.contains('active')) return;
        syncing = true;
        try {
            const nextOrders = usesLocalOrderStorage()
                ? JSON.parse(localStorage.getItem('florea-cashier-orders') || '[]')
                : (await FloreaOrderSync.request('/api/orders')).orders;
            const changed = JSON.stringify(orders) !== JSON.stringify(nextOrders);
            if (changed) trackChanges(nextOrders);
            if (changed || hasSyncError) {
                setOrders(nextOrders);
                renderOrders();
                updateStats();
                document.getElementById('cashier-feedback').hidden = true;
            }
            hasSyncError = false;
        } catch (error) {
            if (!hasSyncError) {
                console.error('Unable to sync cashier orders.', error);
                showFeedback(`Order updates could not be refreshed. ${error.message}`, true);
                hasSyncError = true;
            }
        } finally {
            syncing = false;
        }
    }

    cashierScreen.addEventListener('click', event => {
        const refreshFeedbackButton = event.target.closest('[data-cashier-feedback-refresh]');
        if (refreshFeedbackButton) {
            void syncCustomerFeedback();
            return;
        }
        const filterButton = event.target.closest('[data-cashier-filter]');
        if (filterButton) {
            setCashierFilter(filterButton.dataset.cashierFilter);
            return;
        }
        const navButton = event.target.closest('[data-cashier-nav]');
        if (navButton) {
            const section = navButton.dataset.cashierNav;
            document.querySelectorAll('.cashier-navigation [data-cashier-nav]').forEach(button => {
                button.classList.toggle('is-active', button === navButton);
            });
            if (section === 'orders') {
                document.getElementById('cashier-order-management').scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (section === 'transactions') {
                document.getElementById('cashier-transactions').scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (section === 'history') {
                setCashierFilter('completed');
            } else if (section === 'notifications') {
                document.getElementById('cashier-notifications-panel').hidden = false;
                document.getElementById('cashier-notifications-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (section === 'feedback') {
                document.getElementById('cashier-customer-feedback').scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            return;
        }
        const viewButton = event.target.closest('[data-order-view]');
        if (viewButton) {
            openOrderModal(viewButton.dataset.orderView);
            return;
        }
        if (event.target.closest('[data-order-action]')) handleOrderAction(event);
    });

    document.getElementById('modal-actions').addEventListener('click', handleOrderAction);
    document.getElementById('cashier-order-search').addEventListener('input', renderOrders);
    document.getElementById('order-detail-modal').addEventListener('click', event => {
        if (event.target.id === 'order-detail-modal') closeOrderModal();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeOrderModal();
    });
    window.addEventListener('storage', event => {
        if (!initialized) return;
        if (event.key === 'florea-customer-feedback' && usesLocalOrderStorage()) {
            try {
                const nextFeedback = JSON.parse(event.newValue || '[]');
                if (!isValidFeedbackList(nextFeedback)) throw new Error('Saved customer feedback has an invalid format.');
                customerFeedback = nextFeedback;
                renderCustomerFeedback();
            } catch (error) {
                console.error('Unable to refresh customer feedback from local storage.', error);
                renderCustomerFeedback(`Feedback could not be loaded. ${error.message}`);
            }
            return;
        }
        if (event.key !== 'florea-cashier-orders') return;
        try {
            const nextOrders = JSON.parse(event.newValue || '[]');
            trackChanges(nextOrders);
            setOrders(nextOrders);
            renderOrders();
            updateStats();
        } catch (error) {
            console.error('Unable to refresh cashier orders from local storage.', error);
        }
    });

    window.toggleCashierNotifications = toggleNotifications;
    window.markCashierNotificationsRead = markNotificationsRead;
    window.openOrderModal = openOrderModal;
    window.closeOrderModal = closeOrderModal;
    window.resetCashierDashboard = resetCashierDashboard;
    window.renderOrdersDash = renderOrders;
    window.updateStatsDash = updateStats;
    window.initCashier = initCashier;
    window.goToCashierFilter = setCashierFilter;

    const originalGo = window.go;
    window.go = function (screenId) {
        originalGo(screenId);
        if (screenId === 'cashier-dashboard' &&
            document.getElementById('cashier-dashboard').classList.contains('active') &&
            !window.cashierInitialized) {
            window.cashierInitialized = true;
            window.setTimeout(initCashier, 100);
        }
    };

    if (syncTimer) window.clearInterval(syncTimer);
    if (sessionTimer) window.clearInterval(sessionTimer);
})();
