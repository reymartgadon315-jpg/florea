export function isRecordedSale(order) {
    return String(order?.status || 'new').toLowerCase() !== 'cancelled' &&
        order?.paymentStatus === 'paid';
}

export function snapshotOrderItemCosts(itemDetails, inventory) {
    return itemDetails.map(item => {
        const product = inventory.items.find(entry =>
            entry.type === 'product' && entry.name === item.name
        );
        return {
            ...item,
            unitCost: Number.isFinite(product?.unitCost) && product.unitCost >= 0
                ? product.unitCost
                : null
        };
    });
}

export function getRecordedSaleProfit(order) {
    if (!isRecordedSale(order) || !Array.isArray(order.itemDetails) || !order.itemDetails.length) {
        return null;
    }

    const items = order.itemDetails;
    if (items.some(item =>
        !Number.isFinite(item.unitCost) || item.unitCost < 0 ||
        !Number.isFinite(item.quantity) || item.quantity < 1
    )) {
        return null;
    }

    const totalText = String(order.total ?? '').replace(/[^\d.]/g, '');
    const sales = totalText ? Number(totalText) : Number.NaN;
    if (!Number.isFinite(sales)) return null;

    const cost = items.reduce((sum, item) => sum + item.unitCost * item.quantity, 0);
    return { sales, cost, profit: sales - cost };
}
