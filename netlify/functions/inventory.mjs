import { adjustInventoryItem } from '../../florea-inventory-shared.mjs';
import { getInventoryStore, readInventory, updateInventory } from './lib/inventory-store.mjs';
import { maintenanceResponse } from './lib/maintenance.mjs';

export const config = { path: '/api/inventory' };

function jsonResponse(statusCode, body) {
    return new Response(JSON.stringify(body), {
        status: statusCode,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store'
        }
    });
}

export default async function handler(request) {
    const maintenance = maintenanceResponse();
    if (maintenance) return maintenance;
    if (request.method === 'GET') {
        return jsonResponse(200, { inventory: await readInventory(getInventoryStore()) });
    }
    if (request.method !== 'PATCH') {
        return jsonResponse(405, { error: 'Method not allowed.' });
    }

    let payload;
    try {
        payload = await request.json();
    } catch {
        return jsonResponse(400, { error: 'Request body must be valid JSON.' });
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload) ||
        typeof payload.itemId !== 'string' || payload.itemId.length > 300 ||
        !['add', 'remove', 'set'].includes(payload.direction) ||
        !Number.isInteger(payload.quantity) ||
        payload.quantity < (payload.direction === 'set' ? 0 : 1) || payload.quantity > 100000) {
        return jsonResponse(400, { error: 'A valid inventory item, adjustment direction, and whole-number quantity are required.' });
    }

    const result = await updateInventory(inventory => {
        const adjustment = adjustInventoryItem(
            inventory,
            payload.itemId,
            payload.direction,
            payload.quantity
        );
        if (!adjustment.success) return { changed: false, ...adjustment };
        return { changed: true, inventory: adjustment.inventory };
    }, getInventoryStore());

    if (result.notFound) return jsonResponse(404, { error: 'Inventory item not found.' });
    if (result.insufficient) return jsonResponse(409, { error: 'Stock cannot be reduced below zero.' });
    return jsonResponse(200, { inventory: result.inventory });
}
