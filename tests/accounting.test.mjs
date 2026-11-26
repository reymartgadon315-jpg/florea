import assert from 'node:assert/strict';
import test from 'node:test';
import {
    getRecordedSaleProfit,
    isRecordedSale,
    snapshotOrderItemCosts
} from '../florea-accounting.mjs';
import {
    createInitialInventory,
    mergeMissingMenuProducts,
    setInventoryItemCost
} from '../florea-inventory-shared.mjs';

test('shared product inventory can migrate and persist unit costs', () => {
    const inventory = createInitialInventory();
    const product = inventory.items.find(item => item.type === 'product');
    const legacy = {
        ...inventory,
        items: inventory.items.map(item => {
            const { unitCost, ...legacyItem } = item;
            return legacyItem;
        })
    };

    const migration = mergeMissingMenuProducts(legacy);
    assert.equal(migration.changed, true);
    assert.equal(migration.inventory.items.find(item => item.id === product.id).unitCost, null);

    const update = setInventoryItemCost(migration.inventory, product.id, 12.345);
    assert.equal(update.success, true);
    assert.equal(update.inventory.items.find(item => item.id === product.id).unitCost, 12.35);
    const persistedCost = mergeMissingMenuProducts(update.inventory);
    assert.equal(persistedCost.changed, false);
    assert.equal(persistedCost.inventory.items.find(item => item.id === product.id).unitCost, 12.35);
    assert.equal(setInventoryItemCost(update.inventory, product.id, -1).invalidCost, true);
});

test('paid orders snapshot shared product unit cost and report only complete gross profit', () => {
    const inventory = {
        items: [{ type: 'product', name: 'Americano', unitCost: 17.25 }]
    };
    const itemDetails = snapshotOrderItemCosts([
        { name: 'Americano', quantity: 2, price: 79, unitCost: 0 }
    ], inventory);
    assert.equal(itemDetails[0].unitCost, 17.25);

    const order = {
        status: 'completed',
        paymentStatus: 'paid',
        total: '₱158.00',
        itemDetails
    };
    assert.equal(isRecordedSale(order), true);
    assert.deepEqual(getRecordedSaleProfit(order), {
        sales: 158,
        cost: 34.5,
        profit: 123.5
    });
    assert.equal(getRecordedSaleProfit({ ...order, status: 'cancelled' }), null);
    assert.equal(getRecordedSaleProfit({ ...order, paymentStatus: 'pending' }), null);
    assert.equal(getRecordedSaleProfit({
        ...order,
        itemDetails: [{ ...itemDetails[0], unitCost: null }]
    }), null);
});
