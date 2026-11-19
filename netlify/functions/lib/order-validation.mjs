export function validateOrderItems(submittedItems) {
    if (!Array.isArray(submittedItems) || submittedItems.length === 0 || submittedItems.length > 50) {
        return { error: 'A customer name and at least one valid item are required.' };
    }

    const itemDetails = [];
    for (const item of submittedItems) {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
            return { error: 'One or more order items are invalid.' };
        }
        const name = typeof item.name === 'string' ? item.name.trim().slice(0, 120) : '';
        const quantity = item.quantity;
        const price = item.price;
        const wrapStyle = item.wrapStyle === undefined ? '' : item.wrapStyle;
        const messageCard = item.messageCard === undefined ? '' : item.messageCard;
        const drinkCategory = item.drinkCategory === undefined ? '' : item.drinkCategory;
        const drinkSize = item.drinkSize === undefined ? '' : item.drinkSize;
        const drinkTemperature = item.drinkTemperature === undefined ? '' : item.drinkTemperature;
        const image = item.image === undefined ? '' : item.image;
        const emoji = item.emoji === undefined ? '' : item.emoji;
        const validDrinkCategory = [
            'Coffee',
            'Flavored Coffee',
            'Premium Latte',
            'Matcha',
            'Refreshers',
            'Frappe'
        ].includes(drinkCategory);
        const supportsTemperature = ['Coffee', 'Flavored Coffee', 'Premium Latte', 'Matcha'].includes(drinkCategory);
        const validDrinkOptions = validDrinkCategory
            ? ['Small', 'Medium', 'Large'].includes(drinkSize) &&
                (supportsTemperature
                    ? ['Hot', 'Iced'].includes(drinkTemperature)
                    : drinkTemperature === '')
            : drinkCategory === '' && drinkSize === '' && drinkTemperature === '';
        const validImage = typeof image === 'string' && (image === '' ||
            (/^assets\/[A-Za-z0-9._%/-]+$/.test(image) && !image.split('/').includes('..')) ||
            /^\/api\/product-images\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(image));

        if (!name || !Number.isInteger(quantity) || quantity < 1 || quantity > 50 ||
            !Number.isFinite(price) || price < 0 || price > 100000 ||
            typeof wrapStyle !== 'string' || wrapStyle.length > 40 ||
            !['', 'Kraft Paper', 'Satin Ribbon', 'Box'].includes(wrapStyle) ||
            typeof messageCard !== 'string' || messageCard.length > 250 ||
            typeof image !== 'string' || image.length > 240 || !validImage ||
            typeof emoji !== 'string' || emoji.length > 12 ||
            typeof drinkCategory !== 'string' || typeof drinkSize !== 'string' ||
            typeof drinkTemperature !== 'string' || !validDrinkOptions) {
            return { error: 'One or more order items are invalid.' };
        }

        itemDetails.push({
            name,
            quantity,
            price,
            ...(wrapStyle ? { wrapStyle } : {}),
            ...(messageCard.trim() ? { messageCard: messageCard.trim() } : {}),
            ...(image ? { image } : {}),
            ...(emoji ? { emoji } : {}),
            ...(drinkCategory ? { drinkCategory, drinkSize, ...(drinkTemperature ? { drinkTemperature } : {}) } : {})
        });
    }

    return { itemDetails };
}

export function validatePushSubscription(pushSubscription) {
    if (pushSubscription === undefined || pushSubscription === null) {
        return { valid: true };
    }

    if (typeof pushSubscription !== 'object' || Array.isArray(pushSubscription) ||
        typeof pushSubscription.endpoint !== 'string' || pushSubscription.endpoint.length > 2048 ||
        typeof pushSubscription.keys?.p256dh !== 'string' || pushSubscription.keys.p256dh.length > 256 ||
        typeof pushSubscription.keys?.auth !== 'string' || pushSubscription.keys.auth.length > 128) {
        return { valid: false };
    }

    let endpoint;
    try {
        endpoint = new URL(pushSubscription.endpoint);
    } catch {
        return { valid: false };
    }

    const supportedPushHosts = [
        'fcm.googleapis.com',
        'push.services.mozilla.com',
        'updates.push.services.mozilla.com',
        'web.push.apple.com'
    ];
    const supportedEndpoint = supportedPushHosts.some(host =>
        endpoint.hostname === host || endpoint.hostname.endsWith(`.${host}`)
    ) || endpoint.hostname.endsWith('.notify.windows.com');

    return {
        valid: endpoint.protocol === 'https:' && supportedEndpoint
    };
}

export function formatOrderItem(item) {
    const drinkOptions = item.drinkSize
        ? ` (${item.drinkSize}${item.drinkTemperature ? `, ${item.drinkTemperature}` : ''})`
        : '';
    return `${item.name}${drinkOptions} ×${item.quantity}`;
}

export function getOrderTotal(itemDetails) {
    const total = itemDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return `₱${total.toLocaleString('en-PH')}`;
}

export function matchesCustomerName(firstName, secondName) {
    return typeof firstName === 'string' && typeof secondName === 'string' &&
        firstName.trim().toLocaleLowerCase() === secondName.trim().toLocaleLowerCase();
}
