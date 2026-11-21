        // ============ REAL MENU DATA ============
        const CATEGORY_IMAGES = {
            'Coffee': 'assets/Pasted Image 5.jpe',
            'Matcha': 'assets/Pasted Image 3.jpe',
            'Refreshers': 'assets/Pasted Image 2.jpe',
            'Cakes & Pastries': 'assets/Pasted Image 5.jpe'
        };

        function getProductImage(item, category) {
            if (item && typeof item.image === 'string') {
                const image = item.image.trim();
                const isAsset = image.startsWith('assets/') && !image.split('/').includes('..');
                const isStoredImage = /^\/api\/product-images\/[0-9a-f-]{36}$/i.test(image);
                const isLocalImage = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/i.test(image);
                if (isAsset) return encodeURI(image);
                if (isStoredImage) return FloreaOrderSync.resolveImageUrl(image);
                if (isLocalImage) return image;
            }
            if (!item || !category) return '';
            const categoryItems = PRODUCTS[category] || [];
            const isFeaturedItem = categoryItems.length > 0 && categoryItems[0].n === item.n;
            return isFeaturedItem ? encodeURI(CATEGORY_IMAGES[category] || '') : '';
        }

        const PRODUCTS = {
            'Coffee': [
                ['Americano', 'A bold, smooth coffee for a simple, satisfying pick-me-up.', 'M79 · L99 · Hot79', 'coffee-americano.png'],
                ['Spanish Latte', 'Espresso with milk and condensed milk.', 'M129 · L139 · Hot129', 'coffee-spanish-latte.png'],
                ['Caramel Macchiato', 'Espresso with caramel syrup, milk, and cold foam.', 'M139 · L149 · Hot129', 'coffee-caramel-macchiato.png'],
                ['Vietnamese Coffee', 'Espresso with condensed milk and water.', 'M109 · L119 · Hot109', 'coffee-vietnamese-coffee.png'],
                ['Vanilla Cinnamon Latte', 'Espresso with vanilla, cinnamon, and milk.', 'M139 · L149 · Hot129', 'coffee-vanilla-cinnamon-latte.png'],
                ['Mocha Latte', 'Espresso with chocolate and milk.', 'M139 · L149 · Hot139', 'coffee-mocha-latte.png'],
                ['Dalgona Coffee', 'Whipped coffee with milk and sugar.', 'M129 · L139 · Hot129', 'coffee-dalgona-coffee.png'],
                ['Mojito Mint Cream Coffee', 'Espresso with mojito and mint (no alcohol).', 'M149 · L169 · Hot159', 'coffee-mojito-mint-cream-coffee.png'],
                ['White Choco Latte', 'Espresso with white chocolate and milk.', 'M149 · L169 · Hot159', 'coffee-white-choco-latte.png'],
                ['French Vanilla Latte', 'Espresso with French vanilla and milk.', 'M149 · L169 · Hot159', 'coffee-french-vanilla-latte.png']
            ].map(([name, description, price, image]) => ({
                e: '☕',
                n: name,
                d: description,
                p: price,
                stock: 'In Stock',
                image: `assets/products/${image}`
            })),
            'Flavored Coffee': [
                ['Strawberry Coffee', 'Espresso with strawberry and milk.', 'M139 · L149 · Hot129', 'milk-strawberry-latte.png'],
                ['Taro Coffee', 'Espresso with taro and milk.', 'M139 · L149 · Hot129', 'coffee-taro-coffee.png'],
                ['Orange Espresso', 'Espresso with squeezed orange and water.', 'M129 · L139', 'coffee-orange-espresso.png'],
                ['Lemonade Coffee', 'Espresso with squeezed lemon and water.', 'M129 · L139', 'coffee-mojito-mint-cream-coffee.png'],
                ['Dirty Matcha', 'Espresso with matcha and milk.', 'M139 · L149 · Hot129', 'milk-dirty-matcha.png']
            ].map(([name, description, price, image]) => ({
                e: '☕',
                n: name,
                d: description,
                p: price,
                stock: 'In Stock',
                ...(image ? { image: `assets/products/${image}` } : {})
            })),
            'Premium Latte': [
                ['Nutella Latte', 'A creamy latte with rich Nutella chocolate.', 'M139 · L149 · Hot129', 'milk-chocolate-latte.png'],
                ['Biscoff Latte', 'A creamy caramelized biscuit latte.', 'M139 · L149 · Hot129', 'coffee-cinnamon-roll-latte.png'],
                ['Salted Caramel Latte', 'A smooth caramel latte with a lightly salted finish.', 'M89 · L99 · Hot99', 'coffee-salted-caramel-latte.png'],
                ['Strawberry Nutella Latte', 'A creamy latte with strawberry and Nutella.', 'M129 · L139 · Hot99', 'milk-strawberry-choco-latte.png']
            ].map(([name, description, price, image]) => ({
                e: '☕',
                n: name,
                d: description,
                p: price,
                stock: 'In Stock',
                image: `assets/products/${image}`
            })),
            'Matcha': [{
                e: '🍵',
                n: 'Matcha Latte',
                d: 'A smooth matcha favorite with an earthy, mellow finish.',
                p: 'M129 · L139 · Hot129',
                stock: 'In Stock',
                image: 'assets/products/matcha-latte.png'
            }, {
                e: '🍵',
                n: 'Mango Matcha',
                d: 'A vibrant matcha favorite with a bright mango twist.',
                p: 'M149 · L159 · Hot129',
                stock: 'In Stock',
                image: 'assets/products/matcha-mango.png'
            }, {
                e: '🍵',
                n: 'Choco Matcha',
                d: 'A rich matcha favorite with a smooth, chocolatey finish.',
                p: 'M139 · L149 · Hot129',
                stock: 'In Stock',
                image: 'assets/products/matcha-choco.png'
            }, {
                e: '🍵',
                n: 'Caramel Matcha',
                d: 'Mellow matcha with buttery caramel notes and a sweet finish.',
                p: 'M139 · L149 · Hot129',
                stock: 'In Stock',
                image: 'assets/products/matcha-caramel.png'
            }, {
                e: '🍵',
                n: 'Blueberry Matcha',
                d: 'A smooth matcha favorite with a sweet blueberry finish.',
                p: 'M149 · L159 · Hot129',
                stock: 'In Stock',
                image: 'assets/products/matcha-blueberry.png'
            }, {
                e: '🍵',
                n: 'Strawberry Matcha',
                d: 'A smooth matcha favorite with a sweet strawberry finish.',
                p: 'M149 · L159 · Hot129',
                stock: 'In Stock',
                image: 'assets/products/matcha-strawberry.png'
            }, {
                e: '🍵',
                n: 'Mint Matcha',
                d: 'A cool, refreshing matcha with a gentle minty finish.',
                p: 'M139 · L149 · Hot129',
                stock: 'In Stock',
                image: 'assets/products/matcha-mint.png'
            }, {
                e: '🍵',
                n: 'White Choco Matcha',
                d: 'A mellow matcha drink with a touch of sweet white chocolate.',
                p: 'M139 · L149 · Hot129',
                stock: 'In Stock',
                image: 'assets/products/matcha-white-choco.png'
            }, ],
            'Refreshers': [
                ...['Lemon', 'Strawberry', 'Green Apple', 'Lychee', 'Mixed Berries', 'Blueberry', 'Mango', 'Cola Soda', 'Passion Fruit'].map(flavor => ({
                    e: '🥤',
                    n: `Soda Refresher — ${flavor}`,
                    d: `A bright, bubbly refresher with a lively ${flavor.toLowerCase()} twist.`,
                    p: '₱ 69',
                    sizePrices: { Medium: 69, Large: 79 },
                    stock: 'In Stock',
                    image: `assets/products/refresher-${flavor.toLowerCase().replace(/ /g, '-')}.png`
                })),
                {
                    e: '🥤',
                    n: 'Coke Float',
                    d: 'A chilled cola float.',
                    p: '₱ 99',
                    sizePrices: { Medium: 99 },
                    stock: 'In Stock',
                    image: 'assets/products/refresher-cola-soda.png'
                },
                ...[
                    ['Chocolate Latte', 'Chocolate', 'milk-chocolate-latte.png'],
                    ['Strawberry Latte', 'Strawberry', 'milk-strawberry-latte.png'],
                    ['Green Apple Latte', 'Green apple', 'refresher-green-apple.png'],
                    ['Lychee Latte', 'Lychee', 'refresher-lychee.png'],
                    ['Blueberry Latte', 'Blueberry', 'milk-blueberry-latte.png'],
                    ['Mixed Berries Latte', 'Mixed berries', 'refresher-mixed-berries.png'],
                    ['Mango Latte', 'Mango', 'refresher-mango.png']
                ].map(([name, flavor, image]) => ({
                    e: '🧋',
                    n: name,
                    d: `A smooth milk-based latte with ${flavor.toLowerCase()}.`,
                    p: 'Media ₱79 · Grande ₱89',
                    sizePrices: { Medium: 79, Large: 89 },
                    stock: 'In Stock',
                    image: `assets/products/${image}`
                }))
            ],
            'Frappe': [
                ...[
                    ['Matcha', 129, 149, 'assets/products/frappe-matcha-cutout.png'],
                    ['Salted Caramel', 129, 149, 'assets/products/frappe-salted-caramel-cutout.png'],
                    ['Cheesecake', 129, 149, 'assets/products/frappe-cheesecake-cutout.png'],
                    ['Red Velvet', 129, 149, 'assets/products/frappe-red-velvet-cutout.png'],
                    ['Nutella Triple Choco', 149, 169, 'assets/products/frappe-nutella-triple-choco-cutout.png'],
                    ['Biscoff', 149, 169, 'assets/products/frappe-biscoff-cutout.png'],
                    ['Mango', 129, 149, 'assets/products/frappe-mango-cutout.png'],
                    ['Strawberry', 129, 149, 'assets/products/frappe-strawberry-cutout.png'],
                    ['Blueberry', 129, 149, 'assets/products/frappe-blueberry-cutout.png']
                ].map(([name, medium, large, image]) => ({
                    e: '🥤',
                    n: name,
                    d: `A creamy blended ${name.toLowerCase()} frappe.`,
                    p: `Media ₱${medium} · Grande ₱${large}`,
                    sizePrices: { Medium: medium, Large: large },
                    stock: 'In Stock',
                    image
                }))
            ],
            'Rice Meals': [{
                e: '🍖',
                n: 'Liempo Kare',
                d: 'A hearty pork favorite with rich, comforting kare-inspired flavor.',
                p: '₱ 179',
                stock: 'In Stock',
                badge: 'NEW',
                image: 'assets/products/rice-liempo-kare.png'
            }, {
                e: '🍗',
                n: 'Honey Butter Chicken',
                d: 'A golden chicken favorite with a sweet-and-savory finish.',
                p: '₱ 159',
                stock: 'In Stock',
                image: 'assets/products/rice-honey-butter-chicken.png'
            }, {
                e: '🍚',
                n: 'Sizzling Breaded Liempo',
                d: 'A hearty sizzling favorite with a satisfying golden crunch.',
                p: '₱ 169',
                stock: 'In Stock',
                image: 'assets/products/rice-sizzling-breaded-liempo.png'
            }, {
                e: '🍜',
                n: 'Pancit Guisado',
                d: 'A classic noodle favorite made for a comforting meal.',
                p: '₱ 129',
                stock: 'In Stock',
                badge: 'NEW',
                image: 'assets/products/rice-pancit-guisado.png'
            }, {
                e: '🍛',
                n: 'Chicken in White Onion Creme',
                d: 'Tender chicken with a creamy, savory finish.',
                p: '₱ 149',
                stock: 'In Stock',
                badge: 'NEW',
                image: 'assets/products/rice-chicken-in-white-onion-creme.png'
            }, {
                e: '🍤',
                n: 'Shrimp Fritter and Veggies',
                d: 'Crispy shrimp fritters paired with a fresh, balanced side.',
                p: '₱ 169',
                stock: 'In Stock',
                badge: 'NEW',
                image: 'assets/products/rice-shrimp-fritter-and-veggies.png'
            }, {
                e: '🍲',
                n: 'Chicken Tonkotsu',
                d: 'A comforting chicken favorite with rich, savory flavor.',
                p: '₱ 129',
                stock: 'In Stock',
                image: 'assets/products/rice-chicken-tonkotsu.png'
            }, {
                e: '🥩',
                n: 'Sizzling Bulalo Kare',
                d: 'A hearty sizzling favorite with deep, savory kare-inspired flavor.',
                p: '₱ 169',
                stock: 'In Stock',
                image: 'assets/products/rice-sizzling-bulalo-kare.png'
            }, {
                e: '🦑',
                n: 'Sizzling Sweet n Sour Pusit',
                d: 'Tender squid with a lively sweet-and-tangy finish.',
                p: '₱ 139',
                stock: 'In Stock',
                image: 'assets/products/rice-sizzling-sweet-n-sour-pusit.png'
            }, {
                e: '🍖',
                n: 'Breaded Sizzling Pork Chop',
                d: 'A hearty pork chop with a golden crust, served sizzling.',
                p: '₱ 149',
                stock: 'In Stock',
                image: 'assets/products/rice-breaded-sizzling-pork-chop.png'
            }, {
                e: '🍗',
                n: 'Breaded Chicken Wings',
                d: 'Crispy, savory chicken wings for a satisfying meal.',
                p: '₱ 129',
                stock: 'In Stock',
                image: 'assets/products/rice-breaded-chicken-wings.png'
            }, {
                e: '🍤',
                n: 'Shrimp Fritters Rice',
                d: 'A crisp, savory shrimp favorite paired with rice.',
                p: '₱ 139',
                stock: 'In Stock',
                image: 'assets/products/rice-shrimp-fritters-rice.png'
            }, {
                e: '🐟',
                n: 'Salmon Steak',
                d: 'A satisfying salmon favorite with a rich, savory finish.',
                p: '₱ 119',
                stock: 'In Stock',
                image: 'assets/products/rice-salmon-steak.png'
            }, {
                e: '🍱',
                n: 'Pork Katsudon',
                d: 'A comforting Japanese-inspired pork favorite served over rice.',
                p: '₱ 139',
                stock: 'In Stock',
                image: 'assets/products/rice-pork-katsudon.png'
            }, {
                e: '🍗',
                n: 'Chicken Shawarma Rice',
                d: 'A flavorful shawarma-inspired chicken meal served with rice.',
                p: '₱ 129',
                stock: 'In Stock',
                image: 'assets/products/rice-chicken-shawarma-rice.png'
            }, {
                e: '🍛',
                n: 'Crispy Chicken Kare',
                d: 'A crunchy chicken favorite with comforting kare-inspired flavor.',
                p: '₱ 149',
                stock: 'In Stock',
                image: 'assets/products/rice-crispy-chicken-kare.png'
            }, {
                e: '🍗',
                n: 'Crispy Chicken Rice',
                d: 'A golden, satisfying chicken meal served with rice.',
                p: '₱ 149',
                stock: 'In Stock',
                image: 'assets/products/rice-crispy-chicken-rice.png'
            }, {
                e: '🍗',
                n: 'Chicken Ala King',
                d: 'A comforting chicken favorite with a rich, creamy finish.',
                p: '₱ 129',
                stock: 'In Stock',
                image: 'assets/products/rice-chicken-ala-king.png'
            }],
            'Finger Foods': [{
                e: '🍟',
                n: 'Chicken Shawarma Fries',
                d: 'Crispy fries with a bold, savory shawarma-inspired twist.',
                p: '₱ 119',
                stock: 'In Stock',
                image: 'assets/products/finger-chicken-shawarma-fries.png'
            }, {
                e: '🌯',
                n: 'Chicken Burrito Wrap',
                d: 'A hearty, flavor-packed wrap for an easy, satisfying bite.',
                p: '₱ 129',
                stock: 'In Stock',
                image: 'assets/products/finger-chicken-burrito-wrap.png'
            }, {
                e: '🍤',
                n: 'Shrimp Fritters',
                d: 'Golden, crispy shrimp bites with a savory finish.',
                p: '₱ 129',
                stock: 'In Stock',
                image: 'assets/products/finger-shrimp-fritters.png'
            }, {
                e: '🥔',
                n: 'Potato Wedges',
                d: 'Golden potato wedges, crisp outside and fluffy inside.',
                p: '₱ 99',
                stock: 'In Stock',
                image: 'assets/products/finger-potato-wedges.png'
            }, {
                e: '🥪',
                n: 'Clubhouse With Fries',
                d: 'A satisfying café classic served with golden fries.',
                p: '₱ 149',
                stock: 'In Stock',
                image: 'assets/products/finger-clubhouse-with-fries.png'
            }, {
                e: '🍔',
                n: 'Double Patty Burger with Fries',
                d: 'A hearty double-patty favorite served with fries.',
                p: '₱ 179',
                stock: 'In Stock',
                image: 'assets/products/finger-double-patty-burger-with-fries.png'
            }, {
                e: '🥗',
                n: 'Veggies Salad',
                d: 'A fresh, colorful choice for a lighter bite.',
                p: '₱ 129',
                stock: 'In Stock',
                image: 'assets/products/finger-veggies-salad.png'
            }, {
                e: '🧅',
                n: 'Chicken Onion Rings',
                d: 'Crunchy, savory bites with a satisfying golden finish.',
                p: '₱ 129',
                stock: 'In Stock',
                image: 'assets/products/finger-chicken-onion-rings.png'
            }, {
                e: '🥟',
                n: 'Chicken Dumplings',
                d: 'A comforting favorite with a tender, savory filling.',
                p: '₱ 119',
                stock: 'In Stock',
                image: 'assets/products/finger-chicken-dumplings.png'
            }],
            'Pasta': [{
                e: '🍝',
                n: 'Chicken Alfredo Pasta',
                d: 'A creamy, comforting pasta favorite with a savory finish.',
                p: '₱ 129',
                stock: 'In Stock',
                image: 'assets/products/pasta-chicken-alfredo-pasta.png'
            }, {
                e: '🍝',
                n: 'Aglio e Olio',
                d: 'A simple, aromatic pasta with a light, savory finish.',
                p: '₱ 129',
                stock: 'In Stock',
                image: 'assets/products/pasta-aglio-e-olio.png'
            }, {
                e: '🍝',
                n: 'Binagoongan Pasta',
                d: 'A bold, savory pasta favorite with a Filipino-inspired twist.',
                p: '₱ 129',
                stock: 'In Stock',
                image: 'assets/products/pasta-binagoongan-pasta.png'
            }],
            'Cakes & Pastries': [{
                e: '🍰',
                n: 'Lavender Basque Cake',
                d: 'A rich, creamy cake with a delicate lavender-inspired finish.',
                p: '₱ 195',
                stock: 'In Stock',
                image: 'assets/Pasted Image 5.jpe'
            }, {
                e: '🧁',
                n: 'Rose Vanilla Cupcake',
                d: 'A charming cupcake with a soft, sweet vanilla finish.',
                p: '₱ 85',
                stock: 'In Stock'
            }, ],
        };
        const CATALOG_ORDER = ['Coffee', 'Flavored Coffee', 'Premium Latte', 'Matcha', 'Refreshers', 'Frappe', 'Rice Meals', 'Finger Foods', 'Pasta', 'Cakes & Pastries'];
        const HIDDEN_CATALOG_CATEGORIES = new Set(['Cakes & Pastries', 'Flowers', 'Bouquets']);
        const CUSTOMER_CATALOG_ORDER = CATALOG_ORDER.filter(category => !HIDDEN_CATALOG_CATEGORIES.has(category));
        const DRINK_CATEGORIES = ['Coffee', 'Flavored Coffee', 'Premium Latte', 'Matcha', 'Refreshers', 'Frappe'];
        const HOT_DRINK_CATEGORIES = ['Coffee', 'Flavored Coffee', 'Premium Latte', 'Matcha'];
        let currentCategory = 'Coffee';
        window.selectedProduct = null;

