self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

const pendingNotifications = new Set();

async function showOrderNotification(message) {
    const status = ['preparing', 'ready'].includes(message.status) ? message.status : 'ready';
    const orderId = typeof message.orderId === 'string' ? message.orderId : 'order';
    const tag = `florea-order-${orderId}`;
    const notificationKey = `${tag}-${status}`;
    if (pendingNotifications.has(notificationKey)) return;
    pendingNotifications.add(notificationKey);

    try {
        const existing = await self.registration.getNotifications({ tag });
        if (existing.some(notification => notification.data?.status === status)) return;

        const ready = status === 'ready';
        const customerName = typeof message.customerName === 'string' && message.customerName.trim()
            ? message.customerName.trim()
            : 'Customer';
        await self.registration.showNotification(
            message.title || 'Floréa',
            {
                body: message.body || (ready
                    ? `${customerName}, OKAY NA PO ORDERS NIYO`
                    : `${customerName}, PA WAIT LANG PO`),
                icon: '/florea-logo-512.png',
                image: '/florea-logo.png',
                badge: '/florea-logo-192.png',
                data: { url: message.url || '/menu', orderId, status },
                tag,
                renotify: true
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
        !['preparing', 'ready'].includes(message.status) ||
        typeof message.orderId !== 'string' || !/^ORD-[\w-]{1,60}$/.test(message.orderId)) {
        return;
    }
    const customerName = typeof message.customerName === 'string' && message.customerName.trim()
        ? message.customerName.trim()
        : 'Customer';
    const ready = message.status === 'ready';
    event.waitUntil(showOrderNotification({
        ...message,
        title: 'Floréa',
        body: ready
            ? `${customerName}, OKAY NA PO ORDERS NIYO`
            : `${customerName}, PA WAIT LANG PO`
    }));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const targetUrl = new URL(event.notification.data?.url || '/menu', self.location.origin).href;
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
