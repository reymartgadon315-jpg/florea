import {
    cashierSessionCookie,
    clearCashierSessionCookie,
    createCashierSession,
    verifyCashierPassword as verifyPlainCashierPassword,
    verifyCashierSession
} from './lib/cashier-session.mjs';
import {
    cashierLoginAttemptKey,
    clearCashierLoginFailures,
    getCashierLoginLock,
    recordCashierLoginFailure
} from './lib/cashier-login-attempts.mjs';
import { verifyCashierPassword } from './lib/cashier-password.mjs';
import { getStore } from './lib/get-store.mjs';
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

export async function handleCashierAuth(request, {
    attemptStore,
    now = Date.now()
} = {}) {
    const maintenance = maintenanceResponse();
    if (maintenance) return maintenance;
    const {
        CASHIER_PASSWORD,
        CASHIER_PASSWORD_HASH,
        CASHIER_SESSION_SECRET
    } = process.env;
    const cashierUsername = (process.env.CASHIER_USERNAME || 'cashier').trim();
    const hasPasswordConfiguration = Boolean(CASHIER_PASSWORD || CASHIER_PASSWORD_HASH);

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

    if (!hasPasswordConfiguration || !CASHIER_SESSION_SECRET || CASHIER_SESSION_SECRET.length < 32) {
        return jsonResponse(503, {
            error: 'Cashier sign-in is not configured. Set CASHIER_PASSWORD or CASHIER_PASSWORD_HASH and a 32-character CASHIER_SESSION_SECRET in the server environment.'
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

    const username = typeof payload?.username === 'string' ? payload.username.trim() : '';
    const password = typeof payload?.password === 'string' ? payload.password : '';
    if (!username || password.length === 0) {
        return jsonResponse(400, { error: 'Enter your username and password to continue.' });
    }

    const attemptKey = cashierLoginAttemptKey(cashierUsername);
    let store;
    let lock;
    try {
        store = attemptStore || getStore('cashier-login-attempts');
        lock = await getCashierLoginLock(store, attemptKey, now);
    } catch (error) {
        console.error('Cashier login-attempt storage is unavailable.', error);
        return jsonResponse(503, { error: 'Sign-in is temporarily unavailable. Please try again shortly.' });
    }
    if (lock?.lockedUntil) {
        return jsonResponse(429, {
            error: `Account temporarily locked. Please try again in ${Math.max(1, Math.ceil(lock.retryAfterSeconds / 60))} minutes.`
        }, { 'retry-after': String(lock.retryAfterSeconds) });
    }

    let validCredentials = false;
    try {
        const validUsername = verifyPlainCashierPassword(username, cashierUsername);
        const validPassword = await verifyCashierPassword(password, {
            password: CASHIER_PASSWORD,
            passwordHash: CASHIER_PASSWORD_HASH
        });
        validCredentials = validUsername && validPassword;
    } catch (error) {
        console.error('Cashier password verification failed.', error);
        return jsonResponse(503, { error: 'Sign-in is temporarily unavailable. Please try again shortly.' });
    }

    if (!validCredentials) {
        try {
            lock = await recordCashierLoginFailure(store, attemptKey, now);
        } catch (error) {
            console.error('Cashier login-attempt tracking failed.', error);
            return jsonResponse(503, { error: 'Sign-in is temporarily unavailable. Please try again shortly.' });
        }
        if (lock.lockedUntil) {
            return jsonResponse(429, {
                error: `Account temporarily locked. Please try again in ${Math.max(1, Math.ceil(lock.retryAfterSeconds / 60))} minutes.`
            }, { 'retry-after': String(lock.retryAfterSeconds) });
        }
        return jsonResponse(401, { error: 'Incorrect username or password.' });
    }

    try {
        await clearCashierLoginFailures(store, attemptKey);
    } catch (error) {
        console.error('Unable to clear cashier login-attempt history.', error);
        return jsonResponse(503, { error: 'Sign-in is temporarily unavailable. Please try again shortly.' });
    }

    const token = createCashierSession(CASHIER_SESSION_SECRET, now, cashierUsername);
    return jsonResponse(200, { authenticated: true, sessionToken: token }, {
        'set-cookie': cashierSessionCookie(token)
    });
}

export default function handler(request) {
    return handleCashierAuth(request);
}