function escapeCatalogText(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function renderFeaturedToday() {
    const container = document.querySelector('#qr-landing .customer-featured-items');
    const fullMenu = document.getElementById('customer-full-menu-grid');
    if (!container || !fullMenu) return;

    const products = CUSTOMER_CATALOG_ORDER.flatMap(category =>
        (PRODUCTS[category] || []).map(product => ({ category, product }))
    );
    const renderCards = items => items.map(({ category, product }) => {
        const image = getProductImage(product, category);
        const imageMarkup = image
            ? `<img src="${escapeCatalogText(image)}" alt="${escapeCatalogText(product.n)}" loading="lazy" decoding="async">`
            : `<span aria-hidden="true">${escapeCatalogText(product.e || '')}</span>`;
        return `<article class="customer-featured-card" data-product-name="${escapeCatalogText(product.n)}" data-product-category="${escapeCatalogText(category)}">
            <div class="customer-featured-card__image">${imageMarkup}</div>
            <p class="customer-featured-card__name">${escapeCatalogText(product.n)}</p>
            <p class="customer-featured-card__category">${escapeCatalogText(category)}</p>
            <p class="customer-featured-card__price">${escapeCatalogText(product.p || '')}</p>
            ${renderCustomerStockBadge(product)}
        </article>`;
    }).join('');
    const featuredProducts = CUSTOMER_CATALOG_ORDER
        .map(category => products.find(item =>
            item.category === category && item.product.n !== 'Strawberry Coffee'
        ))
        .filter(Boolean);
    container.innerHTML = renderCards(featuredProducts);
    fullMenu.innerHTML = renderCards(products);
}

renderFeaturedToday();

function openFeaturedMenu() {
    const dialog = document.getElementById('customer-full-menu-dialog');
    if (!dialog || typeof dialog.showModal !== 'function') {
        console.error('The full menu dialog is unavailable in this browser.');
        return;
    }
    if (!dialog.open) dialog.showModal();
    window.FloreaCustomerSession.update({ fullMenuOpen: true });
}

function closeFeaturedMenu() {
    const dialog = document.getElementById('customer-full-menu-dialog');
    if (dialog?.open) dialog.close();
    window.FloreaCustomerSession.update({ fullMenuOpen: false });
}

function renderCatalogChips() {
    const wrap = document.getElementById('catalog-chips');
    wrap.innerHTML = CUSTOMER_CATALOG_ORDER.map(cat =>
        `<button type="button" class="chip${cat===currentCategory?' active':''}" data-category="${escapeCatalogText(cat)}">${escapeCatalogText(cat)}</button>`
    ).join('');
    if (!wrap.dataset.clickBound) {
        wrap.addEventListener('click', event => {
            const chip = event.target.closest('[data-category]');
            if (!chip || !wrap.contains(chip)) return;
            if (document.getElementById('catalog')?.classList.contains('active')) {
                document.querySelectorAll('.customer-menu-search input').forEach(input => { input.value = ''; });
                renderCatalogProducts(chip.dataset.category || null, '');
                scrollCatalogToFirstProduct();
                return;
            }
            if (chip.dataset.category) setCategory(chip.dataset.category);
        });
        wrap.dataset.clickBound = 'true';
    }
}

function renderProductThumb(item, width = '100%', category = '', loading = 'lazy') {
    const activeCategory = category || currentCategory;
    const src = getProductImage(item, activeCategory);
    const imageHeight = '224px';
    if (!src) return `<div class="thumb customer-catalog-card__image" style="height:${imageHeight};width:${width};">${item ? escapeCatalogText(item.e) : ''}</div>`;
    return `<div class="thumb customer-catalog-card__image" style="height:${imageHeight};width:${width};overflow:hidden;">
        <img src="${escapeCatalogText(src)}" alt="${escapeCatalogText(item ? item.n : category || 'Menu item')}" class="thumb-image" loading="${loading}" decoding="async" style="width:100%;height:100%;object-fit:contain;display:block;" />
    </div>`;
}

const productRatings = new Map();
const ratingVisitorStorageKey = 'florea-rating-visitor-id';
let ratingsReady = false;
let ratingsLoadInProgress = false;

function renderRating(productName) {
    const rating = productRatings.get(productName) || { average: 0, count: 0, myRating: 0 };
    const selectedRating = rating.myRating;
    const stars = Array.from({ length: 5 }, (_, index) => {
        const value = index + 1;
        return `<button type="button" class="rating-star${value <= selectedRating ? ' is-selected' : ''}" data-rating-product="${escapeCatalogText(productName)}" data-rating-value="${value}" aria-label="Rate ${escapeCatalogText(productName)} ${value} out of 5 stars" aria-pressed="${rating.myRating === value}" ${ratingsReady ? '' : 'disabled'}>★</button>`;
    }).join('');
    const summary = rating.count
        ? `${rating.average.toFixed(1)} (${rating.count} ${rating.count === 1 ? 'rating' : 'ratings'})`
        : 'No ratings yet';
    return `<div class="product-rating" data-product-name="${escapeCatalogText(productName)}"><div class="rating-stars" role="group" aria-label="Rate ${escapeCatalogText(productName)}">${stars}</div><span class="rating-summary">${summary}</span></div>`;
}

function renderFeaturedRatings() {
    document.querySelectorAll('[data-featured-rating]').forEach(container => {
        container.innerHTML = renderRating(container.dataset.featuredRating);
    });
}

function refreshRatingWidgets(productName = null) {
    document.querySelectorAll('.product-rating[data-product-name]').forEach(widget => {
        const name = widget.dataset.productName;
        if (!productName || name === productName) {
            widget.outerHTML = renderRating(name);
        }
    });
    renderBestSellerCards();
    renderFeaturedRatings();
}

function getRatingVisitorId() {
    let visitorId = localStorage.getItem(ratingVisitorStorageKey);
    if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem(ratingVisitorStorageKey, visitorId);
    }
    return visitorId;
}

