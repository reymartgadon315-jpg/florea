const coffeeProducts = [
    'Americano',
    'Spanish Latte',
    'Caramel Macchiato',
    'Vietnamese Coffee',
    'Vanilla Cinnamon Latte',
    'Mocha Latte',
    'Dalgona Coffee',
    'Mojito Mint Cream Coffee',
    'White Choco Latte',
    'French Vanilla Latte'
];
const flavoredCoffeeProducts = [
    'Strawberry Coffee',
    'Taro Coffee',
    'Orange Espresso',
    'Lemonade Coffee',
    'Dirty Matcha'
];
const premiumLatteProducts = [
    'Nutella Latte',
    'Biscoff Latte',
    'Salted Caramel Latte',
    'Strawberry Nutella Latte'
];
const matchaProducts = [
    'Matcha Latte',
    'Mango Matcha',
    'Caramel Matcha',
    'Choco Matcha',
    'Blueberry Matcha',
    'Strawberry Matcha',
    'Mint Matcha',
    'White Choco Matcha'
];
const refresherProducts = [
    ...['Lemon', 'Strawberry', 'Green Apple', 'Lychee', 'Blueberry', 'Mixed Berries', 'Mango', 'Cola Soda', 'Passion Fruit']
    .map(flavor => `Soda Refresher — ${flavor}`),
    'Coke Float'
];
const milkLatteProducts = [
    'Chocolate Latte',
    'Strawberry Latte',
    'Green Apple Latte',
    'Lychee Latte',
    'Blueberry Latte',
    'Mixed Berries Latte',
    'Mango Latte'
];
const frappeProducts = [
    'Matcha',
    'Salted Caramel',
    'Cheesecake',
    'Red Velvet',
    'Nutella Triple Choco',
    'Biscoff',
    'Mango',
    'Strawberry',
    'Blueberry'
];
const menuProducts = [
    ...[
        ['Flowers', 'Ecuadorian Roses (6pc)', 20, 5],
        ['Flowers', 'Sunflower Stem', 18, 5],
        ['Flowers', 'Dutch Tulip (single)', 4, 5],
        ['Flowers', 'Daisy Mix Stem', 18, 5],
        ['Flowers', 'Lavender Bunch', 0, 5],
        ['Flowers', 'Cherry Blossom Stem', 18, 5],
        ['Bouquets', 'Sweetheart Peony Bouquet', 12, 3],
        ['Bouquets', 'Tulip Garden Box', 10, 3],
        ['Bouquets', "Rose & Baby's Breath Bunch", 10, 3]
    ],
    ...coffeeProducts.map(name => ['Coffee', name, 50, 10]),
    ...flavoredCoffeeProducts.map(name => ['Flavored Coffee', name, 50, 10]),
    ...premiumLatteProducts.map(name => ['Premium Latte', name, 50, 10]),
    ...matchaProducts.map(name => ['Matcha', name, 35, 7]),
    ...refresherProducts.map(name => ['Refreshers', name, name === 'Coke Float' ? 25 : 30, 6]),
    ...milkLatteProducts.map(name => ['Refreshers', name, 30, 6]),
    ...frappeProducts.map(name => ['Frappe', name, 30, 6]),
    ...[
        ['Rice Meals', 'Liempo Kare'],
        ['Rice Meals', 'Honey Butter Chicken'],
        ['Rice Meals', 'Sizzling Breaded Liempo'],
        ['Rice Meals', 'Pancit Guisado'],
        ['Rice Meals', 'Chicken in White Onion Creme'],
        ['Rice Meals', 'Shrimp Fritter and Veggies'],
        ['Rice Meals', 'Chicken Tonkotsu'],
        ['Rice Meals', 'Sizzling Bulalo Kare'],
        ['Rice Meals', 'Sizzling Sweet n Sour Pusit'],
        ['Rice Meals', 'Breaded Sizzling Pork Chop'],
        ['Rice Meals', 'Breaded Chicken Wings'],
        ['Rice Meals', 'Shrimp Fritters Rice'],
        ['Rice Meals', 'Salmon Steak'],
        ['Rice Meals', 'Pork Katsudon'],
        ['Rice Meals', 'Chicken Shawarma Rice'],
        ['Rice Meals', 'Crispy Chicken Kare'],
        ['Rice Meals', 'Crispy Chicken Rice'],
        ['Rice Meals', 'Chicken Ala King'],
        ['Finger Foods', 'Chicken Shawarma Fries'],
        ['Finger Foods', 'Chicken Burrito Wrap'],
        ['Finger Foods', 'Shrimp Fritters'],
        ['Finger Foods', 'Potato Wedges'],
        ['Finger Foods', 'Clubhouse With Fries'],
        ['Finger Foods', 'Double Patty Burger with Fries'],
        ['Finger Foods', 'Veggies Salad'],
        ['Finger Foods', 'Chicken Onion Rings'],
        ['Finger Foods', 'Chicken Dumplings'],
        ['Pasta', 'Chicken Alfredo Pasta'],
        ['Pasta', 'Aglio e Olio'],
        ['Pasta', 'Binagoongan Pasta']
    ].map(([category, name]) => [category, name, 20, 4]), ['Cakes & Pastries', 'Lavender Basque Cake', 15, 3],
    ['Cakes & Pastries', 'Rose Vanilla Cupcake', 18, 4]
].map(([category, name, quantity, reorderLevel]) => ({
    id: `product:${category}:${name}`,
    type: 'product',
    name,
    category,
    quantity,
    unitCost: null,
    unit: 'items',
    reorderLevel,
    updatedAt: null
}));

