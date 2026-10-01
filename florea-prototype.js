        // ============ REAL MENU DATA ============
        const PRODUCTS = {
            'Flowers': [{
                e: '🌹',
                n: 'Ecuadorian Roses (6pc)',
                d: '',
                p: '₱ 390',
                stock: 'In Stock'
            }, {
                e: '🌻',
                n: 'Sunflower Stem',
                d: '',
                p: '₱ 120',
                stock: 'In Stock'
            }, {
                e: '🌷',
                n: 'Dutch Tulip (single)',
                d: '',
                p: '₱ 85',
                stock: 'Low Stock'
            }, {
                e: '🌼',
                n: 'Daisy Mix Stem',
                d: '',
                p: '₱ 95',
                stock: 'In Stock'
            }, {
                e: '🪻',
                n: 'Lavender Bunch',
                d: '',
                p: '₱ 140',
                stock: 'Sold Out'
            }, {
                e: '🌸',
                n: 'Cherry Blossom Stem',
                d: '',
                p: '₱ 160',
                stock: 'In Stock'
            }, ],
            'Bouquets': [{
                e: '💐',
                n: 'Sweetheart Peony Bouquet',
                d: '12 peonies, eucalyptus, baby\'s breath',
                p: '₱ 980',
                stock: 'In Stock'
            }, {
                e: '💐',
                n: 'Tulip Garden Box',
                d: 'Mixed Dutch tulips in a box',
                p: '₱ 450',
                stock: 'In Stock'
            }, {
                e: '💐',
                n: 'Rose &amp; Baby\'s Breath Bunch',
                d: 'Classic hand-tied bunch',
                p: '₱ 620',
                stock: 'In Stock'
            }, ],
            'Coffee': [{
                e: '☕',
                n: 'Americano',
                d: 'Espresso + Water',
                p: 'M79 · L99 · Hot79',
                stock: 'In Stock'
            }, {
                e: '☕',
                n: 'Spanish Latte',
                d: 'Espresso + Milk + Condensed Milk',
                p: 'M129 · L139 · Hot129',
                stock: 'In Stock'
            }, {
                e: '☕',
                n: 'Caramel Macchiato',
                d: 'Espresso + Caramel Syrup + Milk + Cold Foam',
                p: 'M139 · L149 · Hot129',
                stock: 'In Stock'
            }, {
                e: '☕',
                n: 'Vietnamese Coffee',
                d: 'Espresso + Condensed Milk + Water',
                p: 'M109 · L119 · Hot109',
                stock: 'In Stock'
            }, {
                e: '☕',
                n: 'Vanilla Cinnamon Latte',
                d: 'Espresso + Vanilla + Cinnamon + Milk',
                p: 'M139 · L149 · Hot129',
                stock: 'In Stock'
            }, {
                e: '☕',
                n: 'Mocha Latte',
                d: 'Espresso + Chocolate + Milk',
                p: 'M139 · L149 · Hot139',
                stock: 'In Stock'
            }, {
                e: '☕',
                n: 'Dalgona Coffee',
                d: 'Whipped Foam Coffee + Milk + Sugar',
                p: 'M129 · L139 · Hot129',
                stock: 'In Stock'
            }, {
                e: '☕',
                n: 'Mojito Mint Cream Coffee',
                d: 'Espresso + Mojito + Mint (No Alcohol)',
                p: 'M149 · L169 · Hot159',
                stock: 'In Stock'
            }, {
                e: '☕',
                n: 'White Choco Latte',
                d: 'Espresso + White Choco + Milk',
                p: 'M149 · L169 · Hot159',
                stock: 'In Stock'
            }, {
                e: '☕',
                n: 'French Vanilla Latte',
                d: 'Espresso + French Vanilla + Milk',
                p: 'M149 · L169 · Hot159',
                stock: 'In Stock'
            }, ],
            'Matcha': [{
                e: '🍵',
                n: 'Matcha Latte',
                d: '',
                p: 'M129 · L139 · Hot129',
                stock: 'In Stock'
            }, {
                e: '🍵',
                n: 'Mango Matcha',
                d: '',
                p: 'M149 · L159 · Hot129',
                stock: 'In Stock'
            }, {
                e: '🍵',
                n: 'Caramel Matcha',
                d: '',
                p: 'M139 · L149 · Hot129',
                stock: 'In Stock'
            }, {
                e: '🍵',
                n: 'Choco Matcha',
                d: '',
                p: 'M139 · L149 · Hot129',
                stock: 'In Stock'
            }, {
                e: '🍵',
                n: 'Blueberry Matcha',
                d: '',
                p: 'M149 · L159 · Hot129',
                stock: 'In Stock'
            }, {
                e: '🍵',
                n: 'Strawberry Matcha',
                d: '',
                p: 'M149 · L159 · Hot129',
                stock: 'In Stock'
            }, {
                e: '🍵',
                n: 'Mint Matcha',
                d: '',
                p: 'M139 · L149 · Hot129',
                stock: 'In Stock'
            }, {
                e: '🍵',
                n: 'White Choco Matcha',
                d: '',
                p: 'M139 · L149 · Hot129',
                stock: 'In Stock'
            }, ],
            'Refreshers': [{
                e: '🥤',
                n: 'Soda Refresher — Lemon',
                d: 'Media 69 · Grande 79',
                p: '₱ 69',
                stock: 'In Stock'
            }, {
                e: '🥤',
                n: 'Soda Refresher — Strawberry',
                d: 'Media 69 · Grande 79',
                p: '₱ 69',
                stock: 'In Stock'
            }, {
                e: '🥤',
                n: 'Soda Refresher — Green Apple',
                d: 'Media 69 · Grande 79',
                p: '₱ 69',
                stock: 'In Stock'
            }, {
                e: '🥤',
                n: 'Soda Refresher — Mango',
                d: 'Media 69 · Grande 79',
                p: '₱ 69',
                stock: 'In Stock'
            }, {
                e: '🧋',
                n: 'Milk Based Latte — Mango',
                d: 'Media 79 · Grande 89',
                p: '₱ 79',
                stock: 'In Stock'
            }, {
                e: '🧋',
                n: 'Milk Based Latte — Blueberry',
                d: 'Media 79 · Grande 89',
                p: '₱ 79',
                stock: 'In Stock'
            }, {
                e: '🥤',
                n: 'Coke Float',
                d: '',
                p: '₱ 99',
                stock: 'In Stock'
            }, ],
            'Rice Meals': [{
                e: '🍖',
                n: 'Liempo Kare',
                d: 'Grilled pork liempo in kare sauce, rice',
                p: '₱ 179',
                stock: 'In Stock',
                badge: 'NEW'
            }, {
                e: '🍗',
                n: 'Honey Butter Chicken',
                d: 'Honey butter glazed chicken bowl',
                p: '₱ 159',
                stock: 'In Stock'
            }, {
                e: '🍚',
                n: 'Sizzling Breaded Liempo',
                d: 'Breaded liempo over sizzling rice',
                p: '₱ 169',
                stock: 'In Stock'
            }, {
                e: '🍜',
                n: 'Pancit Guisado',
                d: 'Sautéed noodles, mixed vegetables',
                p: '₱ 129',
                stock: 'In Stock',
                badge: 'NEW'
            }, {
                e: '🍛',
                n: 'Chicken in White Onion Creme',
                d: 'Served with rice and fresh veggies',
                p: '₱ 149',
                stock: 'In Stock',
                badge: 'NEW'
            }, {
                e: '🍤',
                n: 'Shrimp Fritter and Veggies',
                d: 'Crispy shrimp fritters with slaw',
                p: '₱ 169',
                stock: 'In Stock',
                badge: 'NEW'
            }, ],
            'Cakes & Pastries': [{
                e: '🍰',
                n: 'Lavender Basque Cake',
                d: 'Burnt Basque cheesecake, slice',
                p: '₱ 195',
                stock: 'In Stock'
            }, {
                e: '🧁',
                n: 'Rose Vanilla Cupcake',
                d: '',
                p: '₱ 85',
                stock: 'In Stock'
            }, ],
        };
        const CATALOG_ORDER = ['Flowers', 'Bouquets', 'Coffee', 'Matcha', 'Refreshers', 'Rice Meals', 'Cakes & Pastries'];
        let currentCategory = 'Coffee';
        window.selectedProduct = null;

        function renderCatalogChips() {
            const wrap = document.getElementById('catalog-chips');
            wrap.innerHTML = CATALOG_ORDER.map(cat =>
                `<span class="chip${cat===currentCategory?' active':''}" onclick="setCategory('${cat}')">${cat}</span>`
            ).join('');
        }

        function renderCatalogGrid() {
            const items = PRODUCTS[currentCategory] || [];
            document.getElementById('catalog-count').innerHTML = `${items.length} items in <b style="color:var(--ink);">${currentCategory}</b>`;
            document.getElementById('catalog-grid').innerHTML = items.map((it, index) => {
                        const soldOut = it.stock === 'Sold Out';
                        const badgeClass = it.stock === 'In Stock' ? 'badge-sage' : (it.stock === 'Low Stock' ? 'badge-gold' : 'badge-danger');
                        const newTag = it.badge ? `<span class="badge badge-blush" style="font-size:9px;padding:2px 7px;margin-left:6px;">${it.badge}</span>` : '';
                        return `<div class="card" style="${soldOut?'opacity:.55;':''}" onclick="${soldOut?'':`selectProduct('${currentCategory}', ${index})`}">
      <div class="thumb" style="height:96px;">${it.e}</div>
      <p style="font-size:12.5px;font-weight:700;margin-top:9px;">${it.n}${newTag}</p>
      ${it.d ? `<p style="font-size:10.5px;color:var(--ink-soft);margin-top:2px;">${it.d}</p>` : ''}
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
        <span style="font-weight:800;color:var(--blush-deep);font-size:12px;">${it.p}</span>
        <span class="badge ${badgeClass}" style="font-size:9.5px;padding:3px 8px;">${it.stock}</span>
      </div>
    </div>`;
  }).join('');
}
function setCategory(cat){
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
const adminScreens = [
  {id:'admin-login', label:'Admin Login'},
  {id:'admin-dashboard', label:'Dashboard'},
  {id:'order-management', label:'Order Management'},
  {id:'sales-automation', label:'Sales Automation'},
  {id:'inventory-control', label:'Inventory Control'},
  {id:'product-management', label:'Product Management'},
  {id:'analytics', label:'Business Analytics'},
  {id:'reports', label:'Reports'},
];
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

function isAuthenticated(role){
  try {
    return localStorage.getItem(AUTH_KEYS[role]) === 'true';
  } catch (e) {
    return false;
  }
}

function setAuthenticated(role, value){
  try {
    localStorage.setItem(AUTH_KEYS[role], value ? 'true' : 'false');
  } catch (e) {}
}

function updateCustomerGreeting(name) {
  const greeting = document.getElementById('customer-greeting');
  if (greeting) greeting.textContent = `Hi, ${name} 👋`;
}

function getExistingMenuUrl() {
  const localHosts = ['localhost', '127.0.0.1'];
  const localPorts = ['3000', '8000'];
  const isLocalDevelopment = localHosts.includes(window.location.hostname) || localPorts.includes(window.location.port);
  if (isLocalDevelopment) {
    return new URL('florea-prototype.html', window.location.href).href;
  }
  return new URL('/menu', window.location.origin).href;
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

  try {
    localStorage.setItem('florea-customer-name', name);
  } catch (error) {
    console.warn('Unable to save customer name.', error);
  }
  updateCustomerGreeting(name);
  go('menu-home');
}

function loginAdmin() {
  const field = document.getElementById('admin-password-input');
  const password = field ? field.value.trim() : '';
  if (password === 'admin123') {
    setAuthenticated('admin', true);
    go('admin-dashboard');
    return;
  }
  alert('Incorrect password. Please use admin123.');
}

function loginCashier() {
  const field = document.getElementById('cashier-password-input');
  const password = field ? field.value.trim() : '';
  if (password === 'cashier123') {
    setAuthenticated('cashier', true);
    go('cashier-dashboard');
    return;
  }
  alert('Incorrect password. Please use cashier123.');
}

function logoutAdmin() {
  setAuthenticated('admin', false);
}

function logoutCashier() {
  setAuthenticated('cashier', false);
}

function go(id){
  if (id === 'admin-dashboard' && !isAuthenticated('admin')) {
    id = 'admin-login';
  }
  if (id === 'cashier-dashboard' && !isAuthenticated('cashier')) {
    id = 'cashier-login';
  }

  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const target = document.getElementById(id);
  if (!target) return;
  target.classList.add('active');
  document.querySelectorAll('.rail-item, .rail-admin-item').forEach(s=>s.classList.remove('active'));
  const navEl = document.getElementById('nav-'+id);
  if(navEl) navEl.classList.add('active');

  const cust = customerScreens.find(s=>s.id===id);
  const adm = adminScreens.find(s=>s.id===id);
  const cashier = cashierScreens.find(s=>s.id===id);
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
  document.getElementById('stage').scrollIntoView({behavior:'smooth', block:'start'});
}
try {
  const savedCustomerName = localStorage.getItem('florea-customer-name');
  const nameField = document.getElementById('customer-name-input');
  if (savedCustomerName) {
    if (nameField) nameField.value = savedCustomerName;
    updateCustomerGreeting(savedCustomerName);
  }
} catch (error) {
  console.warn('Unable to load customer name.', error);
}
go('qr-landing');
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

function selectProduct(productOrCategory, priceOrIndex, category) {
  let product;
  let productCategory = category;

  if (typeof priceOrIndex === 'number' && category === undefined) {
    productCategory = productOrCategory;
    product = (PRODUCTS[productCategory] || [])[priceOrIndex];
  } else {
    product = Object.values(PRODUCTS).flat().find(item => item.n === productOrCategory);
    productCategory = Object.keys(PRODUCTS).find(key => PRODUCTS[key].some(item => item.n === productOrCategory)) || category;
  }

  if (!product || product.stock === 'Sold Out') return;

  window.selectedProduct = product;
  selectedProduct = {
    name: product.n,
    price: product.p,
    category: productCategory
  };
    updateProductDetailsDisplay();
    go('product-details');
}

function updateProductDetailsDisplay() {
    if(!selectedProduct) return;
    
    const nameEl = document.getElementById('product-name');
    const categoryEl = document.getElementById('product-category');
    const priceEl = document.getElementById('product-price');
    const thumbEl = document.getElementById('product-thumb');
    const descriptionEl = document.getElementById('product-description');
    
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
    if(thumbEl && actualProduct) thumbEl.textContent = actualProduct.e;
    if(descriptionEl && actualProduct) descriptionEl.textContent = actualProduct.d || 'Product description';
}

function renderCatalogProducts(category = null) {
    const grid = document.getElementById('catalog-grid');
    const chips = document.getElementById('catalog-chips');
    if(!grid || !chips) return;
    
    const   categories = Object.keys(PRODUCTS);
    
    // Render category chips
    chips.innerHTML = categories.map((cat, idx) => 
        `<span class="chip ${!category || category === cat ? 'active' : ''}" onclick="renderCatalogProducts('${cat}')">${cat}</span>`
    ).join('');
    
    // Get products for selected category
    const productsToShow = category ? PRODUCTS[category] : Object.values(PRODUCTS).flat();
    
    // Update count
    const countEl = document.getElementById('catalog-count');
    if(countEl) countEl.textContent = `${productsToShow.length} Items`;
    
    // Render products
    grid.innerHTML = productsToShow.map((product, idx) => `
        <div class="card" onclick="selectProduct('${product.n}', '${product.p}', '${category || 'All'}')">
            <div class="thumb" style="height:88px;">${product.e}</div>
            <p style="font-size:13px;font-weight:700;margin-top:9px;">${product.n}</p>
            <p style="font-size:11px;color:var(--ink-soft);margin-top:2px;">${product.d || ''}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
                <span style="font-weight:800;color:var(--blush-deep);font-size:13px;">${product.p}</span>
                <span class="star" style="font-size:11px;">★ 4.8</span>
            </div>
        </div>
    `).join('');
}

function openCatalog(category = null) {
    if(category) {
        renderCatalogProducts(category);
    } else {
        renderCatalogProducts();
    }
    go('catalog');
}