function showRatingNotice(message, isError = false) {
    let notice = document.getElementById('rating-notice');
    if (!notice) {
        notice = document.createElement('div');
        notice.id = 'rating-notice';
        notice.className = 'rating-notice';
        notice.setAttribute('role', 'status');
        notice.setAttribute('aria-live', 'polite');
        document.body.appendChild(notice);
    }
    notice.textContent = message;
    notice.classList.toggle('is-error', isError);
    notice.hidden = false;
    clearTimeout(notice.timeoutId);
    notice.timeoutId = setTimeout(() => { notice.hidden = true; }, 3500);
}

function readLocalRatings() {
    const savedRatings = JSON.parse(localStorage.getItem('florea-product-ratings') || '{}');
    if (!savedRatings || typeof savedRatings !== 'object' || Array.isArray(savedRatings)) {
        throw new Error('Saved product ratings have an invalid format.');
    }
    productRatings.clear();
    Object.entries(savedRatings).forEach(([name, value]) => {
        if (typeof name === 'string' && value && Number.isFinite(value.average) &&
            Number.isInteger(value.count) && Number.isInteger(value.myRating)) {
            productRatings.set(name, value);
        }
    });
}

async function loadProductRatings(showErrors = true) {
    if (ratingsLoadInProgress) return;
    ratingsLoadInProgress = true;
    try {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            readLocalRatings();
        } else {
            const response = await FloreaOrderSync.fetchApi(
                `/api/ratings?visitorId=${encodeURIComponent(getRatingVisitorId())}`
            );
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || `Rating service returned ${response.status}.`);
            if (!result.ratings || typeof result.ratings !== 'object' || Array.isArray(result.ratings)) {
                throw new Error('The rating service returned invalid data.');
            }
            productRatings.clear();
            Object.entries(result.ratings).forEach(([name, value]) => productRatings.set(name, value));
        }
        ratingsReady = true;
        refreshRatingWidgets();
    } catch (error) {
        console.error('Unable to load product ratings.', error);
        ratingsReady = true;
        refreshRatingWidgets();
        if (showErrors) showRatingNotice(`Ratings are unavailable: ${error.message}`, true);
    } finally {
        ratingsLoadInProgress = false;
    }
}

async function submitProductRating(productName, value) {
    if (!Number.isInteger(value) || value < 1 || value > 5) return;
    const buttons = [...document.querySelectorAll('[data-rating-product]')]
        .filter(button => button.dataset.ratingProduct === productName);
    buttons.forEach(button => { button.disabled = true; });
    try {
        let updatedRating;
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const previousRating = productRatings.get(productName) || { average: 0, count: 0, myRating: 0 };
            const previousTotal = previousRating.average * previousRating.count;
            const count = previousRating.count + (previousRating.myRating ? 0 : 1);
            const total = previousTotal - previousRating.myRating + value;
            updatedRating = { average: total / count, count, myRating: value };
            productRatings.set(productName, updatedRating);
            localStorage.setItem('florea-product-ratings', JSON.stringify(Object.fromEntries(productRatings)));
        } else {
            const response = await FloreaOrderSync.fetchApi('/api/ratings', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ productName, rating: value, visitorId: getRatingVisitorId() })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || `Rating service returned ${response.status}.`);
            updatedRating = result.rating;
            if (!updatedRating || !Number.isFinite(updatedRating.average) ||
                !Number.isInteger(updatedRating.count) || updatedRating.myRating !== value) {
                throw new Error('The rating service returned invalid data.');
            }
            productRatings.set(productName, updatedRating);
        }
        refreshRatingWidgets(productName);
        showRatingNotice(`Thanks for rating ${productName}!`);
    } catch (error) {
        console.error('Unable to save product rating.', error);
        buttons.forEach(button => { button.disabled = false; });
        showRatingNotice(`Your rating could not be saved: ${error.message}`, true);
    }
}

document.addEventListener('click', event => {
    const ratingButton = event.target.closest('[data-rating-value]');
    if (!ratingButton) return;
    event.preventDefault();
    event.stopPropagation();
    submitProductRating(ratingButton.dataset.ratingProduct, Number(ratingButton.dataset.ratingValue));
});

function renderCatalogGrid() {
    const items = HIDDEN_CATALOG_CATEGORIES.has(currentCategory) ? [] : PRODUCTS[currentCategory] || [];
    document.getElementById('catalog-count').innerHTML = `${items.length} items in <b style="color:var(--ink);">${escapeCatalogText(currentCategory)}</b>`;
    document.getElementById('catalog-grid').innerHTML = items.map((it, index) => {
                const newTag = it.badge ? `<span class="badge badge-blush" style="font-size:9px;padding:2px 7px;margin-left:6px;">${escapeCatalogText(it.badge)}</span>` : '';
                return `<div class="card customer-catalog-card" data-product-index="${index}" data-product-category="${escapeCatalogText(currentCategory)}">
      ${renderProductThumb(it, '100%', currentCategory)}
      <p class="customer-catalog-card__name">${escapeCatalogText(it.n)}${newTag}</p>
      ${it.d ? `<p class="customer-catalog-card__description">${escapeCatalogText(it.d)}</p>` : '<p class="customer-catalog-card__description"></p>'}
      <div class="customer-catalog-card__rating">${renderRating(it.n)}</div>
      <div class="customer-catalog-card__footer">
<span class="customer-catalog-card__price">${escapeCatalogText(it.p)}</span>
${renderCustomerStockBadge(it)}
${renderCatalogQuickAddButton(it, currentCategory)}
      </div>
    </div>`;
  }).join('');
    revealScrollElements(document.getElementById('catalog-grid'));
    const grid = document.getElementById('catalog-grid');
    if (!grid.dataset.clickBound) {
        grid.addEventListener('click', event => {
            if (event.target.closest('[data-rating-value]')) return;
            const card = event.target.closest('[data-product-index]');
            if (!card || !grid.contains(card)) return;
            selectProduct(card.dataset.productCategory, Number(card.dataset.productIndex));
        });
        grid.dataset.clickBound = 'true';
    }
}

function getCustomerProductStock(product) {
    const quantity = Number.isFinite(product?.quantity) ? product.quantity : null;
    const outOfStock = product?.stock === 'Sold Out' || (quantity !== null && quantity <= 0);
    if (outOfStock) return { label: 'Out of Stock', badgeClass: 'badge-danger', outOfStock: true, quantity };
    const lowStock = product?.stock === 'Low Stock' ||
        (quantity !== null && Number.isFinite(product?.reorderLevel) && quantity <= product.reorderLevel);
    return {
        label: lowStock ? 'Low Stock' : 'In Stock',
        badgeClass: lowStock ? 'badge-gold' : 'badge-sage',
        outOfStock: false,
        quantity
    };
}

function renderCustomerStockBadge(product) {
    const stock = getCustomerProductStock(product);
    return `<span class="badge ${stock.badgeClass} customer-stock-badge" aria-label="Availability: ${stock.label}">${stock.label}</span>`;
}

function refreshCustomerStockIndicators() {
    document.querySelectorAll('.customer-catalog-card, .customer-featured-card').forEach(card => {
        const quickAddButton = card.querySelector('.customer-quick-add');
        const productName = card.dataset.productName ||
            quickAddButton?.dataset.productName ||
            card.querySelector('.customer-catalog-card__name, .customer-featured-card__name')?.textContent.trim();
        const category = card.dataset.productCategory || quickAddButton?.dataset.productCategory;
        const product = (PRODUCTS[category] || []).find(item => item.n === productName);
        if (!product) return;

        const stock = getCustomerProductStock(product);
        let badge = card.querySelector('.customer-stock-badge');
        if (!badge && quickAddButton) {
            quickAddButton.insertAdjacentHTML('beforebegin', renderCustomerStockBadge(product));
            badge = card.querySelector('.customer-stock-badge');
        }
        if (badge) {
            badge.className = `badge ${stock.badgeClass} customer-stock-badge`;
            badge.textContent = stock.label;
            badge.setAttribute('aria-label', `Availability: ${stock.label}`);
        }
        if (quickAddButton) {
            if (!quickAddButton.dataset.availableAriaLabel) {
                quickAddButton.dataset.availableAriaLabel = quickAddButton.getAttribute('aria-label') || `Add ${product.n} to cart`;
                quickAddButton.dataset.availableTitle = quickAddButton.title;
            }
            quickAddButton.disabled = stock.outOfStock;
            quickAddButton.setAttribute('aria-label', stock.outOfStock
                ? `${product.n} is out of stock`
                : quickAddButton.dataset.availableAriaLabel);
            quickAddButton.title = stock.outOfStock ? 'Out of stock' : quickAddButton.dataset.availableTitle;
        }
    });
}

window.getCustomerProductStock = getCustomerProductStock;

function setCategory(cat){
  if (!CUSTOMER_CATALOG_ORDER.includes(cat)) return;
  currentCategory = cat;
  renderCatalogChips();
  renderCatalogGrid();
}
function openCatalog(cat){
  if(cat) setCategory(cat);
  go('catalog');
}
renderCatalogChips();
renderCatalogGrid();

const customerScreens = [
  {id:'qr-landing', label:'QR Landing Page'},
  {id:'menu-home', label:'Digital Menu / Home'},
  {id:'catalog', label:'Product Catalog'},
  {id:'product-details', label:'Product Details'},
];
const customerJourneyScreenIds = new Set([
  ...customerScreens.map(screen => screen.id),
  'selection',
  'sent-confirmation'
]);
const adminScreens = [
  {id:'admin-dashboard', label:'Dashboard'},
  {id:'order-management', label:'Order Management'},
  {id:'sales-automation', label:'Sales Automation'},
  {id:'inventory-control', label:'Inventory Control'},
  {id:'product-management', label:'Product Management'},
  {id:'customer-management', label:'Customer Management'},
  {id:'analytics', label:'Sales Analytics'},
  {id:'reports', label:'Reports'},
  {id:'notifications', label:'Notifications'},
];
const adminProtectedScreenIds = new Set(adminScreens.map(screen => screen.id));
const adminNavigationGroups = [
  {
    label: 'Main Menu',
    items: [
      ['admin-dashboard', 'Dashboard', 'dashboard'],
      ['order-management', 'Order Management', 'orders'],
      ['product-management', 'Product Management', 'products'],
      ['inventory-control', 'Inventory Control', 'inventory'],
      ['customer-management', 'Customer Management', 'customers'],
    ]
  },
  {
    label: 'Business Management',
    items: [
      ['analytics', 'Sales Analytics', 'analytics'],
      ['reports', 'Reports', 'reports'],
    ]
  },
  {
    label: 'System Management',
    items: [
      ['notifications', 'Notifications', 'notifications'],
      ['settings', 'Settings', 'settings'],
    ]
  },
];
const adminIconPaths = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  orders: '<path d="M7 3h10l2 3v15H5V6l2-3Z"/><path d="M9 10h6M9 14h6M9 18h4"/>',
  products: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12v9"/>',
  inventory: '<path d="M4 7h16v13H4zM3 4h18v3H3z"/><path d="M9 11h6"/>',
  customers: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5.5a3.5 3.5 0 0 1 0 6.8M18 14a5 5 0 0 1 3.5 6"/>',
  analytics: '<path d="M3 20h18"/><path d="M6 16v-5M12 16V4M18 16V8"/>',
  reports: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7"/>',
  notifications: '<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.8Z"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>',
};

