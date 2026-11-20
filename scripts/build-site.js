const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const publicFiles = [
    'florea-prototype.html',
    'cashier-dashboard.html',
    'florea-cashier.js',
    'florea-prototype.css',
    'florea-prototype.js',
    'florea-inventory-shared.mjs',
    'florea-orders.js',
    'florea-cashier-sound.js',
    'florea-push.js',
    'florea-install.js',
    'florea-ui-actions.js',
    'florea-existing-menu-qr.png',
    'service-worker.js',
    'site.webmanifest',
    'florea-app-icon.svg',
    'florea-logo.png',
    'florea-logo-192.png',
    'florea-logo-512.png'
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const file of publicFiles) {
    fs.copyFileSync(path.join(root, file), path.join(output, file));
}

// Make the public Render URL open the customer ordering storefront directly.
fs.copyFileSync(path.join(output, 'florea-prototype.html'), path.join(output, 'index.html'));

const prototypeHtml = fs.readFileSync(path.join(output, 'florea-prototype.html'), 'utf8');
const staffRouteHtml = prototypeHtml.replace('<head>', '<head>\n    <base href="/">');
if (staffRouteHtml === prototypeHtml) {
    throw new Error('Could not prepare standalone staff portal routes.');
}
for (const route of ['admin', 'cashier']) {
    const routeDirectory = path.join(output, route);
    fs.mkdirSync(routeDirectory, { recursive: true });
    fs.writeFileSync(path.join(routeDirectory, 'index.html'), staffRouteHtml);
}

fs.cpSync(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });

const serviceWorkerPath = path.join(output, 'service-worker.js');
const buildVersion = process.env.DEPLOY_ID || new Date().toISOString();
fs.appendFileSync(
    serviceWorkerPath,
    `\nself.__FLOREA_BUILD_VERSION__ = ${JSON.stringify(buildVersion)};\n`
);
