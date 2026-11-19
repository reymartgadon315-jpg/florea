import {
    cashierSessionCookie,
    clearCashierSessionCookie,
    createCashierSession,
    verifyCashierPassword,
    verifyCashierSession
} from './lib/cashier-session.mjs';
import { maintenanceResponse } from './lib/maintenance.mjs';

export const config = { path: '/api/cashier-auth' };

function jsonResponse(statusCode, body, headers = {}) {
    return new Response(JSON.stringify(body), {
        status: statusCode,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
            ...headers
        }
    });
}

export default async function handler(request) {
    const maintenance = maintenanceResponse();
    if (maintenance) return maintenance;
    const { CASHIER_PASSWORD, CASHIER_SESSION_SECRET } = process.env;

    if (request.method === 'DELETE') {
        return new Response(null, {
            status: 204,
            headers: {
                'cache-control': 'no-store',
                'set-cookie': clearCashierSessionCookie()
            }
        });
    }

    if (!['GET', 'POST'].includes(request.method)) {
        return jsonResponse(405, { error: 'Method not allowed.' }, { allow: 'GET, POST, DELETE' });
    }

    if (!CASHIER_PASSWORD || !CASHIER_SESSION_SECRET || CASHIER_SESSION_SECRET.length < 32) {
        return jsonResponse(503, {
            error: 'Cashier sign-in is not configured. Set CASHIER_PASSWORD and a 32-character CASHIER_SESSION_SECRET in the server environment.'
        });
    }

    if (request.method === 'GET') {
        return verifyCashierSession(request, CASHIER_SESSION_SECRET)
            ? jsonResponse(200, { authenticated: true })
            : jsonResponse(401, { error: 'Cashier session expired. Please sign in again.' });
    }

    let payload;
    try {
        payload = await request.json();
    } catch {
        return jsonResponse(400, { error: 'Request body must be valid JSON.' });
    }

    if (!verifyCashierPassword(payload?.password, CASHIER_PASSWORD)) {
        return jsonResponse(401, { error: 'Incorrect cashier password.' });
    }

    const token = createCashierSession(CASHIER_SESSION_SECRET);
    return jsonResponse(200, { authenticated: true }, {
        'set-cookie': cashierSessionCookie(token)
    });
}