function renderAdminNavigation(activeScreen) {
  const activeItem = activeScreen === 'sales-automation' ? 'analytics' : activeScreen;
  document.querySelectorAll('.admin-sidenav').forEach(nav => {
    nav.setAttribute('aria-label', 'Admin navigation');
    const groups = adminNavigationGroups.map(group => `
      <div class="admin-sidebar-group">
        <p class="admin-sidebar-label">${group.label}</p>
        ${group.items.map(([id, label, icon]) => `
          <a href="#" class="admin-nav-link${activeItem === id ? ' active' : ''}" ${id === 'settings' ? 'data-ui-action="settings"' : `data-admin-screen="${id}"`}${activeItem === id ? ' aria-current="page"' : ''}>
            <svg class="admin-nav-icon" viewBox="0 0 24 24" aria-hidden="true">${adminIconPaths[icon]}</svg>
            <span>${label}</span>
            ${id === 'notifications' ? '<span class="admin-notification-count" hidden></span>' : ''}
          </a>`).join('')}
      </div>`).join('');
    nav.innerHTML = `
      <div class="admin-sidebar-brand">
        <img src="/florea-logo-192.png" alt="">
        <span><strong>FLORÉA</strong><small>ADMIN PANEL</small></span>
      </div>
      <div class="admin-sidebar-scroll">${groups}</div>
      <div class="admin-sidebar-profile">
        <span class="admin-profile-avatar" aria-hidden="true">A</span>
        <span><strong>Admin account</strong><small>Administrator</small></span>
        <button type="button" class="admin-logout" data-admin-logout aria-label="Log out" title="Log out">
          <svg class="admin-nav-icon" viewBox="0 0 24 24" aria-hidden="true">${adminIconPaths.logout}</svg>
        </button>
      </div>`;
  });

  document.querySelectorAll('.screen[id] .admin-topbar').forEach(topbar => {
    const screen = topbar.closest('.screen');
    if (!screen || !adminProtectedScreenIds.has(screen.id)) return;
    if (topbar.querySelector('[data-admin-menu-toggle]')) return;
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'admin-sidebar-toggle';
    toggle.dataset.adminMenuToggle = '';
    toggle.setAttribute('aria-label', 'Open admin navigation');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    topbar.insertBefore(toggle, topbar.firstChild);
  });
  document.querySelectorAll('.admin-body.admin-nav-open').forEach(adminBody => adminBody.classList.remove('admin-nav-open'));
  document.querySelectorAll('[data-admin-menu-toggle][aria-expanded="true"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
}

document.addEventListener('click', event => {
  const toggle = event.target.closest('[data-admin-menu-toggle]');
  if (toggle) {
    const adminBody = toggle.closest('.screen')?.querySelector('.admin-body');
    if (adminBody) {
      const isOpen = adminBody.classList.toggle('admin-nav-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    }
    return;
  }
  const adminLink = event.target.closest('[data-admin-screen]');
  if (adminLink) {
    event.preventDefault();
    go(adminLink.dataset.adminScreen);
    return;
  }
  const logoutButton = event.target.closest('[data-admin-logout]');
  if (logoutButton) {
    logoutAdmin();
    go('admin-login');
    return;
  }
  if (!event.target.closest('.admin-sidenav, [data-admin-menu-toggle]')) {
    document.querySelectorAll('.admin-body.admin-nav-open').forEach(adminBody => adminBody.classList.remove('admin-nav-open'));
    document.querySelectorAll('[data-admin-menu-toggle][aria-expanded="true"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
  }
});

const cashierScreens = [
  {id:'cashier-dashboard', label:'Orders Dashboard'},
];

const custRail = document.getElementById('customer-rail');
customerScreens.forEach((s,i)=>{
  const el = document.createElement('div');
  el.className='rail-item'; el.id='nav-'+s.id;
  el.innerHTML = `<div class="petal"><span class="num">${i+1}</span></div><span class="label">${s.label}</span><span class="check">✓</span>`;
  el.onclick=()=>go(s.id);
  custRail.appendChild(el);
});
const adminRail = document.getElementById('admin-rail');
adminScreens.forEach((s)=>{
  const el = document.createElement('div');
  el.className='rail-admin-item'; el.id='nav-'+s.id;
  el.innerHTML = `<span class="dot"></span><span class="label">${s.label}</span>`;
  el.onclick=()=>go(s.id);
  adminRail.appendChild(el);
});
const cashierRail = document.getElementById('cashier-rail');
cashierScreens.forEach((s)=>{
  const el = document.createElement('div');
  el.className='rail-admin-item'; el.id='nav-'+s.id;
  el.innerHTML = `<span class="dot"></span><span class="label">${s.label}</span>`;
  el.onclick=()=>go(s.id);
  cashierRail.appendChild(el);
});

const AUTH_KEYS = {
  admin: 'florea-admin-auth',
  cashier: 'florea-cashier-auth'
};
let adminSessionVerified = false;

function isAuthenticated(role){
  if (role === 'admin' && !FloreaOrderSync.isLocal()) return adminSessionVerified;
  try {
    const storage = role === 'cashier' && !FloreaOrderSync.isLocal() ? sessionStorage : localStorage;
    return storage.getItem(AUTH_KEYS[role]) === 'true';
  } catch (e) {
    return false;
  }
}

function setAuthenticated(role, value){
  if (role === 'admin' && !FloreaOrderSync.isLocal()) adminSessionVerified = Boolean(value);
  try {
    const storage = role === 'cashier' && !FloreaOrderSync.isLocal() ? sessionStorage : localStorage;
    storage.setItem(AUTH_KEYS[role], value ? 'true' : 'false');
  } catch (e) {}
}

function getExistingMenuUrl() {
  const localHosts = ['localhost', '127.0.0.1'];
  const localPorts = ['3000', '8000'];
  const isLocalDevelopment = localHosts.includes(window.location.hostname) || localPorts.includes(window.location.port);
  if (isLocalDevelopment) {
    return new URL('florea-prototype.html?view=customer', window.location.href).href;
  }
  return new URL('/', window.location.origin).href;
}

function initAdminQrCode() {
  const qrContainer = document.getElementById('admin-qr-code');
  const urlInput = document.getElementById('admin-qr-url-input');
  const generateButton = document.getElementById('generate-admin-qr');
  const downloadButton = document.getElementById('download-admin-qr');
  const urlLabel = document.getElementById('admin-qr-url');
  if (!qrContainer || !urlInput || !generateButton || !downloadButton || !urlLabel || typeof QRCode === 'undefined') return;

  function renderQrCode() {
    const menuUrl = urlInput.value.trim();
    try {
      new URL(menuUrl);
    } catch (error) {
      urlInput.focus();
      return;
    }
    urlLabel.textContent = menuUrl;
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
      text: menuUrl,
      width: 130,
      height: 130,
      colorDark: '#16240F',
      colorLight: '#FFFFFF',
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  urlInput.value = getExistingMenuUrl();
  renderQrCode();
  generateButton.addEventListener('click', renderQrCode);

  downloadButton.addEventListener('click', () => {
    const canvas = qrContainer.querySelector('canvas');
    const image = qrContainer.querySelector('img');
    const dataUrl = canvas ? canvas.toDataURL('image/png') : (image ? image.src : '');
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'florea-existing-menu-qr.png';
    link.click();
  });
}

function startCustomerJourney() {
  const field = document.getElementById('customer-name-input');
  const name = field ? field.value.trim() : '';
  if (!name) {
    if (field) field.focus();
    alert('Please enter your name first.');
    return;
  }

  customerNameForSession = name;
  try {
    localStorage.setItem('florea-customer-name', name);
  } catch (error) {
    console.warn('Unable to save customer name.', error);
  }
  try {
    sessionStorage.setItem(customerSessionNameStorageKey, name);
  } catch (error) {
    console.warn('Unable to retain the customer name for this session.', error);
  }
  loadCustomerFavorites(true);
  updateCustomerGreeting(name);
  go('menu-home');
}

function updateCustomerGreeting(name) {
  const greeting = document.getElementById('customer-greeting');
  if (greeting) greeting.textContent = `Hi, ${name} 👋`;
}

const customerFeedbackStorageKey = 'florea-customer-feedback';

function openCustomerFeedback() {
  const dialog = document.getElementById('customer-feedback-dialog');
  const form = document.getElementById('customer-feedback-form');
  const nameInput = document.getElementById('customer-feedback-name');
  const status = document.getElementById('customer-feedback-status');
  if (!dialog || !form || !nameInput || !status) {
    console.error('Customer feedback form is unavailable.');
    return;
  }

  form.reset();
  status.hidden = true;
  status.classList.remove('is-error');
  try {
    nameInput.value = localStorage.getItem('florea-customer-name') || '';
  } catch (error) {
    console.warn('Unable to load the saved customer name for feedback.', error);
  }
  dialog.showModal();
  window.FloreaCustomerSession.update({
    feedbackOpen: true,
    feedbackDraft: { name: nameInput.value, message: '' }
  });
}

function closeCustomerFeedback() {
  document.getElementById('customer-feedback-dialog')?.close();
  window.FloreaCustomerSession.update({ feedbackOpen: false });
}

async function submitCustomerFeedback(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const nameInput = document.getElementById('customer-feedback-name');
  const messageInput = document.getElementById('customer-feedback-message');
  const status = document.getElementById('customer-feedback-status');
  const submitButton = form.querySelector('button[type="submit"]');
  const customerName = nameInput.value.trim();
  const message = messageInput.value.trim();

  if (!customerName || !message) {
    status.textContent = 'Enter your name and feedback before sending.';
    status.classList.add('is-error');
    status.hidden = false;
    return;
  }

  submitButton.disabled = true;
  status.hidden = true;
  status.classList.remove('is-error');
  try {
    if (FloreaOrderSync.isLocal()) {
      const savedFeedback = JSON.parse(localStorage.getItem(customerFeedbackStorageKey) || '[]');
      if (!Array.isArray(savedFeedback)) {
        throw new Error('Saved feedback has an invalid format.');
      }
      savedFeedback.unshift({
        id: crypto.randomUUID(),
        customerName,
        message,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(customerFeedbackStorageKey, JSON.stringify(savedFeedback));
    } else {
      const result = await FloreaOrderSync.request('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({ customerName, message })
      });
      if (!result.feedback || typeof result.feedback.id !== 'string') {
        throw new Error('The feedback service returned an invalid response.');
      }
    }

    form.reset();
    status.textContent = 'Thank you! Your feedback was sent to the café.';
    status.hidden = false;
    window.FloreaCustomerSession.update({
      feedbackOpen: false,
      feedbackDraft: { name: '', message: '' }
    });
  } catch (error) {
    console.error('Unable to send customer feedback.', error);
    status.textContent = `Your feedback could not be sent. ${error.message}`;
    status.classList.add('is-error');
    status.hidden = false;
  } finally {
    submitButton.disabled = false;
  }
}

document.getElementById('customer-feedback-form').addEventListener('submit', submitCustomerFeedback);

async function loginAdmin() {
  const usernameField = document.getElementById('admin-username-input');
  const username = usernameField ? usernameField.value.trim().toLowerCase() : '';
  const field = document.getElementById('admin-password-input');
  const password = field ? field.value.trim() : '';
  if (username !== 'admin') {
    alert('The admin username must be admin.');
    if (usernameField) usernameField.focus();
    return;
  }
  if (FloreaOrderSync.isLocal() && password === 'admin123') {
    setAuthenticated('admin', true);
    go('admin-dashboard');
    return;
  }
  try {
    await FloreaOrderSync.request('/api/admin-auth', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    setAuthenticated('admin', true);
    go('admin-dashboard');
  } catch (requestError) {
    alert(requestError.message);
    if (field) field.focus();
  }
}

function togglePasswordVisibility(inputId, button) {
  const input = document.getElementById(inputId);
  if (!(input instanceof HTMLInputElement)) {
    console.error(`Password visibility control could not find "${inputId}".`);
    return;
  }
  const isVisible = input.type === 'password';
  input.type = isVisible ? 'text' : 'password';
  button.setAttribute('aria-pressed', String(isVisible));
  button.setAttribute('aria-label', isVisible ? 'Hide password' : 'Show password');
  button.querySelectorAll('[data-password-icon]').forEach(icon => {
    const shouldHide = icon.dataset.passwordIcon !== (isVisible ? 'visible' : 'hidden');
    if (shouldHide) icon.setAttribute('hidden', '');
    else icon.removeAttribute('hidden');
  });
}

function setCashierLoginMessage(message, state = 'error') {
  const messageElement = document.getElementById('cashier-login-error');
  if (!messageElement) return;
  messageElement.textContent = message;
  messageElement.dataset.state = state;
  messageElement.hidden = false;
}

function setCashierLoginLoading(isLoading) {
  const button = document.getElementById('cashier-login-submit');
  const label = document.getElementById('cashier-login-submit-label');
  const spinner = document.getElementById('cashier-login-spinner');
  if (button) button.disabled = isLoading;
  if (label) label.textContent = isLoading ? 'Signing in…' : 'Sign In';
  if (spinner) spinner.hidden = !isLoading;
}

function rememberCashierUsername() {
  const username = document.getElementById('cashier-username-input');
  const remember = document.getElementById('cashier-remember-username');
  if (!(username instanceof HTMLInputElement) || !(remember instanceof HTMLInputElement)) return;
  try {
    if (remember.checked) localStorage.setItem('florea-cashier-username', username.value.trim());
    else localStorage.removeItem('florea-cashier-username');
  } catch (storageError) {
    console.warn('Unable to remember the cashier username.', storageError);
  }
}

function initializeCashierLogin() {
  const username = document.getElementById('cashier-username-input');
  const remember = document.getElementById('cashier-remember-username');
  if (username instanceof HTMLInputElement && remember instanceof HTMLInputElement) {
    try {
      const savedUsername = localStorage.getItem('florea-cashier-username');
      if (savedUsername) {
        username.value = savedUsername;
        remember.checked = true;
      }
    } catch (storageError) {
      console.warn('Unable to restore the remembered cashier username.', storageError);
    }
    remember.addEventListener('change', rememberCashierUsername);
    username.addEventListener('change', rememberCashierUsername);
  }

  const date = document.getElementById('cashier-login-date');
  const clock = document.getElementById('cashier-login-clock');
  const updateClock = () => {
    const now = new Date();
    if (date) {
      date.dateTime = now.toISOString();
      date.textContent = new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(now);
    }
    if (clock) {
      clock.textContent = new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
      }).format(now);
    }
  };
  updateClock();
  window.setInterval(updateClock, 1000);

  const status = document.getElementById('cashier-connection-status');
  const statusLabel = document.getElementById('cashier-connection-label');
  const updateConnectionStatus = async () => {
    if (!status || !statusLabel) return;
    if (!navigator.onLine) {
      status.dataset.state = 'offline';
      statusLabel.textContent = 'No internet connection';
      return;
    }
    try {
      const response = await FloreaOrderSync.fetchApi('/api/cashier-auth', { cache: 'no-store' });
      if (!response.ok && response.status !== 401) {
        throw new Error(`Cashier API check returned ${response.status}.`);
      }
      status.dataset.state = 'online';
      statusLabel.textContent = 'System connected';
    } catch {
      status.dataset.state = 'offline';
      statusLabel.textContent = 'System connection unavailable';
    }
  };
  updateConnectionStatus();
  window.setInterval(updateConnectionStatus, 30000);
  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
}

async function loginCashier(event) {
  event?.preventDefault();
  const usernameField = document.getElementById('cashier-username-input');
  const passwordField = document.getElementById('cashier-password-input');
  const username = usernameField instanceof HTMLInputElement ? usernameField.value.trim() : '';
  const password = passwordField instanceof HTMLInputElement ? passwordField.value : '';
  const error = document.getElementById('cashier-login-error');
  if (error) error.hidden = true;

  if (!username || password.length === 0) {
    setCashierLoginMessage('Enter your username and password to continue.');
    (!username ? usernameField : passwordField)?.focus();
    return;
  }

  setCashierLoginLoading(true);
  try {
    if (FloreaOrderSync.isLocal()) {
      if (username !== 'cashier' || password !== 'cashier123') {
        setCashierLoginMessage('Incorrect username or password.');
        passwordField?.focus();
        return;
      }
    } else {
      await FloreaOrderSync.request('/api/cashier-auth', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
    }
    rememberCashierUsername();
    if (passwordField) passwordField.value = '';
    setCashierLoginMessage('Login successful. Opening your dashboard…', 'success');
    await new Promise(resolve => window.setTimeout(resolve, 300));
    setAuthenticated('cashier', true);
    go('cashier-dashboard');
  } catch (requestError) {
    if (requestError instanceof TypeError || !requestError.status || requestError.status >= 500) {
      console.error('Cashier sign-in request failed.', requestError);
    }
    setCashierLoginMessage(requestError instanceof TypeError
      ? 'Unable to reach the system. Check your connection and try again.'
      : requestError.message || 'System error. Please try again.');
    if (passwordField) passwordField.focus();
  } finally {
    setCashierLoginLoading(false);
  }
}

function logoutAdmin() {
  setAuthenticated('admin', false);
  if (!FloreaOrderSync.isLocal()) {
    FloreaOrderSync.request('/api/admin-auth', { method: 'DELETE' }).catch(error => {
      console.error('Unable to end the admin server session.', error);
    });
  }
}

async function logoutCashier() {
  let logoutError = null;
  if (!FloreaOrderSync.isLocal()) {
    try {
      await FloreaOrderSync.request('/api/cashier-auth', { method: 'DELETE' });
    } catch (error) {
      logoutError = error;
      console.error('Unable to close the cashier server session.', error);
    }
  }
  setAuthenticated('cashier', false);
  window.cashierInitialized = false;
  window.resetCashierDashboard?.();
  const loginMessage = document.getElementById('cashier-login-error');
  if (loginMessage) loginMessage.hidden = true;
  go('cashier-login');
  if (logoutError) alert(`The browser session was cleared, but the server logout request failed. ${logoutError.message}`);
}

const isPublicCustomerView = window.location.pathname === '/' ||
  /^\/menu\/?$/.test(window.location.pathname) ||
  new URLSearchParams(window.location.search).get('view') === 'customer';
const customerSessionStateStorageKey = 'florea-customer-session-v1';
window.FloreaCustomerSession = {
  read() {
    try {
      const savedState = sessionStorage.getItem(customerSessionStateStorageKey);
      if (!savedState) return {};
      const state = JSON.parse(savedState);
      if (!state || typeof state !== 'object' || Array.isArray(state)) {
        throw new Error('Saved customer session has an invalid format.');
      }
      return state;
    } catch (error) {
      console.warn('Unable to restore the customer session.', error);
      return {};
    }
  },
  update(updates) {
    try {
      sessionStorage.setItem(customerSessionStateStorageKey, JSON.stringify({
        ...this.read(),
        ...updates
      }));
    } catch (error) {
      console.warn('Unable to save the customer session.', error);
    }
  }
};
const customerSessionNameStorageKey = 'florea-customer-name-session';
let customerNameForSession = '';
try {
  customerNameForSession = sessionStorage.getItem(customerSessionNameStorageKey) || '';
  const nameInput = document.getElementById('customer-name-input');
  if (nameInput && customerNameForSession) nameInput.value = customerNameForSession;
} catch (error) {
  console.warn('Unable to restore the customer name for this session.', error);
}
const customerFavoritesStoragePrefix = 'florea-customer-favorites:';
const favoritesCatalogCategory = 'Favorites';
let customerFavorites = new Set();
let customerFavoritesStorageKey = null;
let customerFavoritesLoaded = false;

function getCustomerFavoritesStorageKey() {
  let customerName = customerNameForSession.trim();
  if (!customerName) {
    try {
      customerName = localStorage.getItem('florea-customer-name') || '';
    } catch (error) {
      console.error('Unable to identify the customer for favorites.', error);
      return null;
    }
  }
  const owner = customerName.trim().normalize('NFKC').toLocaleLowerCase();
  return owner ? `${customerFavoritesStoragePrefix}${encodeURIComponent(owner)}` : null;
}

function showCustomerFavoriteNotice(message, isError = false) {
  let notice = document.getElementById('customer-favorite-notice');
  if (!notice) {
    notice = document.createElement('div');
    notice.id = 'customer-favorite-notice';
    notice.className = 'rating-notice';
    notice.setAttribute('role', 'status');
    notice.setAttribute('aria-live', 'polite');
    document.body.appendChild(notice);
  }
  notice.textContent = message;
  notice.classList.toggle('is-error', isError);
  notice.hidden = false;
  clearTimeout(notice.timeoutId);
  notice.timeoutId = setTimeout(() => { notice.hidden = true; }, 3500);
}

function loadCustomerFavorites(force = false) {
  const storageKey = getCustomerFavoritesStorageKey();
  if (!storageKey) {
    customerFavorites = new Set();
    customerFavoritesStorageKey = null;
    customerFavoritesLoaded = false;
    updateFavoriteNavigationLabels();
    return false;
  }
  if (!force && customerFavoritesLoaded && storageKey === customerFavoritesStorageKey) return true;

  customerFavorites = new Set();
  customerFavoritesStorageKey = storageKey;
  customerFavoritesLoaded = false;
  try {
    const savedFavorites = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(savedFavorites) || savedFavorites.some(item => typeof item !== 'string')) {
      throw new Error('Saved favorites have an invalid format.');
    }
    customerFavorites = new Set(savedFavorites);
    customerFavoritesLoaded = true;
    updateFavoriteNavigationLabels();
    return true;
  } catch (error) {
    console.error('Unable to load customer favorites.', error);
    showCustomerFavoriteNotice(`Favorites could not be loaded: ${error.message}`, true);
    return false;
  }
}

function getFavoriteProductId(category, productName) {
  return JSON.stringify([category, productName]);
}

function updateFavoriteNavigationLabels() {
  const count = customerFavorites.size;
  document.querySelectorAll('[data-favorites-link]').forEach(link => {
    link.textContent = `♡ Favorites${count ? ` (${count})` : ''}`;
  });
}

function updateProductFavoriteButton() {
  const button = document.getElementById('product-favorite-toggle');
  if (!button || !selectedProduct) return;
  loadCustomerFavorites();
  const isFavorite = customerFavorites.has(getFavoriteProductId(selectedProduct.category, selectedProduct.name));
  button.textContent = isFavorite ? '♥' : '♡';
  button.classList.toggle('is-favorite', isFavorite);
  button.setAttribute('aria-label', isFavorite
    ? `Remove ${selectedProduct.name} from favorites`
    : `Add ${selectedProduct.name} to favorites`);
  button.setAttribute('aria-pressed', String(isFavorite));
}

function toggleSelectedProductFavorite() {
  if (!selectedProduct) return;
  const storageKey = getCustomerFavoritesStorageKey();
  if (!storageKey) {
    showCustomerFavoriteNotice('Enter your name to save customer favorites.', true);
    return;
  }
  if (!loadCustomerFavorites()) return;

  const productId = getFavoriteProductId(selectedProduct.category, selectedProduct.name);
  const nextFavorites = new Set(customerFavorites);
  const isFavorite = nextFavorites.has(productId);
  if (isFavorite) nextFavorites.delete(productId);
  else nextFavorites.add(productId);

  try {
    localStorage.setItem(storageKey, JSON.stringify([...nextFavorites]));
  } catch (error) {
    console.error('Unable to save customer favorites.', error);
    showCustomerFavoriteNotice(`Favorite could not be saved: ${error.message}`, true);
    return;
  }

  customerFavorites = nextFavorites;
  customerFavoritesStorageKey = storageKey;
  customerFavoritesLoaded = true;
  updateFavoriteNavigationLabels();
  updateProductFavoriteButton();
  showCustomerFavoriteNotice(isFavorite
    ? `${selectedProduct.name} removed from Favorites.`
    : `${selectedProduct.name} saved to Favorites.`);
  if (activeCatalogCategory === favoritesCatalogCategory) {
    renderCatalogProducts(favoritesCatalogCategory, activeCatalogSearch);
  }
}

function openCustomerFavorites() {
  loadCustomerFavorites(true);
  activeCatalogCategory = favoritesCatalogCategory;
  activeCatalogSearch = '';
  go('catalog');
}

window.addEventListener('storage', event => {
  if (event.key !== getCustomerFavoritesStorageKey()) return;
  loadCustomerFavorites(true);
  updateProductFavoriteButton();
  if (activeCatalogCategory === favoritesCatalogCategory) {
    renderCatalogProducts(favoritesCatalogCategory, activeCatalogSearch);
  }
});

loadCustomerFavorites();
updateFavoriteNavigationLabels();

const customerNameInput = document.getElementById('customer-name-input');
customerNameInput?.addEventListener('input', () => {
  customerNameForSession = customerNameInput.value.trim();
  try {
    if (customerNameForSession) {
      sessionStorage.setItem(customerSessionNameStorageKey, customerNameForSession);
    } else {
      sessionStorage.removeItem(customerSessionNameStorageKey);
    }
  } catch (error) {
    console.warn('Unable to retain the customer name for this session.', error);
  }
});
const routePath = window.location.pathname.replace(/\/+$/, '') || '/';
const requestedView = new URLSearchParams(window.location.search).get('view') ||
  (routePath === '/admin' ? 'admin' : routePath === '/cashier' ? 'cashier' : null);
const isStaffPortalView = requestedView === 'admin' || requestedView === 'cashier';
const requestedScreen = new URLSearchParams(window.location.search).get('screen');

function hasCustomerNameForSession() {
  return Boolean(customerNameForSession.trim());
}

function blockUnnamedCustomerClick(event) {
  if (!isPublicCustomerView || hasCustomerNameForSession()) return;
  const target = event.target instanceof Element ? event.target : event.target?.parentElement;
  if (!target || target.closest('#customer-name-input, #customer-name-continue, #customer-full-menu-open, #customer-full-menu-close, a[data-customer-contact], a.customer-facebook-link, a.customer-instagram-link')) return;
  const interactive = target.closest(
    'button, a[href], input, select, textarea, [onclick], [data-ui-action], [role="button"], [tabindex]:not([tabindex="-1"])'
  );
  if (!interactive) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  document.getElementById('customer-name-input')?.focus();
  alert('Please enter your name first.');
}

document.addEventListener('click', blockUnnamedCustomerClick, true);
document.addEventListener('submit', event => {
  if (!isPublicCustomerView || hasCustomerNameForSession()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  document.getElementById('customer-name-input')?.focus();
  alert('Please enter your name first.');
}, true);

let scrollRevealObserver;
let activeScreenMutationObserver;
let catalogScrollTop = 0;
const scrollRevealSelector = '.card, .card-soft, .hero-banner, .section-title, .grid > *, .admin-topbar, .mobile-nav, .login-shell, tbody tr, .customer-featured-card';

function revealScrollElements(root) {
  if (!root || !root.closest('.screen.active')) return;
  if (root.matches?.('#catalog-grid, #catalog-grid .customer-catalog-card') ||
      root.closest?.('#catalog-grid')) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    scrollRevealObserver ||= new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        scrollRevealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
  }

  const targets = new Set();
  if (root.nodeType === Node.ELEMENT_NODE && root.matches(scrollRevealSelector)) targets.add(root);
  root.querySelectorAll(scrollRevealSelector).forEach(element => targets.add(element));
  targets.forEach((element, index) => {
    if (element.classList.contains('system-reveal')) return;
    element.classList.add('system-reveal');
    element.style.setProperty('--system-reveal-delay', `${Math.min(index, 5) * 45}ms`);
    if (reduceMotion || !scrollRevealObserver) {
      element.classList.add('is-visible');
    } else {
      scrollRevealObserver.observe(element);
    }
  });
}

function observeScreenReveals(screen) {
  activeScreenMutationObserver?.disconnect();
  revealScrollElements(screen);
  if (!('MutationObserver' in window) || !screen) return;
  activeScreenMutationObserver = new MutationObserver(records => {
    records.forEach(record => {
      if (screen.id === 'selection' && record.target.closest('#selection-content')) return;
      record.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) revealScrollElements(node);
      });
    });
  });
  activeScreenMutationObserver.observe(screen, { childList: true, subtree: true });
}

function go(id){
  if (adminProtectedScreenIds.has(id) && !isAuthenticated('admin')) {
    id = 'admin-login';
  }
  if (id === 'cashier-dashboard' && !isAuthenticated('cashier')) {
    id = 'cashier-login';
  }
  if (isPublicCustomerView && id !== 'qr-landing' && !hasCustomerNameForSession()) {
    id = 'qr-landing';
  }

  const activeScreen = document.querySelector('.screen.active');
  if (activeScreen?.id === 'catalog' && id === 'product-details') {
    catalogScrollTop = window.scrollY;
    window.FloreaCustomerSession.update({ catalogScrollTop });
  }
  const restoreCatalogScroll = id === 'catalog' && activeScreen?.id === 'product-details';

  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const target = document.getElementById(id);
  if (!target) return;
  if (isPublicCustomerView && customerJourneyScreenIds.has(id)) {
    window.FloreaCustomerSession.update({ screen: id });
  }
  const isAdminPage = adminProtectedScreenIds.has(id) || id === 'admin-login';
  document.body.classList.toggle('admin-view', isAdminPage);
  document.documentElement.classList.toggle('admin-view', isAdminPage);
  document.body.classList.toggle('staff-portal-view', isStaffPortalView);
  document.documentElement.classList.toggle('staff-portal-view', isStaffPortalView);
  if (isAdminPage) renderAdminNavigation(id);
  if (id === 'catalog') renderCatalogProducts(activeCatalogCategory, activeCatalogSearch);
  if (id === 'menu-home') {
    try {
      const customerName = localStorage.getItem('florea-customer-name');
      if (customerName) updateCustomerGreeting(customerName);
    } catch (error) {
      console.warn('Unable to restore customer name.', error);
    }
  }
  target.classList.add('active');
  document.querySelectorAll('.rail-item, .rail-admin-item').forEach(s=>s.classList.remove('active'));
  const navEl = document.getElementById('nav-'+id);
  if(navEl) navEl.classList.add('active');

  const cust = customerScreens.find(s=>s.id===id);
  const adm = adminScreens.find(s=>s.id===id);
  const cashier = cashierScreens.find(s=>s.id===id);
  const isCustomerFlowPage = Boolean(cust) || id === 'selection' || id === 'sent-confirmation';
  const isCustomerPage = isCustomerFlowPage && isPublicCustomerView;
  document.body.classList.toggle('customer-view', isCustomerPage);
  document.documentElement.classList.toggle('customer-view', isCustomerPage);
  const isCashierPage = Boolean(cashier) || id === 'cashier-login';
  document.body.classList.toggle('cashier-view', isCashierPage);
  document.documentElement.classList.toggle('cashier-view', isCashierPage);
  window.updateCustomerCartButton?.();
  if (isCustomerPage && id === 'qr-landing' &&
      window.matchMedia('(max-width: 600px)').matches) {
    target.classList.remove('mobile-entry');
    void target.offsetWidth;
    const clearMobileEntry = event => {
      if (event.animationName !== 'mobile-entry-fade') return;
      target.classList.remove('mobile-entry');
      target.removeEventListener('animationend', clearMobileEntry);
    };
    target.classList.add('mobile-entry');
    target.addEventListener('animationend', clearMobileEntry);
  }
  document.getElementById('crumb-group').textContent = cust ? 'Customer Journey' : (cashier ? 'Cashier Dashboard' : 'Admin Console');
  document.getElementById('crumb-screen').textContent = cust ? cust.label : (adm ? adm.label : (cashier ? cashier.label : id));

  // mark completed steps in customer flow
  if(cust){
    const idx = customerScreens.findIndex(s=>s.id===id);
    customerScreens.forEach((s,i)=>{
      const n = document.getElementById('nav-'+s.id);
      if(n){ if(i<idx) n.classList.add('done'); else n.classList.remove('done'); }
    });
  }
  if (id === 'order-management' && typeof renderLiveOrderManagementRow === 'function') {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('florea-cashier-orders') || '[]');
      if (savedOrders[0] && savedOrders[0].customerName) renderLiveOrderManagementRow(savedOrders[0]);
    } catch (error) {
      console.warn('Unable to refresh Order Management.', error);
    }
  }
  observeScreenReveals(target);
  if (restoreCatalogScroll) {
    window.scrollTo({ top: catalogScrollTop, behavior: 'auto' });
  } else {
    document.getElementById('stage').scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start'
    });
  }
}
function restoreInitialScreen() {
  const savedState = window.FloreaCustomerSession.read();
  if (requestedView === 'admin') {
    go('admin-login');
    return;
  }
  if (requestedView === 'cashier') {
    go('cashier-login');
    return;
  }

  const savedScreen = customerJourneyScreenIds.has(savedState.screen) ? savedState.screen : null;
  const requestedCustomerScreen = requestedView === 'customer' &&
    customerJourneyScreenIds.has(requestedScreen) ? requestedScreen : null;
  const trackedOrder = localStorage.getItem('florea-watched-order-id');
  const initialScreen = isPublicCustomerView
    ? savedScreen || requestedCustomerScreen || (trackedOrder ? 'sent-confirmation' : 'qr-landing')
    : 'qr-landing';

  if (CUSTOMER_CATALOG_ORDER.includes(savedState.homeCategory)) {
    setCategory(savedState.homeCategory);
  }
  if (initialScreen === 'catalog') {
    activeCatalogCategory = savedState.catalogCategory === favoritesCatalogCategory ||
      CUSTOMER_CATALOG_ORDER.includes(savedState.catalogCategory)
      ? savedState.catalogCategory
      : null;
    activeCatalogSearch = typeof savedState.catalogSearch === 'string' ? savedState.catalogSearch : '';
    const sortModes = ['Popular', 'Price: Low to High', 'Price: High to Low', 'Name: A to Z'];
    activeCatalogSortMode = sortModes.includes(savedState.catalogSortMode) ? savedState.catalogSortMode : 'Popular';
  }
  if (Number.isFinite(savedState.catalogScrollTop)) {
    catalogScrollTop = savedState.catalogScrollTop;
  }

  if (initialScreen === 'product-details' && savedState.selectedProduct) {
    const savedProduct = savedState.selectedProduct;
    const product = (PRODUCTS[savedProduct.category] || []).find(item => item.n === savedProduct.name);
    if (product && product.stock !== 'Sold Out') {
      window.selectedProduct = product;
      selectedProduct = {
        name: product.n,
        price: savedProduct.price ?? product.p,
        category: savedState.selectedProduct.category,
        ...(savedProduct.drinkCategory ? { drinkCategory: savedProduct.drinkCategory } : {})
      };
      selectedDrinkSize = ['Medium', 'Large'].includes(savedState.selectedDrinkSize)
        ? savedState.selectedDrinkSize
        : 'Medium';
      selectedDrinkTemperature = ['Hot', 'Iced'].includes(savedState.selectedDrinkTemperature)
        ? savedState.selectedDrinkTemperature
        : 'Iced';
      updateProductDetailsDisplay();
    } else {
      console.warn('Unable to restore the saved customer product selection.');
    }
  }

  go(initialScreen);
  if (savedState.fullMenuOpen && document.getElementById('customer-full-menu-dialog')) {
    openFeaturedMenu();
    const grid = document.getElementById('customer-full-menu-grid');
    if (grid && Number.isFinite(savedState.fullMenuScrollTop)) {
      grid.scrollTop = savedState.fullMenuScrollTop;
    }
  }
}
window.addEventListener('DOMContentLoaded', () => {
  initializeCashierLogin();
  restoreInitialScreen();
}, { once: true });
initAdminQrCode();

