import test from 'node:test';
import assert from 'node:assert/strict';
import webPush from 'web-push';
import handler from '../netlify/functions/push-key.mjs';

const variableNames = ['VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_SUBJECT'];

async function withVapidConfig(values, callback) {
    const previousValues = Object.fromEntries(variableNames.map(name => [name, process.env[name]]));
    for (const name of variableNames) {
        if (values[name] === undefined) delete process.env[name];
        else process.env[name] = values[name];
    }

    try {
        return await callback();
    } finally {
        for (const name of variableNames) {
            if (previousValues[name] === undefined) delete process.env[name];
            else process.env[name] = previousValues[name];
        }
    }
}

test('push-key reports which required notification variables are missing', async () => {
    await withVapidConfig({}, async () => {
        const response = await handler(new Request('https://example.test/api/push-key'));

        assert.equal(response.status, 503);
        assert.deepEqual((await response.json()).missingVariables, variableNames);
    });
});

test('push-key serves the configured public key without exposing the private key', async () => {
    const keys = webPush.generateVAPIDKeys();
    await withVapidConfig({
        VAPID_PUBLIC_KEY: keys.publicKey,
        VAPID_PRIVATE_KEY: keys.privateKey,
        VAPID_SUBJECT: 'https://example.test'
    }, async () => {
        const response = await handler(new Request('https://example.test/api/push-key'));
        const result = await response.json();

        assert.equal(response.status, 200);
        assert.equal(result.publicKey, keys.publicKey);
        assert.equal('privateKey' in result, false);
    });
});
