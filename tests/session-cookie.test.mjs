import assert from 'node:assert/strict';
import test from 'node:test';
import {
    adminSessionCookie,
    clearAdminSessionCookie
} from '../netlify/functions/lib/admin-session.mjs';
import {
    cashierSessionCookie,
    clearCashierSessionCookie
} from '../netlify/functions/lib/cashier-session.mjs';

test('staff session cookies support credentialed cross-site Render API requests', () => {
    const cookies = [
        adminSessionCookie('admin-session'),
        clearAdminSessionCookie(),
        cashierSessionCookie('cashier-session'),
        clearCashierSessionCookie()
    ];

    for (const cookie of cookies) {
        assert.match(cookie, /HttpOnly/);
        assert.match(cookie, /Secure/);
        assert.match(cookie, /SameSite=None/);
        assert.match(cookie, /Partitioned/);
        assert.match(cookie, /Path=\/api/);
    }
});
