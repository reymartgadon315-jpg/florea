import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const cashierSessionCookieName = 'florea-cashier-session';
export const cashierSessionTtlSeconds = 8 * 60 * 60;

function signature(payload, secret) {
    return createHmac('sha256', secret).update(payload).digest('base64url');
}

function constantTimeEqual(left, right) {
    return timingSafeEqual(
        createHash('sha256').update(left).digest(),
        createHash('sha256').update(right).digest()
    );
}

export function verifyCashierPassword(candidate, expected) {
    if (typeof candidate !== 'string' || typeof expected !== 'string' || !expected) return false;
    return constantTimeEqual(candidate, expected);
}

export function createCashierSession(secret, now = Date.now()) {
    const payload = Buffer.from(JSON.stringify({
        role: 'cashier',
        exp: Math.floor(now / 1000) + cashierSessionTtlSeconds
    })).toString('base64url');
    return `${payload}.${signature(payload, secret)}`;
}

export function verifyCashierSession(request, secret, now = Date.now()) {
    if (!secret) return false;
    const cookieHeader = request.headers.get('cookie') || '';
    const cookie = cookieHeader.split(';').map(value => value.trim())
        .find(value => value.startsWith(`${cashierSessionCookieName}=`));
    if (!cookie) return false;

    const token = cookie.slice(cashierSessionCookieName.length + 1);
    const [payload, providedSignature, ...extra] = token.split('.');
    if (!payload || !providedSignature || extra.length) return false;

    const expectedSignature = signature(payload, secret);
    if (!constantTimeEqual(providedSignature, expectedSignature)) return false;

    try {
        const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        return session.role === 'cashier' &&
            Number.isInteger(session.exp) &&
            session.exp > Math.floor(now / 1000);
    } catch {
        return false;
    }
}

export function cashierSessionCookie(token) {
    return `${cashierSessionCookieName}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=${cashierSessionTtlSeconds}`;
}

export function clearCashierSessionCookie() {
    return `${cashierSessionCookieName}=; HttpOnly; Secure; SameSite=Strict; Path=/api; Max-Age=0`;
}
