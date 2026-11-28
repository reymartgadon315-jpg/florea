import test from 'node:test';
import assert from 'node:assert/strict';
import {
    cashierSessionCookieName,
    createCashierSession,
    getCashierSession,
    verifyCashierPassword,
    verifyCashierSession
} from '../netlify/functions/lib/cashier-session.mjs';

const secret = 'a-test-secret-with-at-least-thirty-two-characters';

test('cashier session accepts a valid signed and unexpired cookie', () => {
    const now = 1_800_000_000_000;
    const token = createCashierSession(secret, now, 'front-counter');
    const secondToken = createCashierSession(secret, now);
    const payload = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString('utf8'));
    const secondPayload = JSON.parse(Buffer.from(secondToken.split('.')[0], 'base64url').toString('utf8'));
    const request = new Request('https://example.test/api/orders', {
        headers: { cookie: `${cashierSessionCookieName}=${token}` }
    });

    assert.equal(typeof payload.jti, 'string');
    assert.ok(payload.jti.length > 0);
    assert.notEqual(payload.jti, secondPayload.jti);
    assert.equal(verifyCashierSession(request, secret, now), true);
    assert.equal(getCashierSession(request, secret, now).username, 'front-counter');
});

test('cashier session accepts a bearer token fallback', () => {
    const now = 1_800_000_000_000;
    const token = createCashierSession(secret, now, 'front-counter');
    const request = new Request('https://example.test/api/orders/ORD-1001', {
        headers: { authorization: `Bearer ${token}` },
        method: 'PATCH'
    });

    assert.equal(verifyCashierSession(request, secret, now), true);
    assert.equal(getCashierSession(request, secret, now).username, 'front-counter');
});

test('cashier session rejects tampering, expiration, and a wrong secret', () => {
    const now = 1_800_000_000_000;
    const token = createCashierSession(secret, now);
    const makeRequest = value => new Request('https://example.test/api/orders', {
        headers: { cookie: `${cashierSessionCookieName}=${value}` }
    });

    assert.equal(verifyCashierSession(makeRequest(`${token}x`), secret, now), false);
    assert.equal(verifyCashierSession(makeRequest(token), secret, now + 8 * 60 * 60 * 1000), false);
    assert.equal(verifyCashierSession(makeRequest(token), `${secret}-wrong`, now), false);
});

test('cashier password comparison rejects mismatches', () => {
    assert.equal(verifyCashierPassword('correct-password', 'correct-password'), true);
    assert.equal(verifyCashierPassword('wrong-password', 'correct-password'), false);
});
