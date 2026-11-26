const maxCatalogBytes = 2 * 1024 * 1024;
const productImagePattern = /^assets\/[A-Za-z0-9._%/-]+$/;
const hostedProductImagePattern = /^\/api\/product-images\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const unsafeCategoryNames = new Set(['__proto__', 'constructor', 'prototype']);

export function validateProductCatalog(categories) {
    if (!categories || typeof categories !== 'object' || Array.isArray(categories)) {
        return { error: 'Product categories must be a JSON object.' };
    }
    if (Buffer.byteLength(JSON.stringify(categories), 'utf8') > maxCatalogBytes) {
        return { error: 'The product catalog is too large to save.' };
    }

    const categoryEntries = Object.entries(categories);
    if (categoryEntries.length === 0 || categoryEntries.length > 50) {
        return { error: 'The catalog must contain between 1 and 50 categories.' };
    }
    const names = new Set();
    const inventoryIds = new Set();
    let productCount = 0;

    for (const [category, products] of categoryEntries) {
        if (!category.trim() || category.length > 60 || unsafeCategoryNames.has(category) ||
            /[\u0000-\u001f]/.test(category) ||
            !Array.isArray(products) || products.length > 200) {
            return { error: 'One or more product categories are invalid.' };
        }

        for (const product of products) {
            productCount += 1;
            if (!product || typeof product !== 'object' || Array.isArray(product)) {
                return { error: 'One or more catalog products are invalid.' };
            }
            const price = typeof product.p === 'string'
                ? Number((product.p.match(/\d+(?:\.\d+)?/) || [])[0])
                : Number.NaN;
            if (typeof product.n !== 'string' || !product.n.trim() || product.n.length > 120 ||
                /[\u0000-\u001f]/.test(product.n) ||
                typeof product.p !== 'string' || !product.p.trim() || product.p.length > 60 ||
                !Number.isFinite(price) || price > 100000 ||
                typeof product.d !== 'undefined' && (typeof product.d !== 'string' || product.d.length > 2000) ||
                typeof product.e !== 'undefined' && (typeof product.e !== 'string' || product.e.length > 12) ||
                typeof product.badge !== 'undefined' && (typeof product.badge !== 'string' || product.badge.length > 40) ||
                typeof product.quantity !== 'undefined' && (!Number.isInteger(product.quantity) || product.quantity < 0 || product.quantity > 100000) ||
                typeof product.reorderLevel !== 'undefined' && (!Number.isInteger(product.reorderLevel) || product.reorderLevel < 0 || product.reorderLevel > 100000)) {
                return { error: 'One or more product names, prices, or quantities are invalid.' };
            }

            if (typeof product.image !== 'undefined' && (typeof product.image !== 'string' ||
                product.image.length > 240 ||
                (product.image !== '' && !productImagePattern.test(product.image) && !hostedProductImagePattern.test(product.image)) ||
                product.image.split('/').includes('..'))) {
                return { error: 'One or more product images are invalid.' };
            }
            if (typeof product.sizePrices !== 'undefined') {
                const prices = product.sizePrices;
                if (!prices || typeof prices !== 'object' || Array.isArray(prices) ||
                    Object.entries(prices).some(([size, value]) =>
                        !['Small', 'Medium', 'Large', 'Hot'].includes(size) ||
                        !Number.isFinite(value) || value < 0 || value > 100000)) {
                    return { error: 'One or more product size prices are invalid.' };
                }
            }
            if (typeof product.inventoryId !== 'undefined' &&
                (typeof product.inventoryId !== 'string' || !product.inventoryId.startsWith('product:') ||
                    product.inventoryId.length > 300 || /[\u0000-\u001f]/.test(product.inventoryId))) {
                return { error: 'One or more product inventory references are invalid.' };
            }

            const normalizedName = product.n.trim().toLocaleLowerCase();
            if (names.has(normalizedName)) {
                return { error: 'Product names must be unique across categories.' };
            }
            names.add(normalizedName);
            const inventoryId = product.inventoryId || `product:${category}:${product.n}`;
            if (inventoryIds.has(inventoryId)) {
                return { error: 'Each catalog product must have a unique inventory reference.' };
            }
            inventoryIds.add(inventoryId);
        }
    }

    if (productCount > 500) return { error: 'The catalog cannot contain more than 500 products.' };
    return { categories: JSON.parse(JSON.stringify(categories)) };
}
