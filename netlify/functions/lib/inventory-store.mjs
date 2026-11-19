import { getStore } from './get-store.mjs';
import {
    createInitialInventory,
    mergeMissingMenuProducts
} from '../../../florea-inventory-shared.mjs';

export function getInventoryStore() {
    return getStore('florea-inventory', { consistency: 'strong' });
}

const inventoryKey = 'stock';

export async function readInventory(store = getInventoryStore()) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
        const current = await store.getWithMetadata(inventoryKey, { type: 'json' });
        if (current) {
            const migration = mergeMissingMenuProducts(current.data);
            if (!migration.changed) return current.data;
            const updated = await store.setJSON(inventoryKey, migration.inventory, { onlyIfMatch: current.etag });
            if (updated.modified) return migration.inventory;
            continue;
        }
        const created = await store.setJSON(inventoryKey, createInitialInventory(), { onlyIfNew: true });
        if (created.modified) return createInitialInventory();
    }
    throw new Error('Unable to initialize shared inventory after repeated concurrent updates.');
}

export async function updateInventory(update, store = getInventoryStore()) {
    for (let attempt = 0; attempt < 12; attempt += 1) {
        const current = await store.getWithMetadata(inventoryKey, { type: 'json' });
        if (!current) {
            const created = await store.setJSON(inventoryKey, createInitialInventory(), { onlyIfNew: true });
            if (created.modified) continue;
            continue;
        }

        const migration = mergeMissingMenuProducts(current.data);
        if (migration.changed) {
            const migrated = await store.setJSON(inventoryKey, migration.inventory, { onlyIfMatch: current.etag });
            if (!migrated.modified) continue;
            continue;
        }

        const result = update(current.data);
        if (!result.changed) return { ...result, inventory: current.data };
        const updated = await store.setJSON(inventoryKey, result.inventory, { onlyIfMatch: current.etag });
        if (updated.modified) return { ...result, inventory: result.inventory };
    }
    throw new Error('Shared inventory changed too often; please retry the operation.');
}