document.querySelectorAll('.device-toggle button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.device-toggle button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const stage = document.getElementById('stage');
    stage.classList.remove('tablet','desktop');
    const d = btn.dataset.device;
    if(d==='tablet') stage.classList.add('tablet');
    if(d==='desktop') stage.classList.add('desktop');
  });
});

// ============ PRODUCT SELECTION SYSTEM ============
let selectedProduct = null;
let selectedDrinkSize = 'Medium';
let selectedDrinkTemperature = 'Iced';

function persistSelectedCustomerProduct() {
    window.FloreaCustomerSession.update({
        selectedProduct: selectedProduct ? { ...selectedProduct } : null,
        selectedDrinkSize,
        selectedDrinkTemperature
    });
}

function getDrinkSizePrices(product, category) {
    const text = `${product.d || ''} ${product.p || ''}`;
    const usesLocalSizeNames = ['Refreshers', 'Frappe'].includes(category);
    const mediumPattern = usesLocalSizeNames ? /\bMedia\s*₱?\s*(\d+(?:\.\d+)?)/i : /\bM\s*₱?\s*(\d+(?:\.\d+)?)/i;
    const largePattern = usesLocalSizeNames ? /\bGrande\s*₱?\s*(\d+(?:\.\d+)?)/i : /\bL\s*₱?\s*(\d+(?:\.\d+)?)/i;
    const mediumMatch = text.match(mediumPattern);
    const largeMatch = text.match(largePattern);
    const hotMatch = text.match(/\bHot\s*₱?\s*(\d+(?:\.\d+)?)/i);
    const fallbackMatch = String(product.p || '').match(/₱?\s*(\d+(?:\.\d+)?)/);
    const mediumPrice = product.sizePrices?.Medium ??
        (mediumMatch ? Number(mediumMatch[1]) : (fallbackMatch ? Number(fallbackMatch[1]) : null));
    return {
        Medium: mediumPrice,
        Large: product.sizePrices?.Large ?? (largeMatch ? Number(largeMatch[1]) : null),
        Hot: hotMatch ? Number(hotMatch[1]) : null
    };
}

