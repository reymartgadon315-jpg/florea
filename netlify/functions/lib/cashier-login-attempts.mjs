import { createHash } from 'node:crypto';

export const cashierLoginAttemptLimit = 5;
export const cashierLoginLockDurationMs = 15 * 60 * 1000;

export function cashierLoginAttemptKey(username) {
    const digest = createHash('sha256').update(username.trim().toLowerCase()).digest('hex');
    return `cashier:${digest}`;
}

function recentAttempts(record, now) {
    if (!record) return [];
    if (!Array.isArray(record.failedAt) ||
        (record.lockedUntil !== null && !Number.isFinite(record.lockedUntil))) {
        throw new Error('Stored cashier login-attempt data has an invalid format.');
    }
    return record.failedAt.filter(timestamp =>
        Number.isFinite(timestamp) && timestamp > now - cashierLoginLockDurationMs
    );
}

export async function getCashierLoginLock(store, key, now = Date.now()) {
    const stored = await store.getWithMetadata(key, { type: 'json' });
    if (!stored) return null;
    const attempts = recentAttempts(stored.data, now);
    const lockedUntil = stored.data.lockedUntil;
    return lockedUntil > now
        ? { lockedUntil, retryAfterSeconds: Math.ceil((lockedUntil - now) / 1000) }
        : { lockedUntil: null, attempts: attempts.length };
}

export async function recordCashierLoginFailure(store, key, now = Date.now()) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
        const stored = await store.getWithMetadata(key, { type: 'json' });
        const current = stored?.data || { failedAt: [], lockedUntil: null };
        const attempts = recentAttempts(current, now);
        if (current.lockedUntil > now) {
            return {
                lockedUntil: current.lockedUntil,
                retryAfterSeconds: Math.ceil((current.lockedUntil - now) / 1000)
            };
        }

        attempts.push(now);
        const lockedUntil = attempts.length >= cashierLoginAttemptLimit
            ? now + cashierLoginLockDurationMs
            : null;
        const result = await store.setJSON(key, { failedAt: attempts, lockedUntil }, stored
            ? { onlyIfMatch: stored.etag }
            : { onlyIfNew: true });
        if (result.modified) {
            return lockedUntil
                ? { lockedUntil, retryAfterSeconds: cashierLoginLockDurationMs / 1000 }
                : { lockedUntil: null, attempts: attempts.length };
        }
    }
    throw new Error('Could not safely update cashier login-attempt data.');
}

export async function clearCashierLoginFailures(store, key) {
    await store.delete(key);
}
