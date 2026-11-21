import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { verifyCashierPassword as verifyPlainCashierPassword } from './cashier-session.mjs';

const scrypt = promisify(scryptCallback);
const scryptCost = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const saltLength = 16;
const keyLength = 64;

export async function hashCashierPassword(password) {
    if (typeof password !== 'string' || password.length < 1) {
        throw new TypeError('A non-empty cashier password is required.');
    }
    const salt = randomBytes(saltLength);
    const key = await scrypt(password, salt, keyLength, scryptCost);
    return `scrypt$${salt.toString('base64url')}$${key.toString('base64url')}`;
}

export async function verifyCashierPassword(candidate, { password, passwordHash } = {}) {
    if (typeof candidate !== 'string') return false;
    if (!passwordHash) return verifyPlainCashierPassword(candidate, password);

    const parts = passwordHash.split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt' ||
        !/^[A-Za-z0-9_-]+$/.test(parts[1]) || !/^[A-Za-z0-9_-]+$/.test(parts[2])) {
        return false;
    }
    const salt = Buffer.from(parts[1], 'base64url');
    const expected = Buffer.from(parts[2], 'base64url');
    if (salt.length !== saltLength || expected.length !== keyLength) return false;
    const actual = await scrypt(candidate, salt, expected.length, scryptCost);
    return timingSafeEqual(actual, expected);
}
