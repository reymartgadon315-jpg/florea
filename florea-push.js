function decodeApplicationServerKey(value) {
    const padding = '='.repeat((4 - value.length % 4) % 4);
    const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
    return Uint8Array.from(atob(base64), character => character.charCodeAt(0));
}

function subscriptionUsesKey(subscription, applicationServerKey) {
    const existingKey = subscription?.options?.applicationServerKey;
    if (!existingKey) return false;

    const existingKeyBytes = new Uint8Array(existingKey);
    return existingKeyBytes.length === applicationServerKey.length &&
        existingKeyBytes.every((byte, index) => byte === applicationServerKey[index]);
}

window.FloreaPush = {
    async subscribeFromUserGesture() {
        if (!window.isSecureContext || !('serviceWorker' in navigator) ||
            !('PushManager' in window) || !('Notification' in window)) {
            return {
                subscription: null,
                message: 'This browser cannot show phone notifications. Enable notifications in a supported browser to receive order updates.'
            };
        }

        const permissionRequest = Notification.permission === 'default'
            ? Notification.requestPermission()
            : Promise.resolve(Notification.permission);
        const permission = await permissionRequest;
        if (permission !== 'granted') {
            return {
                subscription: null,
                message: 'Phone notifications are blocked on this device. Allow notifications in your browser settings to receive order updates.'
            };
        }

        const keyResponse = await fetch('/api/push-key');
        const keyResult = await keyResponse.json();
        if (!keyResponse.ok || typeof keyResult.publicKey !== 'string') {
            throw new Error(keyResult.error || `Push setup returned ${keyResponse.status}.`);
        }

        const registration = await navigator.serviceWorker.register('/service-worker.js', {
            updateViaCache: 'none'
        });
        await registration.update();
        await navigator.serviceWorker.ready;
        const applicationServerKey = decodeApplicationServerKey(keyResult.publicKey);
        const existingSubscription = await registration.pushManager.getSubscription();
        let subscription = existingSubscription;
        if (existingSubscription && !subscriptionUsesKey(existingSubscription, applicationServerKey)) {
            const unsubscribed = await existingSubscription.unsubscribe();
            if (!unsubscribed) {
                throw new Error('The previous phone notification subscription could not be replaced.');
            }
            subscription = null;
        }
        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey
            });
        }
        return {
            subscription: subscription.toJSON(),
            message: 'Phone notifications are enabled for order updates.'
        };
    }
};
