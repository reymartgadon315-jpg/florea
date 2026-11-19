import {
    adminSessionCookie,
    clearAdminSessionCookie,
    createAdminSession,
    verifyAdminPassword,
    verifyAdminSession
} from './lib/admin-session.mjs';

export const config = { path: '/api/admin-auth' };

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
    const { ADMIN_PASSWORD, ADMIN_SESSION_SECRET } = process.env;

    if (request.method === 'DELETE') {
        return new Response(null, {
            status: 204,
            headers: {
                'cache-control': 'no-store',
                'set-cookie': clearAdminSessionCookie()
            }
        });
    }

    if (!['GET', 'POST'].includes(request.method)) {
        return jsonResponse(405, { error: 'Method not allowed.' }, { allow: 'GET, POST, DELETE' });
    }

    if (!ADMIN_PASSWORD || !ADMIN_SESSION_SECRET || ADMIN_SESSION_SECRET.length < 32) {
        return jsonResponse(503, {
            error: 'Admin sign-in is not configured. Set ADMIN_PASSWORD and a 32-character ADMIN_SESSION_SECRET in Netlify.'
        });
    }

    if (request.method === 'GET') {
        return verifyAdminSession(request, ADMIN_SESSION_SECRET)
            ? jsonResponse(200, { authenticated: true })
            : jsonResponse(401, { error: 'Admin session expired. Please sign in again.' });
    }

    let payload;
    try {
        payload = await request.json();
    } catch {
        return jsonResponse(400, { error: 'Request body must be valid JSON.' });
    }

    if (!verifyAdminPassword(payload?.password, ADMIN_PASSWORD)) {
        return jsonResponse(401, { error: 'Incorrect admin password.' });
    }

    const token = createAdminSession(ADMIN_SESSION_SECRET);
    return jsonResponse(200, { authenticated: true }, {
        'set-cookie': adminSessionCookie(token)
    });
}
