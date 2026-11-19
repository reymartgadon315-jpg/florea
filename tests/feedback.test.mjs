import test from 'node:test';
import assert from 'node:assert/strict';
import { handleFeedbackRequest } from '../netlify/functions/feedback.mjs';
import {
    cashierSessionCookieName,
    createCashierSession
} from '../netlify/functions/lib/cashier-session.mjs';

const secret = 'feedback-test-secret-with-at-least-thirty-two-characters';

function createStore() {
    const entries = new Map();
    return {
        entries,
        async setJSON(key, value) {
            entries.set(key, value);
            return { modified: true };
        },
        async get(key) {
            return entries.get(key);
        },
        async *list({ prefix }) {
            yield {
                blobs: Array.from(entries.keys())
                    .filter(key => key.startsWith(prefix))
                    .map(key => ({ key }))
            };
        }
    };
}

function makeRequest(method, payload, cookie) {
    return new Request('https://example.test/api/feedback', {
        method,
        headers: {
            ...(payload === undefined ? {} : { 'content-type': 'application/json' }),
            ...(cookie ? { cookie } : {})
        },
        ...(payload === undefined ? {} : { body: JSON.stringify(payload) })
    });
}

test('customers can submit validated feedback and cashiers can retrieve it', async () => {
    const store = createStore();
    const submitted = await handleFeedbackRequest(
        makeRequest('POST', { customerName: '  Ana  ', message: '  Great coffee!  ' }),
        store,
        secret
    );

    assert.equal(submitted.status, 201);
    const savedFeedback = (await submitted.json()).feedback;
    assert.equal(savedFeedback.customerName, 'Ana');
    assert.equal(savedFeedback.message, 'Great coffee!');
    assert.ok(savedFeedback.id);
    assert.ok(savedFeedback.createdAt);

    const session = createCashierSession(secret);
    const listed = await handleFeedbackRequest(
        makeRequest('GET', undefined, `${cashierSessionCookieName}=${session}`),
        store,
        secret
    );
    assert.equal(listed.status, 200);
    assert.deepEqual((await listed.json()).feedback, [savedFeedback]);
});

test('feedback is not visible without cashier authentication', async () => {
    const response = await handleFeedbackRequest(
        makeRequest('GET'),
        createStore(),
        secret
    );
    assert.equal(response.status, 401);
});

test('feedback submission rejects blank and oversized values', async () => {
    const store = createStore();
    const blank = await handleFeedbackRequest(
        makeRequest('POST', { customerName: ' ', message: '  ' }),
        store,
        secret
    );
    const oversized = await handleFeedbackRequest(
        makeRequest('POST', { customerName: 'Ana', message: 'x'.repeat(1001) }),
        store,
        secret
    );

    assert.equal(blank.status, 400);
    assert.equal(oversized.status, 400);
    assert.equal(store.entries.size, 0);
});
