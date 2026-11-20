import adminAuth from '../../netlify/functions/admin-auth.mjs';
import cashierAuth from '../../netlify/functions/cashier-auth.mjs';
import feedback from '../../netlify/functions/feedback.mjs';
import inventory from '../../netlify/functions/inventory.mjs';
import order from '../../netlify/functions/order.mjs';
import orders from '../../netlify/functions/orders.mjs';
import productImages from '../../netlify/functions/product-images.mjs';
import pushKey from '../../netlify/functions/push-key.mjs';
import ratings from '../../netlify/functions/ratings.mjs';

const fixedRoutes = new Map([
    ['/api/admin-auth', adminAuth],
    ['/api/cashier-auth', cashierAuth],
    ['/api/feedback', feedback],
    ['/api/inventory', inventory],
    ['/api/orders', orders],
    ['/api/push-key', pushKey],
    ['/api/ratings', ratings]
]);

export function getApiHandler(pathname) {
    if (fixedRoutes.has(pathname)) {
        return { handler: fixedRoutes.get(pathname) };
    }

    const orderMatch = pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (orderMatch) {
        return {
            handler: order,
            params: { orderId: decodeURIComponent(orderMatch[1]) }
        };
    }

    if (/^\/api\/product-images\/(?:upload|[0-9a-f-]+)$/i.test(pathname)) {
        return { handler: productImages };
    }

    return null;
}
