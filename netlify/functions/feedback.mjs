import { getStore } from './lib/get-store.mjs';
import { verifyCashierSession } from './lib/cashier-session.mjs';
import { maintenanceResponse } from './lib/maintenance.mjs';

export const config = { path: '/api/feedback' };

function jsonResponse(statusCode, body) {
    return new Response(JSON.stringify(body), {
        status: statusCode,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store'
        }
    });
}

export async function handleFeedbackRequest(request, store, sessionSecret) {
    if (request.method === 'GET') {
        if (!sessionSecret || sessionSecret.length < 32) {
            return jsonResponse(503, { error: 'Cashier feedback access is not configured.' });
        }
        if (!verifyCashierSession(request, sessionSecret)) {
            return jsonResponse(401, { error: 'Cashier sign-in is required to view feedback.' });
        }

        const feedback = [];
        for await (const page of store.list({ prefix: 'feedback:', paginate: true })) {
            const entries = await Promise.all(
                page.blobs.map(({ key }) => store.get(key, { type: 'json' }))
            );
            feedback.push(...entries.filter(Boolean));
        }
        feedback.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
        return jsonResponse(200, { feedback: feedback.slice(0, 100) });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
            status: 405,
            headers: {
                'allow': 'GET, POST',
                'content-type': 'application/json; charset=utf-8',
                'cache-control': 'no-store'
            }
        });
    }

    let payload;
    try {
        payload = await request.json();
    } catch {
        return jsonResponse(400, { error: 'Request body must be valid JSON.' });
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return jsonResponse(400, { error: 'Request body must be a JSON object.' });
    }

    const customerName = typeof payload.customerName === 'string' ? payload.customerName.trim() : '';
    const message = typeof payload.message === 'string' ? payload.message.trim() : '';
    if (!customerName || customerName.length > 80 || !message || message.length > 1000) {
        return jsonResponse(400, {
            error: 'Enter your name and feedback. Names must be under 80 characters and feedback under 1,000 characters.'
        });
    }

    const entry = {
        id: crypto.randomUUID(),
        customerName,
        message,
        createdAt: new Date().toISOString()
    };
    await store.setJSON(`feedback:${entry.id}`, entry, { onlyIfNew: true });
    return jsonResponse(201, { feedback: entry });
}

export default async function handler(request) {
    const maintenance = maintenanceResponse();
    if (maintenance) return maintenance;
    const store = getStore('florea-customer-feedback', { consistency: 'strong' });
    return handleFeedbackRequest(request, store, process.env.CASHIER_SESSION_SECRET);
}