function addCatalogProductToCart(productName, category) {
    const product = (PRODUCTS[category] || []).find(item => item.n === productName);
    if (!product || getCustomerProductStock(product).outOfStock || typeof window.addToCart !== 'function') return;

    if (!DRINK_CATEGORIES.includes(category)) {
        window.addToCart(product.n, product.p, 1, {}, false);
        return;
    }

    const prices = getDrinkSizePrices(product, category);
    const drinkSize = Number.isFinite(prices.Medium) ? 'Medium' : 'Large';
    const price = prices[drinkSize];
    if (!Number.isFinite(price)) {
        console.error(`Unable to quick-add ${productName}: no valid medium or large price is configured.`);
        return;
    }
    window.addToCart(product.n, price, 1, {
        drinkCategory: category,
        drinkSize,
        ...(HOT_DRINK_CATEGORIES.includes(category) ? { drinkTemperature: 'Iced' } : {})
    }, false);
}

function renderCatalogQuickAddButton(product, category) {
    const supportsTemperature = HOT_DRINK_CATEGORIES.includes(category) &&
        getDrinkSizePrices(product, category).Hot !== null;
    const quickAddOptions = DRINK_CATEGORIES.includes(category)
        ? ` (${supportsTemperature ? 'Medium, Iced' : 'Medium'})`
        : '';
    const stock = getCustomerProductStock(product);
    const quickAddTitle = stock.outOfStock ? 'Out of stock' : (quickAddOptions ? `Quick add${quickAddOptions}` : 'Add to cart');
    const ariaLabel = stock.outOfStock
        ? `${product.n} is out of stock`
        : `Add ${product.n}${quickAddOptions} to cart`;
    return `<button class="customer-quick-add" type="button" data-quick-add data-product-name="${escapeCatalogText(product.n)}" data-product-category="${escapeCatalogText(category)}" aria-label="${escapeCatalogText(ariaLabel)}" title="${escapeCatalogText(quickAddTitle)}"${stock.outOfStock ? ' disabled' : ''}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 9H7"/><circle cx="10" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></svg>
    </button>`;
}

