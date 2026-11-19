import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/cashier-auth.mjs';

const secret = 'cashier-auth-test-secret-with-at-least-thirty-two-characters';

function request(method, body, cookie) {
    return new Request('https://example.test/api/cashier-auth', {
        method,
        headers: {
            ...(body === undefined ? {} : { 'content-type': 'application/json' }),
            ...(cookie ? { cookie } : {})
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
}

async function withCashierConfig(callback) {
    const originalPassword = process.env.CASHIER_PASSWORD;
    const originalSecret = process.env.CASHIER_SESSION_SECRET;
    process.env.CASHIER_PASSWORD = 'test-password';
    process.env.CASHIER_SESSION_SECRET = secret;
    try {
        return await callback();
    } finally {
        if (originalPassword === undefined) delete process.env.CASHIER_PASSWORD;
        else process.env.CASHIER_PASSWORD = originalPassword;
        if (originalSecret === undefined) delete process.env.CASHIER_SESSION_SECRET;
        else process.env.CASHIER_SESSION_SECRET = originalSecret;
    }
}

test('cashier auth rejects incorrect passwords and issues a verifiable session', async () => {
    await withCashierConfig(async () => {
        const rejected = await handler(request('POST', { password: 'wrong-password' }));
        assert.equal(rejected.status, 401);

        const accepted = await handler(request('POST', { password: 'test-password' }));
        assert.equal(accepted.status, 200);
        const cookie = accepted.headers.get('set-cookie');
        assert.match(cookie, /HttpOnly/);

        const session = await handler(request('GET', undefined, cookie.split(';')[0]));
        assert.equal(session.status, 200);
        assert.deepEqual(await session.json(), { authenticated: true });

        const logout = await handler(request('DELETE'));
        assert.equal(logout.status, 204);
        assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
    });
});

test('cashier auth reports missing server-side configuration', async () => {
    const originalPassword = process.env.CASHIER_PASSWORD;
    const originalSecret = process.env.CASHIER_SESSION_SECRET;
    delete process.env.CASHIER_PASSWORD;
    delete process.env.CASHIER_SESSION_SECRET;
    try {
        const response = await handler(request('GET'));
        assert.equal(response.status, 503);
        assert.match((await response.json()).error, /CASHIER_PASSWORD/);
    } finally {
        if (originalPassword === undefined) delete process.env.CASHIER_PASSWORD;
        else process.env.CASHIER_PASSWORD = originalPassword;
        if (originalSecret === undefined) delete process.env.CASHIER_SESSION_SECRET;
        else process.env.CASHIER_SESSION_SECRET = originalSecret;
    }
});
