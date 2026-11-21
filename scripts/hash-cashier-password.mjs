import { hashCashierPassword } from '../netlify/functions/lib/cashier-password.mjs';

if (!process.env.CASHIER_PASSWORD) {
    throw new Error('Set CASHIER_PASSWORD in the environment before generating the hash.');
}

console.log(await hashCashierPassword(process.env.CASHIER_PASSWORD));