const ingredientItems = [
    ['Ecuadorian Roses', 58, 'stems', 20],
    ['Dutch Tulip', 4, 'stems', 15],
    ['Lavender Bunch', 0, 'bunches', 10],
    ['Kraft Wrap Paper', 9, 'sheets', 25],
    ['Oat Milk (1L)', 6, 'bottles', 10],
    ['Basque Cake (whole)', 14, 'whole cakes', 5]
].map(([name, quantity, unit, reorderLevel]) => ({
    id: `ingredient:${name}`,
    type: 'ingredient',
    name,
    category: 'Ingredients',
    quantity,
    unit,
    reorderLevel,
    updatedAt: null
}));

export function createInitialInventory() {
    return {
        version: 1,
        items: [...menuProducts, ...ingredientItems].map(item => ({...item })),
        deductedOrderIds: []
    };
}

export function mergeMissingMenuProducts(inventory) {
    if (!inventory || !Array.isArray(inventory.items)) {
        throw new Error('Cannot migrate inventory without a valid items list.');
    }
    const migratedItems = inventory.items.map(item => {
        if (item.type !== 'product') return item;
        const costedItem = item.unitCost === null ||
            (Number.isFinite(item.unitCost) && item.unitCost >= 0)
            ? item
            : { ...item, unitCost: null };
        if (item.category === 'Coffee' && item.name === 'Orange Espresso') {
            return { ...costedItem, id: 'product:Flavored Coffee:Orange Espresso', category: 'Flavored Coffee' };
        }
        if (item.category === 'Coffee' && item.name === 'Cinnamon Roll Latte') {
            return { ...costedItem, id: 'product:Premium Latte:Biscoff Latte', name: 'Biscoff Latte', category: 'Premium Latte' };
        }
        if (item.category === 'Coffee' && item.name === 'Salted Caramel Latte') {
            return { ...costedItem, id: 'product:Premium Latte:Salted Caramel Latte', category: 'Premium Latte' };
        }
        if (item.category !== 'Milk-Based' && !item.name.startsWith('Milk Based Latte — ')) return costedItem;
        const [prefix, flavor] = item.name.split(' — ');
        if (prefix !== 'Milk Based Latte' || !flavor) return { ...costedItem, category: 'Refreshers' };
        const milkLatteNames = {
            Chocolate: 'Chocolate Latte',
            Strawberry: 'Strawberry Latte',
            'Strawberry Coffee': 'Strawberry Coffee',
            'Dirty Matcha': 'Dirty Matcha',
            'Green Apple': 'Green Apple Latte',
            Lychee: 'Lychee Latte',
            Blueberry: 'Blueberry Latte',
            'Mixed Berries': 'Mixed Berries Latte',
            Mango: 'Mango Latte'
        };
        const name = milkLatteNames[flavor] || item.name;
        const category = ['Strawberry Coffee', 'Dirty Matcha'].includes(name) ? 'Flavored Coffee' : 'Refreshers';
        return {
            ...costedItem,
            id: `product:${category}:${name}`,
            name,
            category
        };
    });
    const existingIds = new Set(migratedItems.map(item => item.id));
    const missingProducts = createInitialInventory().items.filter(item =>
        item.type === 'product' && !existingIds.has(item.id)
    );
    const relabeledProducts = migratedItems.some((item, index) => item !== inventory.items[index]);
    if (!missingProducts.length && !relabeledProducts) return { inventory, changed: false };
    return {
        inventory: {...inventory, items: [...migratedItems, ...missingProducts] },
        changed: true
    };
}

