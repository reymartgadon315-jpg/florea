import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const pushScript = readFileSync(new URL('../florea-push.js', import.meta.url), 'utf8');

function createPushContext(existingSubscription) {
    let subscribeOptions;
    let unsubscribeCalls = 0;
    const newSubscription = { toJSON: () => ({ endpoint: 'new-subscription' }) };
    const registration = {
        update: async () => {},
        pushManager: {
            getSubscription: async () => existingSubscription,
            subscribe: async options => {
                subscribeOptions = options;
                return newSubscription;
            }
        }
    };
    const fetchApi = async () => ({
        ok: true,
        json: async () => ({ publicKey: 'AQID' })
    });
    const context = {
        window: { isSecureContext: true, PushManager: {}, Notification: {} },
        navigator: {
            serviceWorker: {
                register: async () => registration,
                ready: Promise.resolve(registration)
            }
        },
        Notification: { permission: 'granted' },
        atob: value => Buffer.from(value, 'base64').toString('binary'),
        Uint8Array,
        FloreaOrderSync: { fetchApi }
    };
    runInNewContext(pushScript, context);

    return {
        subscribe: () => context.window.FloreaPush.subscribeFromUserGesture(),
        getSubscribeOptions: () => subscribeOptions,
        getUnsubscribeCalls: () => unsubscribeCalls,
        incrementUnsubscribeCalls: () => { unsubscribeCalls += 1; },
        newSubscription
    };
}

test('replaces an existing phone subscription when the VAPID key changes', async () => {
    const existingSubscription = {
        options: { applicationServerKey: Uint8Array.from([9, 8, 7]).buffer },
        async unsubscribe() {
            push.incrementUnsubscribeCalls();
            return true;
        },
        toJSON: () => ({ endpoint: 'old-subscription' })
    };
    const push = createPushContext(existingSubscription);

    const result = await push.subscribe();

    assert.equal(push.getUnsubscribeCalls(), 1);
    assert.equal(result.subscription.endpoint, 'new-subscription');
    assert.deepEqual([...push.getSubscribeOptions().applicationServerKey], [1, 2, 3]);
});

test('keeps an existing phone subscription when its VAPID key is unchanged', async () => {
    const existingSubscription = {
        options: { applicationServerKey: Uint8Array.from([1, 2, 3]).buffer },
        async unsubscribe() {
            throw new Error('Matching subscriptions should not be removed.');
        },
        toJSON: () => ({ endpoint: 'existing-subscription' })
    };
    const push = createPushContext(existingSubscription);

    const result = await push.subscribe();

    assert.equal(result.subscription.endpoint, 'existing-subscription');
    assert.equal(push.getSubscribeOptions(), undefined);
});
