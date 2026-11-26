import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const syncScript = readFileSync(new URL('../florea-orders.js', import.meta.url), 'utf8');

function loadOrderSync(hostname, origin) {
    const calls = [];
    const context = {
        window: { location: { hostname, origin } },
        URL,
        fetch: async (url, options) => {
            calls.push({ url, options });
            return { status: 200, ok: true, json: async () => ({ orders: [] }) };
        }
    };
    runInNewContext(syncScript, context);
    return { sync: context.window.FloreaOrderSync, calls };
}

test('Render Static Site requests use the separate API host and credentialed CORS', async () => {
    const { sync, calls } = loadOrderSync('florea.onrender.com', 'https://florea.onrender.com');

    await sync.request('/api/orders');

    assert.equal(sync.apiUrl('/api/orders'), 'https://florea-api.onrender.com/api/orders');
    assert.equal(calls[0].url, 'https://florea-api.onrender.com/api/orders');
    assert.equal(calls[0].options.credentials, 'include');
    assert.equal(calls[0].options.cache, 'no-store');
    assert.equal(
        sync.resolveImageUrl('/api/product-images/123e4567-e89b-42d3-a456-426614174000'),
        'https://florea-api.onrender.com/api/product-images/123e4567-e89b-42d3-a456-426614174000'
    );
});

test('other deployments keep using their own origin for API requests', async () => {
    const { sync, calls } = loadOrderSync('florea.netlify.app', 'https://florea.netlify.app');

    await sync.request('/api/orders');

    assert.equal(calls[0].url, 'https://florea.netlify.app/api/orders');
    assert.equal(calls[0].options.credentials, 'same-origin');
    assert.equal(calls[0].options.cache, 'no-store');
});
