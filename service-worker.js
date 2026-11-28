const appShellCacheName = `florea-app-shell-${self.__FLOREA_BUILD_VERSION__ || 'v1'}`;

self.addEventListener('install', event => {
    const appShellFiles = [
    '/',
    '/florea-prototype.html',
    '/florea-prototype.css',
    '/florea-prototype.js',
    '/florea-orders.js',
    '/florea-cashier-sound.js',
    '/florea-push.js',
    '/florea-ui-actions.js',
    '/florea-install.js',
    '/florea-logo.png',
    '/florea-logo-192.png',
    '/florea-logo-512.png',
    '/site.webmanifest'
    ];
    event.waitUntil(
        Promise.all([
            self.skipWaiting(),
            caches.open(appShellCacheName).then(cache => cache.addAll(appShellFiles))
        ])
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then(keys => Promise.all(
                keys
                    .filter(key => key.startsWith('florea-') && key !== appShellCacheName)
                    .map(key => caches.delete(key))
            ))
        ])
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;
    if (url.pathname.startsWith('/api/')) return;

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(async () =>
                (await caches.match('/florea-prototype.html')) ||
                caches.match('/index.html')
            )
        );
        return;
    }

    if (['.js', '.css', '.html'].some(extension => url.pathname.endsWith(extension))) {
        event.respondWith(
            fetch(event.request).then(async response => {
                if (response.ok) {
                    const copy = response.clone();
                    const cache = await caches.open(appShellCacheName);
                    await cache.put(event.request, copy);
                }
                return response;
            }).catch(async () =>
                (await caches.match(event.request)) ||
                caches.match('/florea-prototype.html')
            )
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cached => {
            const networkUpdate = fetch(event.request).then(response => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(appShellCacheName).then(cache => cache.put(event.request, copy));
                }
                return response;
            }).catch(() => cached);
            return cached || networkUpdate;
        })
    );
});

const pendingNotifications = new Set();

async function showOrderNotification(message) {
    const status = ['preparing', 'ready', 'completed'].includes(message.status) ? message.status : 'ready';
    const orderId = typeof message.orderId === 'string' ? message.orderId : 'order';
    const tag = `florea-order-${orderId}`;
    const notificationKey = `${tag}-${status}`;
    if (pendingNotifications.has(notificationKey)) return;
    pendingNotifications.add(notificationKey);

    try {
        const existing = await self.registration.getNotifications({ tag });
        if (existing.some(notification => notification.data?.status === status)) return;

        const ready = status === 'ready';
        const completed = status === 'completed';
        const customerName = typeof message.customerName === 'string' && message.customerName.trim()
            ? message.customerName.trim()
            : 'Customer';
        await self.registration.showNotification(
            message.title || 'Floréa',
            {
                body: message.body || (completed
                    ? `${customerName}, THANK YOU SO MUCH!`
                    : ready
                        ? `${customerName}, OKAY NA PO ORDERS NIYO`
                        : `${customerName}, PA WAIT LANG PO ORDERS NIYO`),
                icon: '/florea-logo-512.png',
                badge: '/florea-logo-192.png',
                data: { url: message.url || '/', orderId, status },
                tag,
                renotify: true,
                silent: false,
                requireInteraction: ready,
                vibrate: ready
                    ? [180, 100, 180, 100, 280]
                    : [160, 80, 160],
                timestamp: Date.now()
            }
        );
    } finally {
        pendingNotifications.delete(notificationKey);
    }
}

self.addEventListener('push', event => {
    let message = {};
    try {
        message = event.data ? event.data.json() : {};
    } catch (error) {
        console.error('Unable to read order status notification.', error);
    }

    event.waitUntil(showOrderNotification(message));
});

self.addEventListener('message', event => {
    const message = event.data;
    if (!message || message.type !== 'ORDER_STATUS_FALLBACK' ||
        !['preparing', 'ready', 'completed'].includes(message.status) ||
        typeof message.orderId !== 'string' || !/^ORD-[\w-]{1,60}$/.test(message.orderId)) {
        return;
    }
    const customerName = typeof message.customerName === 'string' && message.customerName.trim()
        ? message.customerName.trim()
        : 'Customer';
    const ready = message.status === 'ready';
    const completed = message.status === 'completed';
    event.waitUntil(showOrderNotification({
        ...message,
        title: 'Floréa',
        body: completed
            ? `${customerName}, THANK YOU SO MUCH!`
            : ready
                ? `${customerName}, OKAY NA PO ORDERS NIYO`
                : `${customerName}, PA WAIT LANG PO ORDERS NIYO`
    }));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;
    event.waitUntil((async () => {
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of clients) {
            if (new URL(client.url).origin === self.location.origin) {
                await client.navigate(targetUrl);
                return client.focus();
            }
        }
        return self.clients.openWindow(targetUrl);
    })());
});