document.addEventListener('click', event => {
    const quickAddButton = event.target.closest('[data-quick-add]');
    if (!quickAddButton) return;
    event.preventDefault();
    event.stopPropagation();
    if (quickAddButton.disabled) return;
    addCatalogProductToCart(quickAddButton.dataset.productName, quickAddButton.dataset.productCategory);
}, true);

function formatProductPrice(price) {
    return `₱${Number(price).toLocaleString('en-PH')}`;
}

function renderDrinkOptions(product, category) {
    const container = document.getElementById('product-drink-options');
    const sizeOptions = document.getElementById('product-size-options');
    const temperatureGroup = document.getElementById('product-temperature-group');
    const temperatureOptions = document.getElementById('product-temperature-options');
    const isDrink = DRINK_CATEGORIES.includes(category);
    if (!container || !sizeOptions || !temperatureGroup || !temperatureOptions) return;

    container.hidden = !isDrink;
    if (!isDrink) {
        sizeOptions.innerHTML = '';
        temperatureOptions.innerHTML = '';
        sizeOptions.hidden = false;
        temperatureGroup.hidden = true;
        return;
    }

    const prices = getDrinkSizePrices(product, category);
    const supportsTemperature = HOT_DRINK_CATEGORIES.includes(category) && prices.Hot !== null;
    temperatureGroup.hidden = !supportsTemperature;
    temperatureOptions.innerHTML = supportsTemperature ? ['Hot', 'Iced'].map(temperature =>
        `<button type="button" class="chip${selectedDrinkTemperature === temperature ? ' active' : ''}" data-drink-temperature="${temperature}" aria-pressed="${selectedDrinkTemperature === temperature}">${temperature}</button>`
    ).join('') : '';

    if (supportsTemperature && selectedDrinkTemperature === 'Hot') selectedDrinkSize = 'Medium';
    const sizes = ['Medium', 'Large'].filter(size => prices[size] !== null);
    if (!sizes.includes(selectedDrinkSize)) selectedDrinkSize = sizes[0] || 'Medium';
    sizeOptions.hidden = supportsTemperature && selectedDrinkTemperature === 'Hot';
    const sizeLabels = ['Refreshers', 'Frappe'].includes(category)
        ? { Medium: 'Media', Large: 'Grande' }
        : { Medium: 'Medium', Large: 'Large' };
    sizeOptions.innerHTML = sizes.map(size =>
        `<button type="button" class="chip${selectedDrinkSize === size ? ' active' : ''}" data-drink-size="${size}" aria-pressed="${selectedDrinkSize === size}">${sizeLabels[size]} · ${formatProductPrice(prices[size])}</button>`
    ).join('');

    selectedProduct.price = supportsTemperature && selectedDrinkTemperature === 'Hot' && prices.Hot !== null
        ? prices.Hot
        : (prices[selectedDrinkSize] ?? prices.Medium);
    selectedProduct.drinkCategory = category;
    const priceEl = document.getElementById('product-price');
    if (priceEl) priceEl.textContent = formatProductPrice(selectedProduct.price);
}

function selectProduct(productOrCategory, priceOrIndex, category) {
  let product;
  let productCategory = category;

  if (typeof priceOrIndex === 'number' && category === undefined) {
    productCategory = productOrCategory;
    product = (PRODUCTS[productCategory] || [])[priceOrIndex];
  } else {
    const preferredCategory = (typeof category === 'string' && PRODUCTS[category])
      ? category
      : (typeof priceOrIndex === 'string' && PRODUCTS[priceOrIndex] ? priceOrIndex : null);
    product = preferredCategory
      ? (PRODUCTS[preferredCategory] || []).find(item => item.n === productOrCategory)
      : null;
    if (product) {
      productCategory = preferredCategory;
    } else {
      product = Object.values(PRODUCTS).flat().find(item => item.n === productOrCategory);
      productCategory = Object.keys(PRODUCTS).find(key =>
        PRODUCTS[key].some(item => item.n === productOrCategory)
      ) || category;
    }
  }

  if (!product || getCustomerProductStock(product).outOfStock) return;

  window.selectedProduct = product;
  selectedProduct = {
    name: product.n,
    price: product.p,
    category: productCategory
  };
    selectedDrinkSize = 'Medium';
    selectedDrinkTemperature = 'Iced';
    updateProductDetailsDisplay();
    persistSelectedCustomerProduct();
    go('product-details');
}

function updateProductDetailsDisplay() {
    if(!selectedProduct) return;
    
    const nameEl = document.getElementById('product-name');
    const categoryEl = document.getElementById('product-category');
    const priceEl = document.getElementById('product-price');
    const thumbEl = document.getElementById('product-thumb');
    const descriptionEl = document.getElementById('product-description');
    const stockEl = document.getElementById('product-stock-status');
    const addButton = document.getElementById('add-to-selection-btn');
    
    // Find the actual product data from PRODUCTS
    let actualProduct = null;
    for(let category in PRODUCTS) {
        const found = PRODUCTS[category].find(p => p.n === selectedProduct.name);
        if(found) {
            actualProduct = found;
            break;
        }
    }

    if(nameEl) nameEl.textContent = selectedProduct.name;
    if(categoryEl) categoryEl.textContent = selectedProduct.category;
    if(priceEl) priceEl.textContent = selectedProduct.price;
    if (stockEl && actualProduct) {
        const stock = getCustomerProductStock(actualProduct);
        stockEl.textContent = stock.label;
        stockEl.className = `badge ${stock.badgeClass} customer-product-stock-status`;
        stockEl.hidden = false;
        if (addButton) {
            addButton.disabled = stock.outOfStock;
            addButton.textContent = stock.outOfStock ? 'Out of Stock' : 'Add to Selection';
        }
    }
    if(actualProduct) renderDrinkOptions(actualProduct, selectedProduct.category);
    const ratingEl = document.getElementById('product-rating');
    if (ratingEl) ratingEl.innerHTML = renderRating(selectedProduct.name);
    updateProductFavoriteButton();
    if(thumbEl) {
        if(actualProduct) {
            const imageSrc = getProductImage(actualProduct, selectedProduct.category);
            if(imageSrc) {
                thumbEl.style.background = 'transparent';
                thumbEl.innerHTML = `<img src="${imageSrc}" alt="${escapeCatalogText(actualProduct.n)}" class="thumb-image" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:contain;display:block;" />`;
            } else {
                thumbEl.textContent = actualProduct.e;
            }
        }
    }
    if(descriptionEl && actualProduct) descriptionEl.textContent = actualProduct.d || 'Product description';
}

function getProductCustomizations() {
    if (selectedProduct && selectedProduct.drinkCategory) {
        return {
            drinkCategory: selectedProduct.drinkCategory,
            ...(HOT_DRINK_CATEGORIES.includes(selectedProduct.drinkCategory) && selectedDrinkTemperature === 'Hot'
                ? { drinkSize: 'Medium', drinkTemperature: 'Hot' }
                : { drinkSize: selectedDrinkSize, ...(HOT_DRINK_CATEGORIES.includes(selectedProduct.drinkCategory) ? { drinkTemperature: 'Iced' } : {}) })
        };
    }
    return {};
}

function getSelectedProductPrice() {
    return selectedProduct ? selectedProduct.price : 0;
}

