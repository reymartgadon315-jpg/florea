import assert from 'node:assert/strict';
import test from 'node:test';
import {
    applyOrderToInventory,
    restoreOrderInventory,
    synchronizeProductCatalog
} from '../florea-inventory-shared.mjs';
import { handleProductsRequest } from '../netlify/functions/products.mjs';
import {
    adminSessionCookieName,
    createAdminSession
} from '../netlify/functions/lib/admin-session.mjs';
import { getApiHandler } from '../server/routes/api-routes.mjs';

const secret = 'product-catalog-test-secret-with-at-least-thirty-two-characters';
const env = { ADMIN_PASSWORD: 'test-password', ADMIN_SESSION_SECRET: secret };

class MemoryStore {
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
        this.records.set(key, {
            data: JSON.parse(JSON.stringify(data)),
            etag: String(++this.nextEtag)
        });
        return { modified: true };
    }
}

function request(method, body, authenticated = false) {
    return new Request('https://example.test/api/products', {
        method,
        headers: {
            ...(body === undefined ? {} : { 'content-type': 'application/json' }),
            ...(authenticated
                ? { cookie: `${adminSessionCookieName}=${createAdminSession(secret)}` }
                : {})
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
}

test('product catalog API shares edits and inventory using the existing inventory record', async () => {
    const store = new MemoryStore();
    const initial = await handleProductsRequest(request('GET'), { store, env });
    assert.equal(initial.status, 200);
    assert.equal((await initial.json()).catalog, null);

    const initialInventory = await store.getWithMetadata('stock');
    const americano = initialInventory.data.items.find(item => item.name === 'Americano');
    initialInventory.data.items = initialInventory.data.items.map(item =>
        item.id === americano.id ? { ...item, unitCost: 18 } : item
    );
    await store.setJSON('stock', initialInventory.data, { onlyIfMatch: initialInventory.etag });

    const categories = {
        Coffee: [{
            n: 'House Coffee',
            d: 'A new customer-facing description.',
            p: '₱ 89.00',
            quantity: 8,
            inventoryId: americano.id
        }]
    };
    const unauthorized = await handleProductsRequest(
        request('PUT', { categories }),
        { store, env }
    );
    assert.equal(unauthorized.status, 401);
    assert.equal((await store.getWithMetadata('stock')).data.productCatalog, undefined);

    const saved = await handleProductsRequest(
        request('PUT', { categories }, true),
        { store, env }
    );
    assert.equal(saved.status, 200);
    const result = await saved.json();
    assert.equal(result.catalog.categories.Coffee[0].n, 'House Coffee');
    assert.equal(result.catalog.categories.Coffee[0].p, '₱ 89.00');
    assert.equal(result.inventory.items.find(item => item.id === americano.id).unitCost, 18);
    assert.equal(result.inventory.items.find(item => item.id === americano.id).available, true);
    assert.equal(result.inventory.items.find(item => item.id === americano.id).name, 'House Coffee');
    assert.ok(result.inventory.items.some(item => item.name === 'Spanish Latte' && item.available === false));
    assert.equal(getApiHandler('/api/products').handler, (await import('../netlify/functions/products.mjs')).default);
    assert.equal(applyOrderToInventory(result.inventory, 'stale-order', [
        { name: 'Americano', quantity: 1, drinkSize: 'Medium' }
    ]).success, false);

    const legacyOrder = applyOrderToInventory(result.inventory, 'legacy-order', [
        { name: 'Americano', quantity: 1, drinkSize: 'Medium' }
    ], undefined, { allowAliases: true });
    assert.equal(legacyOrder.success, true);
    const restored = restoreOrderInventory(legacyOrder.inventory, 'legacy-order', [
        { name: 'Americano', quantity: 1, drinkSize: 'Medium' }
    ]);
    assert.equal(restored.success, true);
    assert.equal(
        restored.inventory.items.find(item => item.id === americano.id).quantity,
        result.inventory.items.find(item => item.id === americano.id).quantity
    );

    const archived = synchronizeProductCatalog(legacyOrder.inventory, { Coffee: [] });
    assert.equal(
        applyOrderToInventory(archived, 'new-order', [
            { name: 'House Coffee', quantity: 1, drinkSize: 'Medium' }
        ]).success,
        false
    );
    const cancelled = restoreOrderInventory(archived, 'legacy-order', [
        { name: 'Americano', quantity: 1, drinkSize: 'Medium' }
    ]);
    assert.equal(cancelled.success, true);

    const reread = await handleProductsRequest(request('GET'), { store, env });
    assert.equal((await reread.json()).catalog.categories.Coffee[0].n, 'House Coffee');
});

test('product catalog API rejects unauthenticated writes and duplicate product names', async () => {
    const store = new MemoryStore();
    const categories = {
        Coffee: [{ n: 'Same Drink', p: '₱ 50.00' }],
        Matcha: [{ n: 'same drink', p: '₱ 60.00' }]
    };
    const response = await handleProductsRequest(
        request('PUT', { categories }, true),
        { store, env }
    );
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /unique/i);
    assert.equal(store.records.size, 0);
});