function roundStock(value) {
    return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

function addRequirement(requirements, item, amount) {
    const current = requirements.get(item.id);
    requirements.set(item.id, {
        item,
        quantity: roundStock((current ? current.quantity : 0) + amount)
    });
}

function drinkMilkAmount(item, category) {
    const isCoffeeWithMilk = category === 'Coffee' &&
        !['Americano', 'Vietnamese Coffee'].includes(item.name);
    const isFlavoredCoffee = category === 'Flavored Coffee' &&
        !['Orange Espresso', 'Lemonade Coffee'].includes(item.name);
    const isPremiumLatte = category === 'Premium Latte';
    const isMatcha = category === 'Matcha';
    const isFrappe = category === 'Frappe';
    const isMilkBasedLatte = category === 'Refreshers' && item.name.endsWith(' Latte');
    if (!isCoffeeWithMilk && !isFlavoredCoffee && !isPremiumLatte && !isMatcha && !isFrappe && !isMilkBasedLatte) return 0;
    return item.drinkSize === 'Large' ? 0.25 : item.drinkSize === 'Small' ? 0.15 : 0.2;
}

export function calculateOrderRequirements(inventory, orderItems) {
    const requirements = new Map();
    const productItems = inventory.items.filter(item => item.type === 'product');
    const ingredientItems = inventory.items.filter(item => item.type === 'ingredient');

    for (const orderItem of orderItems) {
        const canonicalName = orderItem.name.replace('&amp;', '&');
        const product = productItems.find(item => item.name === canonicalName);
        if (!product) {
            return { error: `“${orderItem.name}” is not configured in the shared inventory.` };
        }
        addRequirement(requirements, product, orderItem.quantity);

        const recipe = [];
        if (orderItem.name === 'Ecuadorian Roses (6pc)') recipe.push(['Ecuadorian Roses', 6]);
        if (orderItem.name === 'Dutch Tulip (single)') recipe.push(['Dutch Tulip', 1]);
        if (orderItem.name === 'Lavender Bunch') recipe.push(['Lavender Bunch', 1]);
        if (['Flowers', 'Bouquets'].includes(product.category) && orderItem.wrapStyle === 'Kraft Paper') {
            recipe.push(['Kraft Wrap Paper', 1]);
        }
        const milkAmount = drinkMilkAmount(orderItem, product.category);
        if (milkAmount) recipe.push(['Oat Milk (1L)', milkAmount]);
        if (orderItem.name === 'Lavender Basque Cake') recipe.push(['Basque Cake (whole)', 0.1]);

        for (const [ingredientName, quantityPerItem] of recipe) {
            const ingredient = ingredientItems.find(item => item.name === ingredientName);
            if (!ingredient) {
                return { error: `The ingredient “${ingredientName}” is missing from inventory.` };
            }
            addRequirement(requirements, ingredient, quantityPerItem * orderItem.quantity);
        }
    }

    return { requirements: [...requirements.values()] };
}

export function applyOrderToInventory(inventory, orderId, orderItems, timestamp = new Date().toISOString()) {
    if (inventory.deductedOrderIds.includes(orderId)) {
        return { success: true, alreadyApplied: true, inventory };
    }

    const calculated = calculateOrderRequirements(inventory, orderItems);
    if (calculated.error) return { success: false, error: calculated.error };

    const shortages = calculated.requirements
        .filter(({ item, quantity }) => item.quantity < quantity)
        .map(({ item, quantity }) => ({
            name: item.name,
            available: item.quantity,
            required: quantity,
            unit: item.unit
        }));
    if (shortages.length) return { success: false, shortages };

    const nextInventory = {
        ...inventory,
        items: inventory.items.map(item => {
            const requirement = calculated.requirements.find(entry => entry.item.id === item.id);
            return requirement ?
                {...item, quantity: roundStock(item.quantity - requirement.quantity), updatedAt: timestamp } :
                item;
        }),
        deductedOrderIds: [...inventory.deductedOrderIds, orderId].slice(-1000)
    };
    return { success: true, alreadyApplied: false, inventory: nextInventory };
}

export function restoreOrderInventory(inventory, orderId, orderItems, timestamp = new Date().toISOString()) {
    if (!inventory.deductedOrderIds.includes(orderId)) {
        return { success: true, alreadyRestored: true, inventory };
    }
    const calculated = calculateOrderRequirements(inventory, orderItems);
    if (calculated.error) return { success: false, error: calculated.error };
    const requirements = new Map(calculated.requirements.map(entry => [entry.item.id, entry.quantity]));
    const nextInventory = {
        ...inventory,
        items: inventory.items.map(item => requirements.has(item.id) ?
            {...item, quantity: roundStock(item.quantity + requirements.get(item.id)), updatedAt: timestamp } :
            item),
        deductedOrderIds: inventory.deductedOrderIds.filter(id => id !== orderId)
    };
    return { success: true, alreadyRestored: false, inventory: nextInventory };
}

export function adjustInventoryItem(inventory, itemId, direction, quantity, timestamp = new Date().toISOString()) {
    if (!['add', 'remove', 'set'].includes(direction) ||
        !Number.isInteger(quantity) || quantity < (direction === 'set' ? 0 : 1)) {
        return { success: false, invalidAdjustment: true };
    }
    const item = inventory.items.find(entry => entry.id === itemId);
    if (!item) return { success: false, notFound: true };
    const nextQuantity = direction === 'set' ?
        quantity :
        item.quantity + (direction === 'add' ? quantity : -quantity);
    if (nextQuantity < 0) return { success: false, insufficient: true, item };
    return {
        success: true,
        inventory: {
            ...inventory,
            items: inventory.items.map(entry => entry.id === itemId ?
                {...entry, quantity: roundStock(nextQuantity), updatedAt: timestamp } :
                entry)
        }
    };
}

export function setInventoryItemCost(inventory, itemId, unitCost, timestamp = new Date().toISOString()) {
    if (unitCost !== null && (!Number.isFinite(unitCost) || unitCost < 0 || unitCost > 1000000)) {
        return { success: false, invalidCost: true };
    }
    const item = inventory.items.find(entry => entry.id === itemId && entry.type === 'product');
    if (!item) return { success: false, notFound: true };
    const normalizedCost = unitCost === null
        ? null
        : Math.round((unitCost + Number.EPSILON) * 100) / 100;
    return {
        success: true,
        inventory: {
            ...inventory,
            items: inventory.items.map(entry => entry.id === itemId
                ? { ...entry, unitCost: normalizedCost, updatedAt: timestamp }
                : entry)
        }
    };
}