document.getElementById('product-drink-options')?.addEventListener('click', event => {
    const sizeOption = event.target.closest('[data-drink-size]');
    const temperatureOption = event.target.closest('[data-drink-temperature]');
    if (!sizeOption && !temperatureOption) return;

    if (sizeOption) selectedDrinkSize = sizeOption.dataset.drinkSize;
    if (temperatureOption) selectedDrinkTemperature = temperatureOption.dataset.drinkTemperature;
    const product = (PRODUCTS[selectedProduct.category] || []).find(item => item.n === selectedProduct.name);
    if (product) {
        renderDrinkOptions(product, selectedProduct.category);
        persistSelectedCustomerProduct();
    }
});

document.getElementById('product-wrap-options')?.addEventListener('click', event => {
    const option = event.target.closest('[data-wrap-style]');
    if (!option) return;
    document.querySelectorAll('[data-wrap-style]').forEach(button => {
        const selected = button === option;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
    });
});

let activeCatalogSearch = '';
let activeCatalogCategory = null;
let activeCatalogSortMode = 'Popular';

function scrollCatalogToFirstProduct() {
    const grid = document.getElementById('catalog-grid');
    const firstItem = grid?.firstElementChild;
    if (!firstItem) return;

    const mobileNav = document.querySelector('#catalog .mobile-nav');
    const chips = document.getElementById('catalog-chips');
    const stickyBottom = chips
        ? chips.getBoundingClientRect().bottom
        : mobileNav?.getBoundingClientRect().bottom || 0;
    const top = Math.max(
        0,
        window.scrollY + firstItem.getBoundingClientRect().top - stickyBottom - 8
    );
    catalogScrollTop = top;
    window.FloreaCustomerSession.update({ catalogScrollTop });
    window.scrollTo({ top, behavior: 'smooth' });
}

function renderCatalogProducts(category = null, searchQuery = activeCatalogSearch) {
    const grid = document.getElementById('catalog-grid');
    const chips = document.getElementById('catalog-chips');
    if(!grid || !chips) return;
    
    const categories = CUSTOMER_CATALOG_ORDER;
    const selectedCategory = category === favoritesCatalogCategory
        ? favoritesCatalogCategory
        : (categories.includes(category) ? category : null);
    activeCatalogCategory = selectedCategory;
    activeCatalogSearch = searchQuery.trim();
    if (selectedCategory === favoritesCatalogCategory) loadCustomerFavorites();
    
    // Render category chips
    chips.innerHTML = `<button type="button" class="chip${selectedCategory ? '' : ' active'}" data-category="">All</button>` +
        `<button type="button" class="chip${selectedCategory === favoritesCatalogCategory ? ' active' : ''}" data-category="${favoritesCatalogCategory}" data-favorites-link>♡ Favorites</button>` +
        categories.map(cat =>
            `<button type="button" class="chip${selectedCategory === cat ? ' active' : ''}" data-category="${escapeCatalogText(cat)}">${escapeCatalogText(cat)}</button>`
        ).join('');
    updateFavoriteNavigationLabels();
    const catalogTitle = document.getElementById('catalog-title');
    if (catalogTitle) catalogTitle.textContent = selectedCategory === favoritesCatalogCategory ? 'My Favorites' : 'Product Catalog';
    document.querySelectorAll('.customer-menu-search input').forEach(input => { input.value = activeCatalogSearch; });
    
    const query = activeCatalogSearch.toLocaleLowerCase();
    const searchTerms = query.split(/\s+/).filter(Boolean);
    const catalogProducts = categories.flatMap(cat =>
        (PRODUCTS[cat] || []).map(product => ({ product, category: cat }))
    );
    let productsToShow = catalogProducts
        .filter(({ product, category: productCategory }) => {
            if (selectedCategory === favoritesCatalogCategory) {
                return customerFavorites.has(getFavoriteProductId(productCategory, product.n));
            }
            return !selectedCategory || productCategory === selectedCategory;
        })
        .filter(({ product, category: productCategory }) => {
            const searchableText = `${product.n} ${product.d || ''} ${productCategory}`.toLocaleLowerCase();
            return searchTerms.every(term => searchableText.includes(term));
        });
    const priceOf = product => Number((String(product.p).match(/\d+(?:\.\d+)?/) || ['0'])[0]);
    if (activeCatalogSortMode === 'Price: Low to High') {
        productsToShow.sort((a, b) => priceOf(a.product) - priceOf(b.product));
    } else if (activeCatalogSortMode === 'Price: High to Low') {
        productsToShow.sort((a, b) => priceOf(b.product) - priceOf(a.product));
    } else if (activeCatalogSortMode === 'Name: A to Z') {
        productsToShow.sort((a, b) => a.product.n.localeCompare(b.product.n));
    }

    const sortSelect = document.getElementById('catalog-sort');
    if (sortSelect) {
        sortSelect.value = activeCatalogSortMode;
        if (!sortSelect.dataset.changeBound) {
            sortSelect.addEventListener('change', () => setCatalogSortMode(sortSelect.value));
            sortSelect.dataset.changeBound = 'true';
        }
    }
    
    // Update count
    const countEl = document.getElementById('catalog-count');
    if(countEl) {
        countEl.textContent = query
            ? `${productsToShow.length} results for "${activeCatalogSearch}"`
            : selectedCategory === favoritesCatalogCategory
                ? `${productsToShow.length} saved favorite${productsToShow.length === 1 ? '' : 's'}`
                : `${productsToShow.length} Items`;
    }
    
    // Render products
    grid.innerHTML = productsToShow.length ? productsToShow.map(({ product, category: productCategory }) => {
        return `
            <div class="card customer-catalog-card" data-product-name="${escapeCatalogText(product.n)}" data-product-category="${escapeCatalogText(productCategory)}">
                ${renderProductThumb(product, '100%', productCategory, 'eager')}
                <p class="customer-catalog-card__name">${escapeCatalogText(product.n)}</p>
                <p class="customer-catalog-card__description">${escapeCatalogText(product.d || '')}</p>
                <div class="customer-catalog-card__footer">
                    <span class="customer-catalog-card__price">${escapeCatalogText(product.p)}</span>
                    ${renderCustomerStockBadge(product)}
                    ${renderCatalogQuickAddButton(product, productCategory)}
                </div>
                ${renderRating(product.n)}
            </div>
        `;
    }).join('') : `<div class="customer-menu-search-empty" role="status">
        <strong>${query
            ? `Walang nahanap para sa “${escapeCatalogText(activeCatalogSearch)}”`
            : selectedCategory === favoritesCatalogCategory ? 'No favorites yet' : 'Walang menu items sa category na ito'}</strong>
        <span>${query
            ? 'Subukan ang ibang pangalan o kategorya.'
            : selectedCategory === favoritesCatalogCategory ? 'Tap the heart on a product to save it here for your next order.' : 'Pumili ng ibang category para makita ang menu.'}</span>
    </div>`;
    if (!grid.dataset.productClickBound) {
        grid.addEventListener('click', event => {
            if (event.target.closest('[data-rating-value]')) return;
            const card = event.target.closest('[data-product-name]');
            if (card && grid.contains(card)) selectProduct(card.dataset.productName, card.dataset.productCategory === 'All' ? selectedCategory : card.dataset.productCategory);
        });
        grid.dataset.productClickBound = 'true';
    }
    window.FloreaCustomerSession.update({
        catalogCategory: activeCatalogCategory,
        catalogSearch: activeCatalogSearch,
        catalogSortMode: activeCatalogSortMode
    });
}

function openCatalog(category = null) {
    activeCatalogCategory = category === favoritesCatalogCategory || CUSTOMER_CATALOG_ORDER.includes(category)
        ? category
        : null;
    activeCatalogSearch = '';
    go('catalog');
}

function searchCustomerMenu(form) {
    const searchInput = form instanceof HTMLElement
        ? form.querySelector('input[type="search"]')
        : document.getElementById('customer-menu-search');
    const query = searchInput ? searchInput.value.trim() : '';
    activeCatalogCategory = null;
    activeCatalogSearch = query;
    if (document.getElementById('catalog')?.classList.contains('active')) {
        renderCatalogProducts(null, query);
        return;
    }
    go('catalog');
}

function setCatalogSortMode(mode) {
    const modes = ['Popular', 'Price: Low to High', 'Price: High to Low', 'Name: A to Z'];
    if (!modes.includes(mode)) return;
    activeCatalogSortMode = mode;
    renderCatalogProducts(activeCatalogCategory, activeCatalogSearch);
}

function renderBestSellerCards() {
    const grid = document.getElementById('customer-best-seller-grid');
    if (!grid) return;

    const catalogProducts = CUSTOMER_CATALOG_ORDER
        .flatMap(category => (PRODUCTS[category] || []).map((product, index) => ({ category, product, index })));
    const ratedProducts = catalogProducts
        .filter(({ product }) => (productRatings.get(product.n)?.count || 0) > 0)
        .sort((a, b) => {
            const ratingDifference = productRatings.get(b.product.n).average - productRatings.get(a.product.n).average;
            if (ratingDifference !== 0) return ratingDifference;
            const countDifference = productRatings.get(b.product.n).count - productRatings.get(a.product.n).count;
            return countDifference || CUSTOMER_CATALOG_ORDER.indexOf(a.category) - CUSTOMER_CATALOG_ORDER.indexOf(b.category) || a.index - b.index;
        });
    const defaultProducts = [
        ...catalogProducts.filter(({ category, product }) => category === 'Coffee' && product.n === 'Dalgona Coffee'),
        ...CUSTOMER_CATALOG_ORDER
        .filter(category => category !== 'Coffee')
        .flatMap(category => catalogProducts.filter(item =>
            item.category === category && item.product.n !== 'Strawberry Coffee'
        ).slice(0, 1))
    ];
    const selectedNames = new Set(ratedProducts.map(({ product }) => product.n));
    const bestSellers = [
        ...ratedProducts,
        ...defaultProducts.filter(({ product }) => !selectedNames.has(product.n)),
        ...catalogProducts.filter(({ product }) =>
            !selectedNames.has(product.n) && !defaultProducts.some(item => item.product.n === product.n)
        )
    ].slice(0, 9);

    grid.innerHTML = bestSellers.map(({ category, product, index }) =>
        `<div class="card customer-catalog-card" data-product-index="${index}" data-product-category="${escapeCatalogText(category)}">
            ${renderProductThumb(product, '100%', category)}
            <p class="customer-catalog-card__name">${escapeCatalogText(product.n)}</p>
            <p class="customer-catalog-card__description">${escapeCatalogText(product.d || '')}</p>
            <div class="customer-catalog-card__rating" data-featured-rating="${escapeCatalogText(product.n)}"></div>
            <div class="customer-catalog-card__footer">
                <span class="customer-catalog-card__price">${escapeCatalogText(product.p || '')}</span>
                ${renderCustomerStockBadge(product)}
                ${renderCatalogQuickAddButton(product, category)}
            </div>
        </div>`
    ).join('');

    if (!grid.dataset.bestSellerClickBound) {
        grid.addEventListener('click', event => {
            if (event.target.closest('button')) return;
            const card = event.target.closest('.customer-catalog-card[data-product-index][data-product-category]');
            if (!card || !grid.contains(card)) return;
            selectProduct(card.dataset.productCategory, Number(card.dataset.productIndex));
        });
        grid.dataset.bestSellerClickBound = 'true';
    }
}

window.FloreaProducts = PRODUCTS;
window.FloreaCategories = CATALOG_ORDER;
window.setCatalogSortMode = setCatalogSortMode;
window.refreshFloreaCatalog = () => {
    renderCatalogProducts(activeCatalogCategory, activeCatalogSearch);
    renderBestSellerCards();
    refreshCustomerStockIndicators();
    if (selectedProduct) updateProductDetailsDisplay();
};
renderBestSellerCards();
renderFeaturedRatings();
loadProductRatings();
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('storage', event => {
        if (event.key === 'florea-product-ratings') loadProductRatings(false);
    });
} else {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') loadProductRatings(false);
    });
    window.setInterval(() => {
        if (document.visibilityState === 'visible') loadProductRatings(false);
    }, 30000);
}