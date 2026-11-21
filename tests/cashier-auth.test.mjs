import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { handleCashierAuth } from '../netlify/functions/cashier-auth.mjs';
import { hashCashierPassword } from '../netlify/functions/lib/cashier-password.mjs';

const secret = 'cashier-auth-test-secret-with-at-least-thirty-two-characters';

class MemoryAttemptStore {
    records = new Map();
    nextEtag = 0;

    async getWithMetadata(key) {
        const record = this.records.get(key);
        return record ? {
            data: JSON.parse(JSON.stringify(record.data)),
            etag: record.etag
        } : null;
    }

    async setJSON(key, data, options = {}) {
        const current = this.records.get(key);
        if (options.onlyIfNew && current) return { modified: false };
        if (options.onlyIfMatch !== undefined && current?.etag !== options.onlyIfMatch) {
            return { modified: false };
        }
        this.records.set(key, { data: JSON.parse(JSON.stringify(data)), etag: String(++this.nextEtag) });
        return { modified: true };
    }

    async delete(key) {
        this.records.delete(key);
    }
}

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
    const originalPasswordHash = process.env.CASHIER_PASSWORD_HASH;
    const originalUsername = process.env.CASHIER_USERNAME;
    const originalSecret = process.env.CASHIER_SESSION_SECRET;
    process.env.CASHIER_USERNAME = 'cashier';
    process.env.CASHIER_PASSWORD = 'test-password';
    delete process.env.CASHIER_PASSWORD_HASH;
    process.env.CASHIER_SESSION_SECRET = secret;
    try {
        return await callback();
    } finally {
        if (originalPassword === undefined) delete process.env.CASHIER_PASSWORD;
        else process.env.CASHIER_PASSWORD = originalPassword;
        if (originalPasswordHash === undefined) delete process.env.CASHIER_PASSWORD_HASH;
        else process.env.CASHIER_PASSWORD_HASH = originalPasswordHash;
        if (originalUsername === undefined) delete process.env.CASHIER_USERNAME;
        else process.env.CASHIER_USERNAME = originalUsername;
        if (originalSecret === undefined) delete process.env.CASHIER_SESSION_SECRET;
        else process.env.CASHIER_SESSION_SECRET = originalSecret;
    }
}

test('cashier auth rejects invalid credentials and issues a verifiable session', async () => {
    await withCashierConfig(async () => {
        const attemptStore = new MemoryAttemptStore();
        const rejected = await handleCashierAuth(request('POST', {
            username: 'cashier',
            password: 'wrong-password'
        }), { attemptStore });
        assert.equal(rejected.status, 401);

        const wrongUsername = await handleCashierAuth(request('POST', {
            username: 'someone-else',
            password: 'test-password'
        }), { attemptStore });
        assert.equal(wrongUsername.status, 401);

        const accepted = await handleCashierAuth(request('POST', {
            username: 'cashier',
            password: 'test-password'
        }), { attemptStore });
        assert.equal(accepted.status, 200);
        const cookie = accepted.headers.get('set-cookie');
        assert.match(cookie, /HttpOnly/);

        const session = await handleCashierAuth(request('GET', undefined, cookie.split(';')[0]), { attemptStore });
        assert.equal(session.status, 200);
        assert.deepEqual(await session.json(), { authenticated: true });

        const logout = await handleCashierAuth(request('DELETE'), { attemptStore });
        assert.equal(logout.status, 204);
        assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
    });
});

