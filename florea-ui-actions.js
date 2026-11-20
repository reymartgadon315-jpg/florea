(() => {
        const catalogStorageKey = 'florea-product-catalog';
        const stockStorageKey = 'florea-inventory-stock';
        const sharedInventoryStorageKey = 'florea-inventory-state';
        const profileStorageKey = 'florea-store-profile';
        const products = window.FloreaProducts;
        const categories = window.FloreaCategories;
        const defaultCategoryOrder = [...categories];
        const defaultProducts = Object.fromEntries(Object.entries(products).map(([category, items]) => [category, items.map(item => ({...item }))]));
        const legacyMenuDescriptions = new Set([
            '12 peonies, eucalyptus, baby\'s breath',
            'Mixed Dutch tulips in a box',
            'Classic hand-tied bunch',
            'Espresso + Water',
            'Espresso + Milk + Condensed Milk',
            'Espresso + Caramel Syrup + Milk + Cold Foam',
            'Espresso + Condensed Milk + Water',
            'Espresso + Vanilla + Cinnamon + Milk',
            'Espresso + Chocolate + Milk',
            'Whipped Foam Coffee + Milk + Sugar',
            'Espresso + Mojito + Mint (No Alcohol)',
            'Espresso + White Choco + Milk',
            'Espresso + French Vanilla + Milk',
            'Media 69 · Grande 79',
            'Media 79 · Grande 89',
            'Media 99 · Grande 109',
            'Grilled pork liempo in kare sauce, rice',
            'Honey butter glazed chicken bowl',
            'Breaded liempo over sizzling rice',
            'Sautéed noodles, mixed vegetables',
            'Served with rice and fresh veggies',
            'Crispy shrimp fritters with slaw',
            'Chicken tonkotsu with rice',
            'Sizzling bulalo kare with rice',
            'Sizzling sweet and sour squid with rice',
            'Breaded pork chop served sizzling with rice',
            'Breaded chicken wings with rice',
            'Shrimp fritters served with rice',
            'Salmon steak served with rice',
            'Pork katsudon with rice',
            'Chicken shawarma served with rice',
            'Crispy chicken kare with rice',
            'Crispy chicken served with rice',
            'Chicken ala king served with rice',
            'Fries topped with chicken shawarma',
            'Chicken burrito wrap',
            'Crispy shrimp fritters',
            'Seasoned potato wedges with dip',
            'Clubhouse sandwich served with fries',
            'Double patty burger served with fries',
            'Fresh vegetable salad',
            'Crispy chicken onion rings with dip',
            'Chicken dumplings',
            'Creamy chicken Alfredo pasta',
            'Garlic and olive oil pasta',
            'Binagoongan-style pasta',
            'Burnt Basque cheesecake, slice'
        ]);
        let editingProduct = null;
        let editingCategory = '';
        let productEditorImagePicker;
        let localInventoryModule;
        let inventoryRefreshInProgress = false;
        let adminOrders = [];
        let adminInventory = null;
        let adminOrdersRefreshInProgress = false;

        function escapeHtml(value) {
            return String(value).replace(/[&<>"']/g, character => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[character]);
        }

        function showToast(message) {
            let toast = document.getElementById('florea-action-toast');
            if (!toast) {
                toast = document.createElement('div');
                toast.id = 'florea-action-toast';
                toast.setAttribute('role', 'status');
                toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:3000;background:#24392D;color:#fff;padding:12px 18px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.2);font:600 13px Inter,sans-serif;max-width:min(90vw,520px);';
                document.body.appendChild(toast);
            }
            toast.textContent = message;
            toast.hidden = false;
            clearTimeout(toast.timeoutId);
            toast.timeoutId = setTimeout(() => { toast.hidden = true; }, 3200);
        }

        async function getLocalInventoryModule() {
            if (!localInventoryModule) localInventoryModule = await
            import ('./florea-inventory-shared.mjs');
            return localInventoryModule;
        }

        function saveLocalInventory(inventory) {
            localStorage.setItem(sharedInventoryStorageKey, JSON.stringify(inventory));
            syncMenuStock(inventory);
            renderInventory(inventory);
        }

        async function getLocalInventory() {
            const shared = await getLocalInventoryModule();
            let inventory;
            try {
                inventory = JSON.parse(localStorage.getItem(sharedInventoryStorageKey) || 'null');
                if (!inventory) {
                    inventory = shared.createInitialInventory();
                    const oldAdjustments = JSON.parse(localStorage.getItem(stockStorageKey) || '{}');
                    inventory.items = inventory.items.map(item => {
                        if (Number.isInteger(oldAdjustments[item.name]) && oldAdjustments[item.name] >= 0) {
                            return {...item, quantity: oldAdjustments[item.name] };
                        }
                        const product = (products[item.category] || []).find(entry => entry.n === item.name);
                        return item.type === 'product' && Number.isInteger(product?.quantity) ?
                            {...item, quantity: product.quantity } :
                            item;
                    });
                }
                const migration = shared.mergeMissingMenuProducts(inventory);
                inventory = migration.inventory;
                if (migration.changed || !localStorage.getItem(sharedInventoryStorageKey)) {
                    localStorage.setItem(sharedInventoryStorageKey, JSON.stringify(inventory));
                }
            } catch (error) {
                console.error('Unable to load local inventory.', error);
                throw new Error(`Could not load saved inventory: ${error.message}`);
            }
            return inventory;
        }

        function formatInventoryQuantity(quantity) {
            return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(2);
        }

        function renderInventory(inventory) {
            const section = document.getElementById('inventory-control');
            const body = document.getElementById('inventory-items');
            if (!section || !body) return;
            const items = Array.isArray(inventory.items) ? inventory.items : [];
            const statuses = items.map(item =>
                item.quantity <= 0 ? 'out' : item.quantity <= item.reorderLevel ? 'low' : 'in'
            );
            document.getElementById('inventory-total-skus').textContent = String(items.length);
            document.getElementById('inventory-in-stock').textContent = String(statuses.filter(status => status === 'in').length);
            document.getElementById('inventory-low-stock').textContent = String(statuses.filter(status => status === 'low').length);
            document.getElementById('inventory-out-of-stock').textContent = String(statuses.filter(status => status === 'out').length);

            body.innerHTML = items.map(item => {
                const status = item.quantity <= 0 ?
                    { label: 'Out of Stock', className: 'badge-danger' } :
                    item.quantity <= item.reorderLevel ?
                    { label: 'Low Stock', className: 'badge-gold' } :
                    { label: 'Healthy', className: 'badge-sage' };
                const updated = item.updatedAt ?
                    new Date(item.updatedAt).toLocaleString() :
                    'Initial estimate';
                return `<tr data-inventory-id="${escapeHtml(item.id)}">
                <td>${escapeHtml(item.name)}</td>
                <td>${escapeHtml(item.category)}</td>
                <td>${formatInventoryQuantity(item.quantity)}</td>
                <td>${escapeHtml(item.unit)}</td>
                <td>${formatInventoryQuantity(item.reorderLevel)}</td>
                <td><span class="badge ${status.className}">${status.label}</span></td>
                <td>${escapeHtml(updated)}</td>
                <td data-no-export><button type="button" class="btn btn-ghost btn-sm" data-ui-action="stock-adjustment" data-item-id="${escapeHtml(item.id)}" data-direction="add">+ Add Stock</button></td>
            </tr>`;
            }).join('') || '<tr><td colspan="8">No inventory items are configured.</td></tr>';
            const filterContainer = document.getElementById('inventory-category-filters');
            if (filterContainer) {
                const activeFilter = filterContainer.querySelector('[data-ui-action="inventory-filter"].active')?.dataset.filter || 'all';
                const inventoryCategories = [...new Set(items.map(item => item.category))];
                filterContainer.innerHTML = ['all', ...inventoryCategories].map(category =>
                    `<button type="button" class="chip${category === activeFilter ? ' active' : ''}" data-ui-action="inventory-filter" data-filter="${escapeHtml(category)}">${category === 'all' ? 'All' : escapeHtml(category)}</button>`
                ).join('');
            }
            const filter = section.querySelector('[data-ui-action="inventory-filter"].active')?.dataset.filter || 'all';
            for (const row of body.rows) {
                row.hidden = filter !== 'all' && row.cells[1]?.textContent.trim().toLowerCase() !== filter.toLowerCase();
            }
            adminInventory = inventory;
            renderAdminViews();
        }

        function syncMenuStock(inventory) {
            for (const item of inventory.items || []) {
                if (item.type !== 'product') continue;
                const product = (products[item.category] || []).find(entry => entry.n === item.name);
                if (!product) continue;
                product.quantity = item.quantity;
                product.stock = item.quantity <= 0 ? 'Sold Out' : (item.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock');
            }
            const stockField = document.querySelector('#product-management [data-product-field="stock"]');
            if (editingProduct && stockField && document.activeElement !== stockField) {
                stockField.value = String(editingProduct.quantity ?? 0);
            }
            if (typeof window.refreshFloreaCatalog === 'function') window.refreshFloreaCatalog();
        }

        async function refreshInventory() {
            if (inventoryRefreshInProgress) return;
            inventoryRefreshInProgress = true;
            try {
                const inventory = FloreaOrderSync.isLocal() ?
                    await getLocalInventory() :
                    (await FloreaOrderSync.request('/api/inventory')).inventory;
                syncMenuStock(inventory);
                renderInventory(inventory);
            } catch (error) {
                console.error('Unable to refresh shared inventory.', error);
                const body = document.getElementById('inventory-items');
                if (body) body.innerHTML = `<tr><td colspan="8">Inventory could not be loaded: ${escapeHtml(error.message)}</td></tr>`;
                if (document.getElementById('inventory-control')?.classList.contains('active')) {
                    showToast(`Inventory update failed: ${error.message}`);
                }
            } finally {
                inventoryRefreshInProgress = false;
            }
        }

        function orderItems(order) {
            if (Array.isArray(order.itemDetails)) return order.itemDetails;
            if (!Array.isArray(order.items)) return [];
            return order.items.map(item => typeof item === 'string' ? {
                name: item.replace(/\s+×\s*\d+\s*$/, ''),
                quantity: Number((item.match(/×\s*(\d+)/) || [])[1]) || 1,
                price: 0
            } : item);
        }

        function orderTotal(order) {
            if (Number.isFinite(order.total)) return order.total;
            const totalText = String(order.total || '').replace(/[^\d.]/g, '');
            const value = totalText ? Number(totalText) : Number.NaN;
            if (Number.isFinite(value)) return value;
            return orderItems(order).reduce((total, item) =>
                total + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
        }

        function orderStatus(order) {
            const status = String(order.status || 'new').toLowerCase();
            if (status === 'completed') return 'ready';
            return status;
        }

        function formatOrderStatus(status) {
            const labels = { new: 'Pending', preparing: 'Preparing', ready: 'Ready', cancelled: 'Cancelled' };
            const classes = { new: 'badge-gold', preparing: 'badge-blush', ready: 'badge-sage', cancelled: 'badge-danger' };
            return `<span class="badge ${classes[status] || 'badge-ink'}">${escapeHtml(labels[status] || status)}</span>`;
        }

        function formatAdminOrderStatus(order) {
            const status = String(order.status || 'new').toLowerCase();
            const labels = {
                new: 'Pending',
                pending: 'Pending',
                confirmed: 'Confirmed',
                preparing: 'Preparing',
                ready: 'Ready',
                completed: 'Completed',
                cancelled: 'Cancelled'
            };
            const classes = {
                new: 'badge-gold',
                pending: 'badge-gold',
                confirmed: 'badge-ink',
                preparing: 'badge-blush',
                ready: 'badge-sage',
                completed: 'badge-sage',
                cancelled: 'badge-danger'
            };
            return `<span class="badge ${classes[status] || 'badge-ink'}">${escapeHtml(labels[status] || status)}</span>`;
        }

        function productInventory(category, name) {
            return adminInventory?.items?.find(item =>
                item.type === 'product' && item.category === category && item.name === name
            );
        }

        function renderProductCatalog() {
            const rows = document.getElementById('product-catalog-rows');
            if (!rows) return;
            const catalogProducts = Object.entries(products).flatMap(([category, items]) =>
                items.map(product => ({ product, category }))
            );
            const categoryRows = document.getElementById('product-category-rows');
            if (categoryRows) {
                categoryRows.innerHTML = categories.map(category =>
                    `<div style="display:flex;justify-content:space-between;padding:7px 2px;font-size:12.5px;"><span>${escapeHtml(category)}</span><span style="color:var(--ink-soft);">${(products[category] || []).length}</span></div>`
                ).join('');
            }
            const count = document.getElementById('product-catalog-count');
            if (count) count.textContent = `${catalogProducts.length} products`;
            const categorySelect = document.querySelector('#product-management [data-product-field="category"]');
            if (categorySelect) {
                const selectedCategory = editingCategory || categorySelect.value;
                categorySelect.innerHTML = categories.map(category =>
                    `<option value="${escapeHtml(category)}"${category === selectedCategory ? ' selected' : ''}>${escapeHtml(category)}</option>`
                ).join('');
            }
            rows.innerHTML = catalogProducts.map(({ product, category }) => {
                const inventory = productInventory(category, product.n);
                const stock = inventory ? inventory.quantity : (Number.isInteger(product.quantity) ? product.quantity : 0);
                const price = (String(product.p).match(/\d+(?:\.\d+)?/) || ['0'])[0];
                const status = stock <= 0 ? '<span class="badge badge-danger">Out of Stock</span>' :
                    stock <= (inventory?.reorderLevel ?? 5) ? '<span class="badge badge-gold">Low Stock</span>' :
                    '<span class="badge badge-sage">In Stock</span>';
                return `<tr>
                    <td>${escapeHtml(product.n)}</td>
                    <td>${escapeHtml(category)}</td>
                    <td>₱${escapeHtml(price)}</td>
                    <td>${formatInventoryQuantity(stock)}</td>
                    <td>${status}</td>
                    <td><button type="button" class="btn btn-ghost btn-sm" data-ui-action="edit-catalog-product" data-category="${escapeHtml(category)}" data-product="${escapeHtml(product.n)}">Edit</button></td>
                </tr>`;
            }).join('') || '<tr><td colspan="6">No catalog products available.</td></tr>';
        }

        function formatAdminCurrency(value) {
            return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        function getOrderDate(order) {
            const value = order.timestamp || order.createdAt || order.created_at;
            if (!value) return null;
            const date = new Date(value);
            return Number.isNaN(date.getTime()) ? null : date;
        }

        function isCancelledOrder(order) {
            return String(order.status || 'new').toLowerCase() === 'cancelled';
        }

        function startOfSalesPeriod(date, period) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            if (period === 'weekly') {
                start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
            } else if (period === 'monthly') {
                start.setDate(1);
            }
            return start;
        }

        function advanceSalesPeriod(date, period) {
            const next = new Date(date);
            if (period === 'weekly') next.setDate(next.getDate() + 7);
            else if (period === 'monthly') next.setMonth(next.getMonth() + 1);
            else next.setDate(next.getDate() + 1);
            return next;
        }

        function parseSalesDate(value, endOfDay = false) {
            if (!value) return null;
            const [year, month, day] = value.split('-').map(Number);
            return new Date(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
        }

        function buildSalesSeries(orders, period, fromValue = '', toValue = '') {
            const now = new Date();
            let fromDate = parseSalesDate(fromValue);
            let toDate = parseSalesDate(toValue, true) || new Date(now);
            toDate.setHours(23, 59, 59, 999);

            if (!fromDate) {
                fromDate = new Date(toDate);
                if (period === 'weekly') {
                    fromDate = startOfSalesPeriod(fromDate, 'weekly');
                    fromDate.setDate(fromDate.getDate() - 35);
                } else if (period === 'monthly') {
                    fromDate = startOfSalesPeriod(fromDate, 'monthly');
                    fromDate.setMonth(fromDate.getMonth() - 5);
                } else {
                    fromDate.setDate(fromDate.getDate() - 6);
                    fromDate.setHours(0, 0, 0, 0);
                }
            }

            if (fromDate > toDate) {
                return { error: 'The start date must be on or before the end date.', buckets: [], filteredOrders: [] };
            }

            const first = startOfSalesPeriod(fromDate, period);
            const last = startOfSalesPeriod(toDate, period);
            const bucketStarts = [];
            for (let cursor = first; cursor <= last; cursor = advanceSalesPeriod(cursor, period)) {
                if (bucketStarts.length === 90) {
                    return { error: 'Choose a date range with no more than 90 chart periods.', buckets: [], filteredOrders: [] };
                }
                bucketStarts.push(new Date(cursor));
            }

            const byPeriod = new Map(bucketStarts.map(date => [date.getTime(), 0]));
            const datedOrders = orders.filter(order => {
                const date = getOrderDate(order);
                return date && date >= fromDate && date <= toDate && !isCancelledOrder(order);
            });
            datedOrders.forEach(order => {
                const key = startOfSalesPeriod(getOrderDate(order), period).getTime();
                if (byPeriod.has(key)) byPeriod.set(key, byPeriod.get(key) + orderTotal(order));
            });

            const buckets = bucketStarts.map(date => ({
                label: period === 'monthly'
                    ? date.toLocaleDateString('en-PH', { month: 'short' })
                    : period === 'weekly'
                        ? date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
                        : date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
                value: byPeriod.get(date.getTime()) || 0
            }));
            const hasCustomRange = Boolean(fromValue || toValue);
            const filteredOrders = hasCustomRange
                ? orders.filter(order => {
                    const date = getOrderDate(order);
                    return date && date >= fromDate && date <= toDate;
                })
                : orders;
            return { buckets, filteredOrders, fromDate, toDate };
        }

        function renderSalesChart(elementId, captionId, series, description) {
            const chart = document.getElementById(elementId);
            const caption = document.getElementById(captionId);
            if (!chart) return;
            if (caption && !series.error) caption.textContent = description;
            if (series.error) {
                chart.innerHTML = `<div class="admin-empty-state">${escapeHtml(series.error)}</div>`;
                if (caption) caption.textContent = series.error;
                return;
            }
            if (!series.buckets.some(bucket => bucket.value > 0)) {
                chart.innerHTML = '<div class="admin-empty-state">No non-cancelled order totals in this period.</div>';
                return;
            }
            const maximum = Math.max(...series.buckets.map(bucket => bucket.value), 1);
            chart.innerHTML = series.buckets.map(bucket => {
                const height = bucket.value > 0 ? Math.max(6, bucket.value / maximum * 100) : 0;
                return `<div class="admin-sales-bar-group">
                    <span class="admin-sales-bar-value">${bucket.value ? formatAdminCurrency(bucket.value) : '—'}</span>
                    <div class="admin-sales-bar-track"><div class="admin-sales-bar-fill" style="height:${height}%"></div></div>
                    <span class="admin-sales-bar-label">${escapeHtml(bucket.label)}</span>
                </div>`;
            }).join('');
        }

        function renderAdminViews() {
            renderProductCatalog();
            const orderCount = adminOrders.length;
            const lowStock = (adminInventory?.items || []).filter(item =>
                item.quantity <= item.reorderLevel
            );
            const today = new Date();
            const todaysOrders = adminOrders.filter(order => {
                const date = getOrderDate(order);
                return date && date.getFullYear() === today.getFullYear() &&
                    date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
            });
            const todaysSales = todaysOrders.filter(order => !isCancelledOrder(order))
                .reduce((sum, order) => sum + orderTotal(order), 0);
            const pendingOrders = adminOrders.filter(order =>
                ['new', 'pending'].includes(String(order.status || 'new').toLowerCase())
            );
            const setText = (id, value) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            };
            const currency = formatAdminCurrency;
            setText('admin-total-sales', currency(todaysSales));
            setText('admin-total-orders', String(orderCount));
            setText('admin-pending-orders', String(pendingOrders.length));
            setText('admin-low-stock-count', String(lowStock.length));
            setText('sales-transactions-today', String(todaysOrders.length));
            setText('sales-receipts-generated', String(orderCount));
            setText('sales-stock-syncs', String((adminInventory?.items || []).filter(item => item.type === 'product').length));

            const orderBody = document.getElementById('admin-order-rows');
            if (orderBody) {
                orderBody.innerHTML = adminOrders.map(order => {
                    const items = orderItems(order);
                    const quantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
                    const names = items.map(item => `${item.name}${Number(item.quantity) > 1 ? ` ×${item.quantity}` : ''}`).join(', ');
                    return `<tr data-status="${escapeHtml(orderStatus(order))}">
                        <td style="font-family:var(--font-mono);">${escapeHtml(order.id || '—')}</td>
                        <td>${escapeHtml(order.customerName || 'Guest')}</td>
                        <td title="${escapeHtml(names)}">${quantity} ${quantity === 1 ? 'item' : 'items'}</td>
                        <td>${currency(orderTotal(order))}</td>
                        <td>${escapeHtml(order.table || '—')}</td>
                        <td>${formatOrderStatus(orderStatus(order))}</td>
                        <td><button type="button" class="btn btn-ghost btn-sm" data-ui-action="view-order" data-order-id="${escapeHtml(order.id || '')}">View</button></td>
                    </tr>`;
                }).join('') || '<tr><td colspan="7">No customer orders yet.</td></tr>';
            }

            const filters = document.querySelectorAll('#order-management [data-ui-action="order-filter"]');
            const statusCounts = { all: orderCount, new: 0, preparing: 0, ready: 0, cancelled: 0 };
            adminOrders.forEach(order => {
                const status = orderStatus(order);
                if (statusCounts[status] !== undefined) statusCounts[status] += 1;
            });
            filters.forEach(button => {
                const status = button.dataset.filter;
                const label = status === 'all' ? 'All' : status === 'new' ? 'Pending' : status[0].toUpperCase() + status.slice(1);
                button.textContent = `${label} (${statusCounts[status] || 0})`;
            });

            const recentRows = document.querySelector('#admin-recent-orders tbody');
            if (recentRows) recentRows.innerHTML = adminOrders.slice(0, 5).map(order => {
                const date = getOrderDate(order);
                const orderDate = date ? date.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
                return `<tr>
                    <td>${escapeHtml(order.id || '—')}</td>
                    <td>${escapeHtml(order.customerName || 'Guest')}</td>
                    <td>${escapeHtml(orderDate)}</td>
                    <td>${currency(orderTotal(order))}</td>
                    <td>${formatAdminOrderStatus(order)}</td>
                </tr>`;
            }).join('') || '<tr><td colspan="5">No customer orders yet.</td></tr>';

            const salesRows = document.getElementById('sales-receipt-rows');
            if (salesRows) salesRows.innerHTML = adminOrders.map(order => {
                const timestamp = getOrderDate(order);
                const time = timestamp ? timestamp.toLocaleString() : '—';
                return `<tr><td>${escapeHtml(order.id || '—')}</td><td>${escapeHtml(order.customerName || 'Guest')}</td><td>${escapeHtml(orderItems(order).map(item => item.name).join(', ') || '—')}</td><td>${escapeHtml(time)}</td><td>${currency(orderTotal(order))}</td><td>${formatAdminOrderStatus(order)}</td></tr>`;
            }).join('') || '<tr><td colspan="6">No customer orders yet.</td></tr>';

            const lowStockRows = document.querySelector('#admin-low-stock tbody');
            if (lowStockRows) lowStockRows.innerHTML = lowStock.slice(0, 6).map(item =>
                `<tr><td>${escapeHtml(item.name)}</td><td style="text-align:right;"><span class="badge ${item.quantity <= 0 ? 'badge-danger' : 'badge-gold'}">${formatInventoryQuantity(item.quantity)} ${escapeHtml(item.unit)} left</span></td></tr>`
            ).join('') || '<tr><td colspan="2">No low-stock items.</td></tr>';

            const productSales = new Map();
            for (const order of adminOrders) {
                if (isCancelledOrder(order)) continue;
                for (const item of orderItems(order)) {
                    const name = String(item.name || '');
                    const match = Object.entries(products).find(([, list]) => list.some(product => product.n === name));
                    const category = match?.[0] || 'Catalog item';
                    const product = match?.[1].find(entry => entry.n === name);
                    const quantity = Number(item.quantity) || 1;
                    const current = productSales.get(name) || {
                        category,
                        quantity: 0,
                        sales: 0,
                        image: product?.image || '',
                        emoji: product?.e || ''
                    };
                    current.quantity += quantity;
                    current.sales += (Number(item.price ?? item.unitPrice) || 0) * quantity;
                    productSales.set(name, current);
                }
            }
            const bestSeller = document.getElementById('admin-best-sellers');
            if (bestSeller) {
                const ranked = [...productSales.entries()].sort((a, b) => b[1].quantity - a[1].quantity).slice(0, 5);
                bestSeller.classList.toggle('empty-state', ranked.length === 0);
                bestSeller.innerHTML = ranked.map(([name, data]) => `
                    <div class="admin-best-seller">
                        ${data.image
                            ? `<img src="${escapeHtml(encodeURI(data.image))}" alt="${escapeHtml(name)}" loading="lazy" decoding="async">`
                            : `<span class="admin-best-seller__placeholder" aria-hidden="true">${escapeHtml(data.emoji || '✿')}</span>`}
                        <span class="admin-best-seller__details">
                            <strong>${escapeHtml(name)}</strong>
                            <small>${data.quantity} sold · ${currency(data.sales)}</small>
                        </span>
                    </div>`).join('') || '<div class="admin-empty-state">No non-cancelled product orders yet.</div>';
            }
            const dashboardPeriod = document.getElementById('admin-sales-period')?.value || 'daily';
            const periodLabel = dashboardPeriod[0].toUpperCase() + dashboardPeriod.slice(1);
            renderSalesChart(
                'admin-sales-trend',
                'admin-sales-caption',
                buildSalesSeries(adminOrders, dashboardPeriod),
                `${periodLabel} order totals from saved records; cancelled orders are excluded.`
            );

            const statusCards = [
                ['Pending', ['new', 'pending']],
                ['Confirmed', ['confirmed']],
                ['Preparing', ['preparing']],
                ['Ready', ['ready']],
                ['Completed', ['completed']],
                ['Cancelled', ['cancelled']]
            ];
            const statusSummary = document.getElementById('admin-order-status-summary');
            if (statusSummary) {
                statusSummary.innerHTML = statusCards.map(([label, states]) => {
                    const count = adminOrders.filter(order => states.includes(String(order.status || 'new').toLowerCase())).length;
                    return `<div class="admin-status-card"><span>${label}</span><strong>${count}</strong></div>`;
                }).join('');
            }

            const productRows = document.getElementById('admin-order-products');
            if (productRows) {
                productRows.innerHTML = [...productSales.entries()].sort((a, b) => b[1].quantity - a[1].quantity).map(([name, data]) =>
                    `<tr><td>${escapeHtml(name)}</td><td>${escapeHtml(data.category)}</td><td>${data.quantity}</td><td>${currency(data.sales)}</td></tr>`
                ).join('') || '<tr><td colspan="4">No catalog products have been ordered yet.</td></tr>';
            }

            const analyticsRows = document.getElementById('analytics-product-rows');
            if (analyticsRows) {
                analyticsRows.innerHTML = Object.entries(products).flatMap(([category, items]) => items.map(product => {
                    const stock = productInventory(category, product.n);
                    const sold = productSales.get(product.n)?.quantity || 0;
                    const quantity = stock ? stock.quantity : (Number.isInteger(product.quantity) ? product.quantity : 0);
                    return `<tr><td>${escapeHtml(product.n)}</td><td>${escapeHtml(category)}</td><td>${sold}</td><td>${formatInventoryQuantity(quantity)}</td></tr>`;
                })).join('') || '<tr><td colspan="4">No catalog products available.</td></tr>';
            }

            const analyticsPeriod = document.getElementById('analytics-period')?.value || 'daily';
            const analyticsFrom = document.getElementById('analytics-from')?.value || '';
            const analyticsTo = document.getElementById('analytics-to')?.value || '';
            const analyticsSeries = buildSalesSeries(adminOrders, analyticsPeriod, analyticsFrom, analyticsTo);
            const analyticsOrders = analyticsSeries.filteredOrders || [];
            setText('analytics-order-count', analyticsSeries.error ? '—' : String(analyticsOrders.length));
            setText('analytics-order-value', analyticsSeries.error ? '—' :
                currency(analyticsOrders.filter(order => !isCancelledOrder(order)).reduce((sum, order) => sum + orderTotal(order), 0)));
            setText('analytics-product-count', String(Object.values(products).reduce((sum, items) => sum + items.length, 0)));
            const dateRangeLabel = analyticsFrom || analyticsTo
                ? `Filtered from ${analyticsFrom || 'the earliest saved order'} through ${analyticsTo || 'today'}.`
                : 'Metrics include all saved orders; the chart shows the most recent selected periods.';
            renderSalesChart(
                'analytics-sales-chart',
                'analytics-sales-caption',
                analyticsSeries,
                `Non-cancelled order totals only. ${dateRangeLabel}`
            );

            const customers = new Map();
            adminOrders.forEach(order => {
                const name = String(order.customerName || 'Guest').trim() || 'Guest';
                const key = name.toLocaleLowerCase();
                const current = customers.get(key) || { name, orders: [], value: 0, latestOrder: null };
                current.orders.push(order);
                if (!isCancelledOrder(order)) current.value += orderTotal(order);
                const date = getOrderDate(order);
                if (date && (!current.latestOrder || date > current.latestOrder)) current.latestOrder = date;
                customers.set(key, current);
            });
            const customerQuery = document.getElementById('admin-customer-search')?.value.trim().toLocaleLowerCase() || '';
            const customerRows = document.getElementById('admin-customer-rows');
            if (customerRows) {
                const customerList = [...customers.values()]
                    .filter(customer => customer.name.toLocaleLowerCase().includes(customerQuery))
                    .sort((a, b) => (b.latestOrder?.getTime() || 0) - (a.latestOrder?.getTime() || 0));
                customerRows.innerHTML = customerList.map(customer => `
                    <tr>
                        <td>${escapeHtml(customer.name)}</td>
                        <td>${customer.orders.length}</td>
                        <td>${currency(customer.value)}</td>
                        <td>${customer.latestOrder ? escapeHtml(customer.latestOrder.toLocaleString()) : '—'}</td>
                        <td><button type="button" class="btn btn-ghost btn-sm" data-ui-action="view-customer" data-customer-name="${escapeHtml(customer.name)}">View history</button></td>
                    </tr>`).join('') || `<tr><td colspan="5">${customerQuery ? 'No matching customers.' : 'No customer orders yet.'}</td></tr>`;
            }

            const notifications = [
                ...pendingOrders.map(order => ({
                    icon: '🧾',
                    title: `Order ${order.id || ''} is waiting for confirmation`.trim(),
                    detail: `Customer: ${order.customerName || 'Guest'}`,
                    date: getOrderDate(order),
                    screen: 'order-management'
                })),
                ...lowStock.map(item => ({
                    icon: '📦',
                    title: `${item.name} needs restocking`,
                    detail: `${formatInventoryQuantity(item.quantity)} ${item.unit} available · reorder at ${formatInventoryQuantity(item.reorderLevel)}`,
                    date: item.updatedAt ? new Date(item.updatedAt) : null,
                    screen: 'inventory-control'
                }))
            ];
            document.querySelectorAll('.admin-notification-count').forEach(badge => {
                badge.textContent = String(notifications.length);
                badge.hidden = notifications.length === 0;
            });
            const notificationList = document.getElementById('admin-notification-list');
            if (notificationList) {
                notificationList.innerHTML = notifications.map(notification => `
                    <article class="admin-notification">
                        <span class="admin-notification__icon" aria-hidden="true">${notification.icon}</span>
                        <span class="admin-notification__copy">
                            <strong>${escapeHtml(notification.title)}</strong>
                            <span>${escapeHtml(notification.detail)}</span>
                            ${notification.date && !Number.isNaN(notification.date.getTime()) ? `<time>${escapeHtml(notification.date.toLocaleString())}</time>` : ''}
                        </span>
                        <a href="#" class="btn btn-outline btn-sm" data-admin-screen="${notification.screen}">View</a>
                    </article>`).join('') || '<div class="admin-empty-state">No pending-order or low-stock alerts.</div>';
            }
        }

        async function refreshAdminOrders() {
            if (adminOrdersRefreshInProgress) return;
            adminOrdersRefreshInProgress = true;
            try {
                const nextOrders = FloreaOrderSync.isLocal() ?
                    JSON.parse(localStorage.getItem('florea-cashier-orders') || '[]') :
                    (await FloreaOrderSync.request('/api/orders', { cache: 'no-store' })).orders;
                adminOrders = Array.isArray(nextOrders) ? nextOrders : [];
                renderAdminViews();
            } catch (error) {
                console.error('Unable to load orders for admin views.', error);
                const body = document.getElementById('admin-order-rows');
                if (body) body.innerHTML = `<tr><td colspan="7">Orders could not be loaded: ${escapeHtml(error.message)}</td></tr>`;
            } finally {
                adminOrdersRefreshInProgress = false;
            }
        }

        async function applyLocalOrderStock(orderId, itemDetails) {
            const shared = await getLocalInventoryModule();
            const inventory = await getLocalInventory();
            const result = shared.applyOrderToInventory(inventory, orderId, itemDetails);
            if (!result.success) {
                const detail = result.shortages ?
                    result.shortages.map(item => `${item.name}: ${formatInventoryQuantity(item.available)} ${item.unit} available`).join('; ') :
                    result.error;
                throw new Error(`Not enough stock. ${detail}`);
            }
            if (!result.alreadyApplied) saveLocalInventory(result.inventory);
            return result;
        }

        async function restoreLocalOrderStock(orderId, itemDetails) {
            const shared = await getLocalInventoryModule();
            const inventory = await getLocalInventory();
            const result = shared.restoreOrderInventory(inventory, orderId, itemDetails);
            if (!result.success) throw new Error(result.error);
            if (!result.alreadyRestored) saveLocalInventory(result.inventory);
        }

        function saveJson(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error(`Unable to save ${key}.`, error);
                showToast(`Could not save changes: ${error.message}`);
                return false;
            }
        }

        function createDialog(title, content, submitLabel, onSubmit) {
            const dialog = document.createElement('dialog');
            dialog.className = 'florea-action-dialog';
            dialog.innerHTML = `
            <form method="dialog" class="florea-action-dialog__form">
                <div class="florea-action-dialog__header">
                    <h2>${escapeHtml(title)}</h2>
                    <button type="button" class="florea-action-dialog__close" aria-label="Close dialog">×</button>
                </div>
                <div class="florea-action-dialog__content">${content}</div>
                <div class="florea-action-dialog__actions">
                    <button type="button" class="btn btn-outline florea-action-dialog__cancel">Cancel</button>
                    ${submitLabel ? `<button type="submit" class="btn btn-primary">${escapeHtml(submitLabel)}</button>` : ''}
                </div>
            </form>`;
        document.body.appendChild(dialog);
        const close = () => dialog.close();
        dialog.querySelector('.florea-action-dialog__close').addEventListener('click', close);
        dialog.querySelector('.florea-action-dialog__cancel').addEventListener('click', close);
        dialog.addEventListener('click', event => {
            if (event.target === dialog) close();
        });
        dialog.addEventListener('close', () => dialog.remove(), { once: true });
        if (onSubmit) {
            dialog.querySelector('form').addEventListener('submit', async event => {
                event.preventDefault();
                try {
                    const shouldClose = await onSubmit(new FormData(event.currentTarget));
                    if (shouldClose !== false) close();
                } catch (error) {
                    console.error(`Unable to complete ${title.toLowerCase()}.`, error);
                    showToast(`Action failed: ${error.message}`);
                }
            });
        } else {
            dialog.querySelector('.florea-action-dialog__actions').remove();
        }
        dialog.showModal();
        const firstInput = dialog.querySelector('input, select, textarea');
        if (firstInput) firstInput.focus();
        return dialog;
    }

    function field(label, name, type = 'text', value = '', attributes = '') {
        const input = type === 'textarea'
            ? `<textarea name="${name}" ${attributes}>${escapeHtml(value)}</textarea>`
            : `<input name="${name}" type="${type}" value="${escapeHtml(value)}" ${attributes}>`;
        return `<label class="florea-action-field">${escapeHtml(label)}${input}</label>`;
    }

    function productImageType(file) {
        const extension = String(file.name || '').split('.').pop().toLowerCase();
        const types = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp'
        };
        const extensionType = types[extension];
        const declaredType = String(file.type || '').toLowerCase();
        return extensionType && (!declaredType || declaredType === extensionType) ? extensionType : '';
    }

    function productImagePreviewSource(value) {
        if (typeof value !== 'string') return '';
        const image = value.trim();
        if (image.startsWith('assets/') && !image.split('/').includes('..')) return encodeURI(image);
        if (/^\/api\/product-images\/[0-9a-f-]{36}$/i.test(image)) {
            return FloreaOrderSync.resolveImageUrl(image);
        }
        if (/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/i.test(image)) return image;
        return '';
    }

    function readImageAsDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(String(reader.result || '')));
            reader.addEventListener('error', () => reject(new Error('The selected image could not be read.')));
            reader.readAsDataURL(file);
        });
    }

    function bindProductImagePicker(root) {
        const input = root.querySelector('[data-product-image-input], [name="productImage"]');
        const previewWrap = root.querySelector('[data-product-image-preview-wrap]');
        const preview = root.querySelector('[data-product-image-preview]');
        const status = root.querySelector('[data-product-image-status]');
        if (!input || !previewWrap || !preview || !status) return null;

        const isLocal = FloreaOrderSync.isLocal();
        const maxBytes = isLocal ? 1024 * 1024 : 5 * 1024 * 1024;
        const hint = root.querySelector('.product-image-upload__hint');
        if (hint && isLocal) {
            hint.textContent = 'JPG, PNG, or WEBP. Original image data is saved on this device; maximum 1 MB in local mode.';
        }
        let selectedFile = null;
        let objectUrl = '';
        let savedSource = '';

        function setStatus(message, state = '') {
            status.textContent = message;
            status.classList.toggle('is-error', state === 'error');
            status.classList.toggle('is-loading', state === 'loading');
        }

        function clearObjectUrl() {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            objectUrl = '';
        }

        function setImage(source) {
            selectedFile = null;
            clearObjectUrl();
            input.value = '';
            savedSource = productImagePreviewSource(source);
            previewWrap.hidden = !savedSource;
            if (savedSource) preview.src = savedSource;
            else preview.removeAttribute('src');
            setStatus('');
        }

        input.addEventListener('change', () => {
            const file = input.files?.[0];
            if (!file) return;
            const type = productImageType(file);
            if (!type) {
                input.value = '';
                selectedFile = null;
                clearObjectUrl();
                previewWrap.hidden = !savedSource;
                if (savedSource) preview.src = savedSource;
                else preview.removeAttribute('src');
                setStatus('Choose a JPG, JPEG, PNG, or WEBP image.', 'error');
                return;
            }
            if (file.size <= 0 || file.size > maxBytes) {
                input.value = '';
                selectedFile = null;
                clearObjectUrl();
                previewWrap.hidden = !savedSource;
                if (savedSource) preview.src = savedSource;
                else preview.removeAttribute('src');
                setStatus(`Choose an image smaller than ${(maxBytes / 1024 / 1024).toFixed(0)} MB.`, 'error');
                return;
            }
            selectedFile = file;
            clearObjectUrl();
            objectUrl = URL.createObjectURL(file);
            preview.src = objectUrl;
            previewWrap.hidden = false;
            setStatus('Preview ready. Save to store the original image.');
        });

        root.addEventListener('close', clearObjectUrl);

        return {
            hasFile: () => Boolean(selectedFile),
            setImage,
            async upload() {
                if (!selectedFile) return '';
                const file = selectedFile;
                const contentType = productImageType(file);
                setStatus('Uploading original image…', 'loading');
                try {
                    if (isLocal) {
                        const dataUrl = await readImageAsDataUrl(file);
                        setStatus('Original image ready to save on this device.');
                        return dataUrl;
                    }
                    const response = await FloreaOrderSync.fetchApi('/api/product-images/upload', {
                        method: 'POST',
                        headers: { 'content-type': contentType },
                        body: file
                    });
                    let result = {};
                    try {
                        result = await response.json();
                    } catch (error) {
                        if (response.ok) throw new Error('The image server returned an invalid response.');
                    }
                    if (!response.ok) throw new Error(result.error || `Image upload failed (${response.status}).`);
                    if (typeof result.url !== 'string' || !/^\/api\/product-images\/[0-9a-f-]{36}$/i.test(result.url)) {
                        throw new Error('The image server returned an invalid image URL.');
                    }
                    setStatus('Image uploaded successfully.');
                    return result.url;
                } catch (error) {
                    setStatus(error.message, 'error');
                    throw error;
                }
            },
            setStatus
        };
    }

    function loadSavedCatalog() {
        try {
            const saved = JSON.parse(localStorage.getItem(catalogStorageKey) || 'null');
            if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return;
            const validCategories = Object.entries(saved).filter(([, items]) =>
                Array.isArray(items) && items.every(item =>
                    item && typeof item.n === 'string' && typeof item.p === 'string'
                )
            );
            if (!validCategories.length) return;
            const savedProducts = new Map(validCategories);
            const categoryOrder = [...new Set([...defaultCategoryOrder, ...savedProducts.keys()])];
            Object.keys(products).forEach(category => delete products[category]);
            categoryOrder.forEach(category => {
                const defaultItems = defaultProducts[category] || [];
                const savedItems = savedProducts.get(category) || [];
                const defaultsByName = new Map(defaultItems.map(item => [item.n, item]));
                const savedNames = new Set(savedItems.map(item => item.n));
                const mergedSaved = savedItems.map(savedItem => {
                    const defaultItem = defaultsByName.get(savedItem.n);
                    if (!defaultItem) return { ...savedItem };
                    return {
                        ...defaultItem,
                        ...savedItem,
                        d: typeof savedItem.d !== 'string' || !savedItem.d.trim() ||
                            legacyMenuDescriptions.has(savedItem.d.trim())
                            ? defaultItem.d
                            : savedItem.d,
                        ...(
                            typeof savedItem.image === 'string' && savedItem.image
                                ? { image: savedItem.image }
                                : (defaultItem.image ? { image: defaultItem.image } : {})
                        )
                    };
                });
                const newDefaults = defaultItems
                    .filter(item => !savedNames.has(item.n))
                    .map(item => ({ ...item }));
                products[category] = [...mergedSaved, ...newDefaults];
            });
            categories.splice(0, categories.length, ...categoryOrder);
            if (JSON.stringify(saved) !== JSON.stringify(products)) persistCatalog();
            renderCustomCategories();
            window.refreshFloreaCatalog();
        } catch (error) {
            console.warn('Unable to load saved product catalog.', error);
        }
    }

    function persistCatalog() {
        return saveJson(catalogStorageKey, products);
    }

        function renderCustomCategories() {
            renderProductCatalog();
        }

    function productOptions(selectedCategory) {
        return Object.entries(products).map(([category, items]) =>
            items.map(item => `<option value="${escapeHtml(category)}|${escapeHtml(item.n)}"${category === selectedCategory ? ' selected' : ''}>${escapeHtml(item.n)} — ${escapeHtml(category)}</option>`)
        ).flat().join('');
    }

    function setEditorProduct(product, category) {
        editingProduct = product;
        editingCategory = category;
        const editor = document.querySelector('#product-management');
        if (!editor) return;
        const values = {
            name: product.n,
            category,
            price: (String(product.p).match(/\d+(?:\.\d+)?/) || ['0'])[0],
            stock: productInventory(category, product.n)?.quantity ?? (Number.isInteger(product.quantity) ? product.quantity : 0),
            description: product.d || ''
        };
        editor.querySelectorAll('[data-product-field]').forEach(input => {
            const key = input.dataset.productField;
            if (key === 'category') {
                input.innerHTML = categories.map(item => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('');
            }
            input.value = values[key] ?? '';
        });
        productEditorImagePicker?.setImage(product.image);
        renderProductCatalog();
    }

    function getEditorValues() {
        const editor = document.querySelector('#product-management');
        const get = name => editor.querySelector(`[data-product-field="${name}"]`).value.trim();
        const name = get('name');
        const category = get('category');
        const price = Number(get('price'));
        const quantity = Number(get('stock'));
        if (!name || !category || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 0) {
            showToast('Enter a product name, valid price, and whole-number stock quantity.');
            return null;
        }
        return { name, category, price, quantity, description: get('description') };
    }

    function updateProductObject(product, values) {
        product.n = values.name;
        product.d = values.description;
        product.p = `₱ ${values.price.toFixed(2)}`;
        product.quantity = values.quantity;
        product.stock = values.quantity === 0 ? 'Sold Out' : (values.quantity <= 5 ? 'Low Stock' : 'In Stock');
    }

    function updateCategoryOptions() {
        const select = document.querySelector('[data-product-field="category"]');
        if (select) {
            const selected = select.value;
            select.innerHTML = categories.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('');
            if (categories.includes(selected)) select.value = selected;
        }
        const chips = document.querySelector('#catalog-chips');
        if (chips) window.refreshFloreaCatalog();
    }

    function openManualOrder() {
        const options = productOptions(categories[0]);
        if (!options) {
            showToast('Add a menu product before creating a manual order.');
            return;
        }
        createDialog('Create Manual Order', `
            ${field('Customer name', 'customerName', 'text', '', 'required maxlength="80"')}
            <label class="florea-action-field">Menu item<select name="product" required>${options}</select></label>
            ${field('Quantity', 'quantity', 'number', '1', 'required min="1" max="50" step="1"')}
        `, 'Create Order', async formData => {
            const [category, name] = String(formData.get('product') || '').split('|');
            const product = (products[category] || []).find(item => item.n === name);
            const quantity = Number(formData.get('quantity'));
            const price = product && Number((String(product.p).match(/\d+(?:\.\d+)?/) || [''])[0]);
            const customerName = String(formData.get('customerName') || '').trim();
            if (!product || !Number.isFinite(price) || !customerName || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
                showToast('Choose a valid product and quantity, and enter the customer name.');
                return false;
            }
            const itemDetails = [{
                name: product.n,
                quantity,
                price,
                image: getProductImage(product, category),
                emoji: product.e
            }];
            let order;
            if (FloreaOrderSync.isLocal()) {
                order = {
                    id: `ORD-MANUAL-${Date.now()}`,
                    customerName,
                    items: [`${product.n} ×${quantity}`],
                    itemDetails,
                    total: `₱${(quantity * price).toLocaleString('en-PH')}`,
                    table: 'Walk-in',
                    timestamp: new Date().toISOString(),
                    status: 'new'
                };
                await window.FloreaInventory.applyLocalOrder(order.id, itemDetails);
                const savedOrders = JSON.parse(localStorage.getItem('florea-cashier-orders') || '[]');
                savedOrders.unshift(order);
                if (!saveJson('florea-cashier-orders', savedOrders)) {
                    await window.FloreaInventory.restoreLocalOrder(order.id, itemDetails);
                    return false;
                }
                if (Array.isArray(window.orders)) {
                    window.orders.unshift({ ...order, timestamp: new Date(order.timestamp) });
                    if (typeof window.renderOrdersDash === 'function') window.renderOrdersDash();
                    if (typeof window.updateStatsDash === 'function') window.updateStatsDash();
                }
            } else {
                const result = await FloreaOrderSync.request('/api/orders', {
                    method: 'POST',
                    body: JSON.stringify({ customerName, itemDetails })
                });
                order = result.order;
            }
            if (typeof window.renderLiveOrderManagementRow === 'function') {
                window.renderLiveOrderManagementRow(order);
            } else {
                const row = document.getElementById('live-order-row');
                if (row) {
                    row.style.display = '';
                    row.innerHTML = `<td>${escapeHtml(order.id)}</td><td>${escapeHtml(order.customerName)}</td><td>1 item</td><td>${escapeHtml(order.total)}</td><td>Walk-in</td><td><span class="badge badge-gold">Pending</span></td><td></td>`;
                }
            }
            showToast(`Order ${order.id} sent to the cashier dashboard.`);
            return true;
        });
    }

    function openProductForm(initial = {}) {
        const categoryOptions = categories.map(category =>
            `<option value="${escapeHtml(category)}"${category === (initial.category || categories[0]) ? ' selected' : ''}>${escapeHtml(category)}</option>`
        ).join('');
        let imagePicker;
        const dialog = createDialog(initial.title || 'Add Product', `
            ${field('Product name', 'name', 'text', initial.name || '', 'required maxlength="120"')}
            <label class="florea-action-field">Category<select name="category" required>${categoryOptions}</select></label>
            ${field('Price (₱)', 'price', 'number', initial.price || '', 'required min="0" step="0.01"')}
            ${field('Stock quantity', 'quantity', 'number', initial.quantity ?? '0', 'required min="0" step="1"')}
            ${field('Description', 'description', 'textarea', initial.description || '', 'rows="3"')}
            <div class="product-image-upload">
                <label for="new-product-image-input">Product image</label>
                <input id="new-product-image-input" class="input" name="productImage" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp">
                <p class="product-image-upload__hint">JPG, PNG, or WEBP. The original image is preserved. Maximum 5 MB on Netlify.</p>
                <p data-product-image-status class="product-image-upload__status" role="status" aria-live="polite"></p>
                <div data-product-image-preview-wrap class="product-image-preview" hidden>
                    <img data-product-image-preview alt="New product image preview">
                </div>
            </div>
        `, initial.submitLabel || 'Add Product', async formData => {
            const name = String(formData.get('name') || '').trim();
            const category = String(formData.get('category') || '');
            const price = Number(formData.get('price'));
            const quantity = Number(formData.get('quantity'));
            if (!name || !products[category] || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 0) {
                showToast('Enter a valid product name, category, price, and stock quantity.');
                return false;
            }
            if (Object.values(products).flat().some(product => product.n.toLowerCase() === name.toLowerCase())) {
                showToast('A product with that name already exists.');
                return false;
            }
            const submitButton = dialog.querySelector('button[type="submit"]');
            let image = '';
            try {
                if (imagePicker?.hasFile()) {
                    if (submitButton) {
                        submitButton.disabled = true;
                        submitButton.textContent = 'Uploading…';
                    }
                    image = await imagePicker.upload();
                }
            } catch (error) {
                showToast(`Could not upload product image: ${error.message}`);
                return false;
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = initial.submitLabel || 'Add Product';
                }
            }
            const product = {
                e: '🌷',
                n: name,
                d: String(formData.get('description') || '').trim(),
                p: `₱ ${price.toFixed(2)}`,
                quantity,
                stock: quantity === 0 ? 'Sold Out' : (quantity <= 5 ? 'Low Stock' : 'In Stock'),
                ...(image ? { image } : {})
            };
            products[category].push(product);
            if (!persistCatalog()) {
                products[category].pop();
                return false;
            }
            renderCustomCategories();
            window.refreshFloreaCatalog();
            setEditorProduct(product, category);
            updateCategoryOptions();
            showToast(`${name} was added on this device.`);
            return true;
        });
        imagePicker = bindProductImagePicker(dialog);
    }

    function addCategory() {
        createDialog('Add Product Category', field('Category name', 'name', 'text', '', 'required maxlength="60"'), 'Add Category', formData => {
            const name = String(formData.get('name') || '').trim();
            if (!name) {
                showToast('Enter a category name.');
                return false;
            }
            if (categories.some(category => category.toLowerCase() === name.toLowerCase())) {
                showToast('That category already exists.');
                return false;
            }
            categories.push(name);
            products[name] = [];
            if (!persistCatalog()) {
                categories.pop();
                delete products[name];
                return false;
            }
            renderCustomCategories();
            updateCategoryOptions();
            showToast(`${name} category saved on this device.`);
            return true;
        });
    }

    function adjustStock(selectedItemId = '', selectedDirection = 'add') {
        const rows = [...document.querySelectorAll('#inventory-control #inventory-items tr[data-inventory-id]')];
        const options = rows.map(row => {
            const cells = [...row.cells].map(cell => cell.textContent.trim());
            const selected = row.dataset.inventoryId === selectedItemId ? ' selected' : '';
            return `<option value="${escapeHtml(row.dataset.inventoryId)}"${selected}>${escapeHtml(cells[0])} (${escapeHtml(cells[2])} ${escapeHtml(cells[3])})</option>`;
        }).join('');
        if (!options) {
            showToast('No inventory items are available to adjust.');
            return;
        }
        createDialog('Adjust Inventory Stock', `
            <label class="florea-action-field">Inventory item<select name="item" required>${options}</select></label>
            <label class="florea-action-field">Adjustment<select name="direction"><option value="add"${selectedDirection === 'add' ? ' selected' : ''}>Add stock</option><option value="remove"${selectedDirection === 'remove' ? ' selected' : ''}>Remove stock</option></select></label>
            ${field('Quantity', 'quantity', 'number', '1', 'required min="1" step="1"')}
        `, 'Apply Adjustment', async formData => {
            const itemId = String(formData.get('item') || '');
            const quantity = Number(formData.get('quantity'));
            const row = rows.find(item => item.dataset.inventoryId === itemId);
            if (!row || !Number.isInteger(quantity) || quantity < 1) {
                showToast('Enter a whole-number adjustment greater than zero.');
                return false;
            }
            const itemName = row.cells[0].textContent.trim();
            if (!itemId) {
                showToast('This inventory row cannot be updated.');
                return false;
            }
            if (FloreaOrderSync.isLocal()) {
                const shared = await getLocalInventoryModule();
                const inventory = await getLocalInventory();
                const result = shared.adjustInventoryItem(inventory, itemId, formData.get('direction'), quantity);
                if (!result.success) {
                    showToast(result.notFound ? 'Inventory item not found.' : 'Stock cannot be reduced below zero.');
                    return false;
                }
                saveLocalInventory(result.inventory);
            } else {
                const result = await FloreaOrderSync.request('/api/inventory', {
                    method: 'PATCH',
                    body: JSON.stringify({ itemId, direction: formData.get('direction'), quantity })
                });
                syncMenuStock(result.inventory);
                renderInventory(result.inventory);
            }
            showToast(`${itemName} stock updated.`);
            return true;
        });
    }

    function downloadCsv(filename, rows) {
        const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
        const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function tableRows(table) {
        return [...table.rows].map(row =>
            [...row.cells].filter(cell => !cell.hasAttribute('data-no-export')).map(cell => cell.textContent.trim())
        );
    }

    function printReport(title, rows) {
        const body = rows.map((row, index) => `<tr${index === 0 ? ' class="florea-report-heading"' : ''}>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('');
        createDialog(title, `
            <div class="florea-print-sheet">
                <p>Floréa business report · ${escapeHtml(new Date().toLocaleString())}</p>
                <table>${body}</table>
            </div>
        `, 'Print / Save as PDF', () => {
            window.print();
            return false;
        });
    }

    function exportReport(button) {
        const card = button.closest('.card');
        const paragraphs = [...card.querySelectorAll('p')].map(item => item.textContent.trim());
        const title = paragraphs[1] || 'Floréa Report';
        const tableSelector = title.startsWith('Inventory')
            ? '#inventory-control .admin-content table'
            : (title.startsWith('Sales')
                ? '#order-management .admin-content table'
                : '#sales-automation .admin-content table');
        const reportTable = document.querySelector(tableSelector);
        const rows = title.startsWith('Order Value')
            ? [
                ['Order ID', 'Customer', 'Order Date', 'Order Value'],
                ...adminOrders.filter(order => !isCancelledOrder(order)).map(order => {
                    const date = getOrderDate(order);
                    return [
                        order.id || '—',
                        order.customerName || 'Guest',
                        date ? date.toLocaleString() : '—',
                        formatAdminCurrency(orderTotal(order))
                    ];
                })
            ]
            : reportTable
                ? tableRows(reportTable)
                : [['Report', title], ['Description', paragraphs[2] || ''], ['Generated', new Date().toLocaleString()]];
        const format = button.dataset.format;
        if (format === 'excel') {
            downloadCsv(`${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`, rows);
        } else {
            printReport(title, rows);
        }
    }

    function viewOrder(link) {
        const cells = [...link.closest('tr').cells].map(cell => cell.textContent.trim());
        const content = `<dl class="florea-order-summary">${cells.map((value, index) => `<div><dt>${escapeHtml(['Order ID', 'Customer', 'Items', 'Total', 'Fulfillment', 'Status', ''][index] || `Field ${index + 1}`)}</dt><dd>${escapeHtml(value || '—')}</dd></div>`).join('')}</dl>`;
        createDialog(`Order ${cells[0] || 'Details'}`, content, null, null);
    }

    function viewCustomer(button) {
        const customerName = button.dataset.customerName;
        const orders = adminOrders.filter(order =>
            String(order.customerName || 'Guest').trim().toLocaleLowerCase() === customerName.toLocaleLowerCase()
        );
        const rows = orders.map(order => {
            const date = getOrderDate(order);
            const itemNames = orderItems(order).map(item => item.name).join(', ') || '—';
            return `<tr>
                <td>${escapeHtml(order.id || '—')}</td>
                <td>${date ? escapeHtml(date.toLocaleString()) : '—'}</td>
                <td>${escapeHtml(itemNames)}</td>
                <td>${formatAdminOrderStatus(order)}</td>
                <td>${formatAdminCurrency(orderTotal(order))}</td>
            </tr>`;
        }).join('') || '<tr><td colspan="5">No saved order history.</td></tr>';
        createDialog(`Order history · ${customerName}`, `
            <div class="table-wrap">
                <table>
                    <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Status</th><th>Order Value</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <p class="admin-data-note">Cancelled orders remain in history but are excluded from customer order value totals.</p>
        `, null, null);
    }

    async function setInventoryQuantity(itemId, quantity) {
        if (FloreaOrderSync.isLocal()) {
            const shared = await getLocalInventoryModule();
            const inventory = await getLocalInventory();
            const result = shared.adjustInventoryItem(inventory, itemId, 'set', quantity);
            if (!result.success) throw new Error(result.notFound ? 'Inventory item not found.' : 'Invalid stock quantity.');
            saveLocalInventory(result.inventory);
            return result.inventory;
        }
        const result = await FloreaOrderSync.request('/api/inventory', {
            method: 'PATCH',
            body: JSON.stringify({ itemId, direction: 'set', quantity })
        });
        syncMenuStock(result.inventory);
        renderInventory(result.inventory);
        return result.inventory;
    }

    async function saveProduct() {
        const values = getEditorValues();
        if (!values || !editingProduct) return;
        if (Object.values(products).flat().some(product => product !== editingProduct && product.n.toLowerCase() === values.name.toLowerCase())) {
            showToast('A product with that name already exists.');
            return;
        }
        let imageUrl = editingProduct.image || '';
        const saveButton = document.querySelector('#product-management [data-ui-action="save-product"]');
        if (productEditorImagePicker?.hasFile()) {
            try {
                if (saveButton) {
                    saveButton.disabled = true;
                    saveButton.textContent = 'Uploading image…';
                }
                imageUrl = await productEditorImagePicker.upload();
            } catch (error) {
                showToast(`Could not upload product image: ${error.message}`);
                return;
            } finally {
                if (saveButton) {
                    saveButton.disabled = false;
                    saveButton.textContent = 'Save Changes';
                }
            }
        }
        const previousCategory = editingCategory;
        const originalProduct = { ...editingProduct };
        const stockItemId = `product:${previousCategory}:${originalProduct.n}`;
        let previousSharedStock;
        let syncSharedStock = false;
        if (values.name === originalProduct.n && values.category === previousCategory) {
            try {
                const inventory = FloreaOrderSync.isLocal()
                    ? await getLocalInventory()
                    : (await FloreaOrderSync.request('/api/inventory')).inventory;
                const stockItem = inventory.items.find(item => item.id === stockItemId);
                if (stockItem) {
                    previousSharedStock = stockItem.quantity;
                    await setInventoryQuantity(stockItemId, values.quantity);
                    syncSharedStock = true;
                }
            } catch (error) {
                console.error('Unable to synchronize product stock.', error);
                showToast(`Could not update shared stock: ${error.message}`);
                return;
            }
        }
        const updatedProduct = { ...editingProduct };
        updateProductObject(updatedProduct, values);
        if (imageUrl) updatedProduct.image = imageUrl;
        if (values.category !== previousCategory) {
            products[previousCategory] = products[previousCategory].filter(product => product !== editingProduct);
            products[values.category].push(updatedProduct);
        } else {
            Object.assign(editingProduct, updatedProduct);
        }
        if (!persistCatalog()) {
            if (values.category !== previousCategory) {
                products[values.category].pop();
                products[previousCategory].push(editingProduct);
            } else {
                Object.assign(editingProduct, originalProduct);
            }
            if (syncSharedStock) {
                try {
                    await setInventoryQuantity(stockItemId, previousSharedStock);
                } catch (error) {
                    console.error('Unable to restore inventory after product save failed.', error);
                    showToast(`Product save failed and stock could not be restored: ${error.message}`);
                }
            }
            return;
        }
        setEditorProduct(values.category === previousCategory ? editingProduct : updatedProduct, values.category);
        renderCustomCategories();
        window.refreshFloreaCatalog();
        showToast(`${values.name} changes saved on this device.`);
    }

    function duplicateProduct() {
        const values = getEditorValues();
        if (!values || !editingProduct) return;
        openProductForm({
            title: 'Duplicate Product',
            submitLabel: 'Create Copy',
            name: `Copy of ${values.name}`,
            category: values.category,
            price: values.price,
            quantity: values.quantity,
            description: values.description
        });
    }

    function deleteProduct() {
        if (!editingProduct) return;
        if (!window.confirm(`Delete ${editingProduct.n} from the menu?`)) return;
        const category = editingCategory;
        const index = products[category].indexOf(editingProduct);
        if (index < 0) return;
        const [deleted] = products[category].splice(index, 1);
        if (!persistCatalog()) {
            products[category].splice(index, 0, deleted);
            return;
        }
        const next = products[category][0] || Object.entries(products).flatMap(([key, items]) => items.map(item => ({ item, key })))[0];
        if (next) {
            setEditorProduct(next.item || next, next.key || category);
        } else {
            editingProduct = null;
            editingCategory = '';
            document.querySelectorAll('#product-management [data-product-field]').forEach(input => { input.value = ''; });
            productEditorImagePicker?.setImage('');
        }
        renderCustomCategories();
        window.refreshFloreaCatalog();
        showToast(`${deleted.n} was deleted.`);
    }

    function createManualOrder() {
        openManualOrder();
    }

    function openSettings() {
        let profile = {};
        try {
            profile = JSON.parse(localStorage.getItem(profileStorageKey) || '{}');
        } catch (error) {
            console.warn('Unable to load store settings.', error);
        }
        createDialog('Store Settings', `
            ${field('Store name', 'name', 'text', profile.name || 'Floréa', 'required maxlength="80"')}
            ${field('Contact number', 'phone', 'tel', profile.phone || '', 'maxlength="30"')}
            ${field('Store location', 'location', 'text', profile.location || 'Bridgeville, Danggay, Roxas, Oriental Mindoro', 'maxlength="120"')}
        `, 'Save Settings', formData => {
            const next = {
                name: String(formData.get('name') || '').trim(),
                phone: String(formData.get('phone') || '').trim(),
                location: String(formData.get('location') || '').trim()
            };
            if (!next.name) {
                showToast('Enter a store name.');
                return false;
            }
            if (!saveJson(profileStorageKey, next)) return false;
            showToast('Store settings saved on this device.');
            return true;
        });
    }

    function setOrderFilter(button) {
        const filter = button.dataset.filter;
        const container = button.closest('.admin-content');
        container.querySelectorAll('[data-ui-action="order-filter"]').forEach(chip => chip.classList.toggle('active', chip === button));
        for (const row of container.querySelectorAll('#admin-order-rows tr')) {
            row.hidden = filter !== 'all' && row.dataset.status !== filter;
        }
    }

    function setInventoryFilter(button) {
        const filter = button.dataset.filter.toLowerCase();
        const section = button.closest('#inventory-control');
        section.querySelectorAll('[data-ui-action="inventory-filter"]').forEach(chip => chip.classList.toggle('active', chip === button));
        for (const row of section.querySelectorAll('.admin-content table tr')) {
            if (row.querySelector('th')) continue;
            const category = row.cells[1]?.textContent.trim().toLowerCase() || '';
            row.hidden = filter !== 'all' && category !== filter;
        }
    }

    document.addEventListener('click', async event => {
        const target = event.target.closest('[data-ui-action]');
        if (!target) return;
        const action = target.dataset.uiAction;
        if (target.tagName === 'A') event.preventDefault();
        switch (action) {
            case 'style-guide':
                createDialog('Floréa Style Guide', `
                    <p>Floréa uses a warm floral palette and clear, readable type.</p>
                    <div class="florea-swatch-grid">
                        <span style="--swatch:#24392d">Forest</span><span style="--swatch:#9cc08b">Sage</span>
                        <span style="--swatch:#fbf7f1">Paper</span><span style="--swatch:#c1594e">Blush</span>
                        <span style="--swatch:#c6a15b">Gold</span><span style="--swatch:#3b2f2a">Ink</span>
                    </div><p><b>Display:</b> Fraunces · <b>Interface:</b> Inter</p>
                `, null, null);
                break;
            case 'open-catalog':
                window.openCatalog();
                break;
            case 'forgot-password':
                window.alert('Password resets are handled by your site administrator. Update ADMIN_PASSWORD in the Netlify site environment.');
                break;
            case 'settings':
                openSettings();
                break;
            case 'manual-order':
                createManualOrder();
                break;
            case 'order-filter':
                setOrderFilter(target);
                break;
            case 'view-order':
                viewOrder(target);
                break;
            case 'view-customer':
                viewCustomer(target);
                break;
            case 'edit-catalog-product': {
                const category = target.dataset.category;
                const product = (products[category] || []).find(item => item.n === target.dataset.product);
                if (product) setEditorProduct(product, category);
                break;
            }
            case 'export-table': {
                const table = target.closest('.admin-content').querySelector('table');
                if (table) downloadCsv(target.dataset.filename || 'florea-export.csv', tableRows(table));
                break;
            }
            case 'stock-adjustment':
                adjustStock(target.dataset.itemId || '', target.dataset.direction || 'add');
                break;
            case 'inventory-filter':
                setInventoryFilter(target);
                break;
            case 'add-product':
                openProductForm();
                break;
            case 'new-category':
                addCategory();
                break;
            case 'save-product':
                await saveProduct();
                break;
            case 'duplicate-product':
                duplicateProduct();
                break;
            case 'delete-product':
                deleteProduct();
                break;
            case 'toggle-option':
                target.classList.toggle('active');
                break;
            case 'add-option': {
                const name = window.prompt('Enter a customization option name.');
                if (name && name.trim()) {
                    const option = document.createElement('button');
                    option.type = 'button';
                    option.className = 'chip active';
                    option.dataset.uiAction = 'toggle-option';
                    option.textContent = name.trim();
                    target.before(option);
                }
                break;
            }
            case 'export-report':
                exportReport(target);
                break;
            case 'apply-analytics-filter':
                window.FloreaAdmin?.renderViews();
                break;
            case 'reset-analytics-filter':
                ['analytics-period', 'analytics-from', 'analytics-to'].forEach(id => {
                    const input = document.getElementById(id);
                    if (input) input.value = id === 'analytics-period' ? 'daily' : '';
                });
                window.FloreaAdmin?.renderViews();
                break;
            case 'download-report': {
                const row = target.closest('tr');
                const title = row.cells[0].textContent.trim();
                const format = target.dataset.format;
                if (format === 'excel') downloadCsv(`${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`, tableRows(row.closest('table')).filter((_, index) => index === 0 || row.closest('table').rows[index] === row));
                else printReport(title, tableRows(row.closest('table')).filter((_, index) => index === 0 || row.closest('table').rows[index] === row));
                break;
            }
            case 'menu-home':
                window.go('menu-home');
                break;
            case 'menu-catalog':
                window.openCatalog();
                break;
            case 'menu-orders':
                window.go('order-management');
                break;
            case 'navigate':
                window.go(target.dataset.screen);
                break;
        }
    });

    document.addEventListener('input', event => {
        if (event.target.id === 'admin-customer-search') window.FloreaAdmin?.renderViews();
    });

    document.addEventListener('change', event => {
        if (event.target.id === 'admin-sales-period') window.FloreaAdmin?.renderViews();
    });

    loadSavedCatalog();
    window.FloreaInventory = {
        refresh: refreshInventory,
        applyLocalOrder: applyLocalOrderStock,
        restoreLocalOrder: restoreLocalOrderStock
    };
    window.FloreaAdmin = {
        refresh() {
            refreshInventory();
            return refreshAdminOrders();
        },
        renderViews: renderAdminViews
    };
    productEditorImagePicker = bindProductImagePicker(document.getElementById('product-management'));
    const originalGo = window.go;
    if (typeof originalGo === 'function') {
        window.go = function(screenId) {
            originalGo(screenId);
            if (screenId === 'inventory-control') refreshInventory();
        };
    }
    refreshInventory();
    refreshAdminOrders();
    setInterval(() => {
        if (!document.hidden) {
            refreshInventory();
            refreshAdminOrders();
        }
    }, 10000);
    const initialCategory = Object.entries(products).find(([, items]) => items.some(item => item.n === 'Sweetheart Peony Bouquet'));
    const firstProduct = initialCategory || Object.entries(products).find(([, items]) => items.length);
    if (firstProduct) setEditorProduct(firstProduct[1].find(item => item.n === 'Sweetheart Peony Bouquet') || firstProduct[1][0], firstProduct[0]);
})();