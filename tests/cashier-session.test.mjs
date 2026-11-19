import test from 'node:test';
import assert from 'node:assert/strict';
import {
    cashierSessionCookieName,
    createCashierSession,
    verifyCashierPassword,
    verifyCashierSession
} from '../netlify/functions/lib/cashier-session.mjs';

const secret = 'a-test-secret-with-at-least-thirty-two-characters';

test('cashier session accepts a valid signed and unexpired cookie', () => {
    const now = 1_800_000_000_000;
    const token = createCashierSession(secret, now);
    const request = new Request('https://example.test/api/orders', {
        headers: { cookie: `${cashierSessionCookieName}=${token}` }
    });

    assert.equal(verifyCashierSession(request, secret, now), true);
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
