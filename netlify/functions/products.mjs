import { synchronizeProductCatalog } from '../../florea-inventory-shared.mjs';
import { getInventoryStore, readInventory, updateInventory } from './lib/inventory-store.mjs';
import { verifyAdminSession } from './lib/admin-session.mjs';
import { maintenanceResponse } from './lib/maintenance.mjs';
import { validateProductCatalog } from './lib/product-catalog.mjs';

export const config = { path: '/api/products' };

function jsonResponse(statusCode, body) {
    return new Response(JSON.stringify(body), {
        status: statusCode,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store'
        }
    });
}

export async function handleProductsRequest(request, {
    store = getInventoryStore(),
    env = process.env
} = {}) {
    const maintenance = maintenanceResponse();
    if (maintenance) return maintenance;

    if (request.method === 'GET') {
        const inventory = await readInventory(store);
        return jsonResponse(200, { catalog: inventory.productCatalog || null });
    }

    if (request.method !== 'PUT') {
        return jsonResponse(405, { error: 'Method not allowed.' });
    }
    if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET || env.ADMIN_SESSION_SECRET.length < 32) {
        return jsonResponse(503, { error: 'Admin product editing is not configured on the server.' });
    }
    if (!verifyAdminSession(request, env.ADMIN_SESSION_SECRET)) {
        return jsonResponse(401, { error: 'Admin sign-in is required to update products.' });
    }

    let payload;
    try {
        payload = await request.json();
    } catch {
        return jsonResponse(400, { error: 'Request body must be valid JSON.' });
    }
    const validated = validateProductCatalog(payload?.categories);
    if (validated.error) return jsonResponse(400, { error: validated.error });

    const updatedAt = new Date().toISOString();
    const result = await updateInventory(inventory => ({
        changed: true,
        inventory: synchronizeProductCatalog(inventory, validated.categories, updatedAt)
    }), store);

    return jsonResponse(200, {
        catalog: result.inventory.productCatalog,
        inventory: result.inventory
    });
}

export default function handler(request) {
    return handleProductsRequest(request);
}