test('cashier auth locks after five failed attempts and allows login after expiration', async () => {
    await withCashierConfig(async () => {
        const attemptStore = new MemoryAttemptStore();
        const now = 1_800_000_000_000;
        for (let attempt = 0; attempt < 4; attempt += 1) {
            const response = await handleCashierAuth(request('POST', {
                username: 'cashier',
                password: 'wrong-password'
            }), { attemptStore, now });
            assert.equal(response.status, 401);
        }

        const fifthFailure = await handleCashierAuth(request('POST', {
            username: 'cashier',
            password: 'wrong-password'
        }), { attemptStore, now });
        assert.equal(fifthFailure.status, 429);

        const locked = await handleCashierAuth(request('POST', {
            username: 'cashier',
            password: 'test-password'
        }), { attemptStore, now });
        assert.equal(locked.status, 429);
        assert.match((await locked.json()).error, /temporarily locked/i);
        assert.equal(Number(locked.headers.get('retry-after')), 900);

        const unlocked = await handleCashierAuth(request('POST', {
            username: 'cashier',
            password: 'test-password'
        }), { attemptStore, now: now + 15 * 60 * 1000 });
        assert.equal(unlocked.status, 200);
    });
});

test('successful cashier login clears the failed-attempt counter', async () => {
    await withCashierConfig(async () => {
        const attemptStore = new MemoryAttemptStore();
        const now = 1_800_000_000_000;
        for (let attempt = 0; attempt < 4; attempt += 1) {
            const response = await handleCashierAuth(request('POST', {
                username: 'cashier',
                password: 'wrong-password'
            }), { attemptStore, now });
            assert.equal(response.status, 401);
        }

        const accepted = await handleCashierAuth(request('POST', {
            username: 'cashier',
            password: 'test-password'
        }), { attemptStore, now });
        assert.equal(accepted.status, 200);

        const newFailure = await handleCashierAuth(request('POST', {
            username: 'cashier',
            password: 'wrong-password'
        }), { attemptStore, now });
        assert.equal(newFailure.status, 401);
    });
});

test('cashier auth preserves the lockout threshold under concurrent failures', async () => {
    await withCashierConfig(async () => {
        const attemptStore = new MemoryAttemptStore();
        const now = 1_800_000_000_000;
        const responses = await Promise.all(Array.from({ length: 5 }, () =>
            handleCashierAuth(request('POST', {
                username: 'cashier',
                password: 'wrong-password'
            }), { attemptStore, now })
        ));

        assert.equal(responses.filter(response => response.status === 401).length, 4);
        assert.equal(responses.filter(response => response.status === 429).length, 1);
        const validCredentialsWhileLocked = await handleCashierAuth(request('POST', {
            username: 'cashier',
            password: 'test-password'
        }), { attemptStore, now });
        assert.equal(validCredentialsWhileLocked.status, 429);
    });
});

test('cashier auth verifies configured scrypt password hashes', async () => {
    await withCashierConfig(async () => {
        process.env.CASHIER_PASSWORD_HASH = await hashCashierPassword('hashed-password');
        delete process.env.CASHIER_PASSWORD;
        const attemptStore = new MemoryAttemptStore();
        const response = await handleCashierAuth(request('POST', {
            username: 'cashier',
            password: 'hashed-password'
        }), { attemptStore });
        assert.equal(response.status, 200);
    });
});

test('cashier auth reports missing server-side configuration', async () => {
    const originalPassword = process.env.CASHIER_PASSWORD;
    const originalPasswordHash = process.env.CASHIER_PASSWORD_HASH;
    const originalSecret = process.env.CASHIER_SESSION_SECRET;
    delete process.env.CASHIER_PASSWORD;
    delete process.env.CASHIER_PASSWORD_HASH;
    delete process.env.CASHIER_SESSION_SECRET;
    try {
        const response = await handler(request('GET'));
        assert.equal(response.status, 503);
        assert.match((await response.json()).error, /CASHIER_PASSWORD/);
    } finally {
        if (originalPassword === undefined) delete process.env.CASHIER_PASSWORD;
        else process.env.CASHIER_PASSWORD = originalPassword;
        if (originalPasswordHash === undefined) delete process.env.CASHIER_PASSWORD_HASH;
        else process.env.CASHIER_PASSWORD_HASH = originalPasswordHash;
        if (originalSecret === undefined) delete process.env.CASHIER_SESSION_SECRET;
        else process.env.CASHIER_SESSION_SECRET = originalSecret;
    }
});
