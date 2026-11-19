import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { PostgresBlobStore } from '../netlify/functions/lib/postgres-blob-store.mjs';

class MemoryDatabase {
    constructor() {
        this.rows = new Map();
    }

    async query(sql, values = []) {
        const statement = sql.trim();
        if (statement.startsWith('CREATE TABLE')) return { rows: [] };
        if (statement.startsWith('SELECT data')) {
            const row = this.rows.get(`${values[0]}:${values[1]}`);
            return { rows: row ? [{ ...row }] : [] };
        }
        if (statement.startsWith('SELECT key')) {
            const [storeName, prefix, lastKey, limit] = values;
            const rows = [...this.rows.values()]
                .filter(row => row.store_name === storeName && row.key.startsWith(prefix) &&
                    (lastKey === undefined || row.key > lastKey))
                .sort((left, right) => left.key.localeCompare(right.key));
            const selectedRows = limit === undefined ? rows : rows.slice(0, limit);
            return { rows: selectedRows.map(({ key, etag }) => ({ key, etag })) };
        }
        if (statement.startsWith('INSERT')) {
            const [store_name, key, data, content_type, metadata, etag] = values;
            const rowKey = `${store_name}:${key}`;
            const existing = this.rows.get(rowKey);
            if (existing && statement.includes('DO NOTHING')) return { rows: [] };
            const row = { store_name, key, data: Buffer.from(data), content_type, metadata: JSON.parse(metadata), etag };
            this.rows.set(rowKey, row);
            return { rows: [{ etag }] };
        }
        if (statement.startsWith('UPDATE')) {
            const [store_name, key, data, content_type, metadata, etag, currentEtag] = values;
            const rowKey = `${store_name}:${key}`;
            const existing = this.rows.get(rowKey);
            if (!existing || existing.etag !== currentEtag) return { rows: [] };
            this.rows.set(rowKey, {
                store_name, key, data: Buffer.from(data), content_type, metadata: JSON.parse(metadata), etag
            });
            return { rows: [{ etag }] };
        }
        if (statement.startsWith('DELETE')) {
            this.rows.delete(`${values[0]}:${values[1]}`);
            return { rows: [] };
        }
        throw new Error(`Unexpected SQL in test: ${statement}`);
    }
}

test('PostgreSQL blob store preserves JSON, binary metadata, and conditional writes', async () => {
    const database = new MemoryDatabase();
    const store = new PostgresBlobStore('test', database);
    const initial = { inventory: [{ id: 'item-1', quantity: 3 }] };

    assert.equal((await store.setJSON('stock', initial, { onlyIfNew: true })).modified, true);
    assert.equal((await store.setJSON('stock', initial, { onlyIfNew: true })).modified, false);

    const record = await store.getWithMetadata('stock', { type: 'json' });
    assert.deepEqual(record.data, initial);
    assert.equal((await store.setJSON('stock', { inventory: [] }, { onlyIfMatch: randomUUID() })).modified, false);
    assert.equal((await store.setJSON('stock', { inventory: [] }, { onlyIfMatch: record.etag })).modified, true);

    const imageBytes = Uint8Array.from([0x89, 0x50, 0x4e, 0x47]);
    await store.set('image', new Blob([imageBytes], { type: 'image/png' }), {
        metadata: { contentType: 'image/png' }
    });
    const image = await store.getWithMetadata('image', { type: 'arrayBuffer' });
    assert.deepEqual(Buffer.from(image.data), Buffer.from(imageBytes));
    assert.equal(image.metadata.contentType, 'image/png');
    assert.deepEqual((await store.list()).blobs.map(blob => blob.key), ['image', 'stock']);
});
