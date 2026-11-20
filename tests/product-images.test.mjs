import test from 'node:test';
import assert from 'node:assert/strict';
import {
    handleProductImageRequest,
    maxProductImageBytes
} from '../netlify/functions/product-images.mjs';
import adminAuthHandler from '../netlify/functions/admin-auth.mjs';
import {
    adminSessionCookieName,
    createAdminSession
} from '../netlify/functions/lib/admin-session.mjs';

const secret = 'product-image-test-secret-with-at-least-thirty-two-characters';
const env = { ADMIN_PASSWORD: 'test-password', ADMIN_SESSION_SECRET: secret };

function createStore() {
    const entries = new Map();
    return {
        entries,
        async set(key, blob, options) {
            entries.set(key, { data: blob, metadata: options.metadata, etag: '"test-etag"' });
        },
        async getWithMetadata(key) {
            return entries.get(key) || null;
        }
    };
}

function uploadRequest(bytes, contentType = 'image/png', authenticated = true) {
    const headers = { 'content-type': contentType };
    if (authenticated) headers.cookie = `${adminSessionCookieName}=${createAdminSession(secret)}`;
    return new Request('https://example.test/api/product-images/upload', {
        method: 'POST',
        headers,
        body: bytes
    });
}

test('hosted admin authentication issues a server-verified session', async () => {
    const previousPassword = process.env.ADMIN_PASSWORD;
    const previousSecret = process.env.ADMIN_SESSION_SECRET;
    process.env.ADMIN_PASSWORD = env.ADMIN_PASSWORD;
    process.env.ADMIN_SESSION_SECRET = secret;
    try {
        const login = await adminAuthHandler(new Request('https://example.test/api/admin-auth', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: env.ADMIN_PASSWORD })
        }));
        assert.equal(login.status, 200);
        const cookie = login.headers.get('set-cookie');
        assert.match(cookie, new RegExp(`^${adminSessionCookieName}=`));

        const session = await adminAuthHandler(new Request('https://example.test/api/admin-auth', {
            headers: { cookie: cookie.split(';')[0] }
        }));
        assert.equal(session.status, 200);

        const rejected = await adminAuthHandler(new Request('https://example.test/api/admin-auth', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'wrong-password' })
        }));
        assert.equal(rejected.status, 401);

        const rejectedUsername = await adminAuthHandler(new Request('https://example.test/api/admin-auth', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ username: 'owner@bloom.ph', password: env.ADMIN_PASSWORD })
        }));
        assert.equal(rejectedUsername.status, 401);
    } finally {
        if (previousPassword === undefined) delete process.env.ADMIN_PASSWORD;
        else process.env.ADMIN_PASSWORD = previousPassword;
        if (previousSecret === undefined) delete process.env.ADMIN_SESSION_SECRET;
        else process.env.ADMIN_SESSION_SECRET = previousSecret;
    }
});

test('stores and serves original image bytes without re-encoding', async () => {
    const store = createStore();
    const bytes = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
    const uploaded = await handleProductImageRequest(uploadRequest(bytes), store, env);

    assert.equal(uploaded.status, 201);
    const result = await uploaded.json();
    assert.match(result.url, /^\/api\/product-images\/[0-9a-f-]{36}$/);
    assert.equal(result.size, bytes.byteLength);
    const key = result.url.split('/').pop();
    const served = await handleProductImageRequest(
        new Request(`https://example.test${result.url}`),
        store,
        env
    );
    assert.equal(served.status, 200);
    assert.equal(served.headers.get('content-type'), 'image/png');
    assert.deepEqual(new Uint8Array(await served.arrayBuffer()), bytes);
    assert.equal(store.entries.get(key).metadata.contentType, 'image/png');
});

test('accepts JPG and WEBP files with matching signatures', async () => {
    const fixtures = [
        ['image/jpeg', [0xff, 0xd8, 0xff, 0x01]],
        ['image/webp', [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]]
    ];
    for (const [contentType, fixture] of fixtures) {
        const store = createStore();
        const response = await handleProductImageRequest(
            uploadRequest(Uint8Array.from(fixture), contentType),
            store,
            env
        );
        assert.equal(response.status, 201);
        assert.equal((await response.json()).contentType, contentType);
    }
});

test('rejects unauthenticated, unsupported, mismatched, and oversized uploads', async () => {
    const store = createStore();
    const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

    assert.equal((await handleProductImageRequest(uploadRequest(png, 'image/png', false), store, env)).status, 401);
    assert.equal((await handleProductImageRequest(uploadRequest(png, 'image/gif'), store, env)).status, 415);
    assert.equal((await handleProductImageRequest(uploadRequest(png, 'image/jpeg'), store, env)).status, 415);
    assert.equal((await handleProductImageRequest(uploadRequest(new Uint8Array(maxProductImageBytes + 1)), store, env)).status, 413);
    assert.equal(store.entries.size, 0);
});

test('rejects image retrieval for invalid or missing keys', async () => {
    const store = createStore();
    const invalid = await handleProductImageRequest(
        new Request('https://example.test/api/product-images/../../secret'),
        store,
        env
    );
    const missing = await handleProductImageRequest(
        new Request('https://example.test/api/product-images/123e4567-e89b-42d3-a456-426614174000'),
        store,
        env
    );
    assert.equal(invalid.status, 404);
    assert.equal(missing.status, 404);
});
