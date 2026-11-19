import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrderItems } from '../netlify/functions/lib/order-validation.mjs';

test('accepts asset and hosted product image URLs in order items', () => {
    const result = validateOrderItems([
        { name: 'Americano', quantity: 1, price: 100, image: 'assets/products/americano.png' },
        {
            name: 'Matcha Latte',
            quantity: 1,
            price: 139,
            image: '/api/product-images/123e4567-e89b-42d3-a456-426614174000'
        }
    ]);

    assert.equal(result.error, undefined);
    assert.equal(result.itemDetails[1].image, '/api/product-images/123e4567-e89b-42d3-a456-426614174000');
});

test('rejects external or malformed product image URLs', () => {
    for (const image of [
        'https://example.test/image.png',
        '/api/product-images/not-a-uuid',
        'assets/products/../private.png',
        ['assets/products/americano.png']
    ]) {
        const result = validateOrderItems([
            { name: 'Americano', quantity: 1, price: 100, image }
        ]);
        assert.equal(result.error, 'One or more order items are invalid.');
    }
});
