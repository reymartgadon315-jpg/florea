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
    'florea-accounting.mjs',
    'florea-orders.js',
    'florea-cashier-sound.js',
    'florea-push.js',
    'florea-install.js',
    'florea-ui-actions.js',
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
for (const route of ['admin', 'cashier', 'staff']) {
    const routeDirectory = path.join(output, route);
    fs.mkdirSync(routeDirectory, { recursive: true });
    fs.writeFileSync(path.join(routeDirectory, 'index.html'), staffRouteHtml);
}

fs.cpSync(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });

const assetLinksDirectory = path.join(output, '.well-known');
fs.mkdirSync(assetLinksDirectory, { recursive: true });
fs.writeFileSync(path.join(assetLinksDirectory, 'assetlinks.json'), JSON.stringify([
    {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
            namespace: 'android_app',
            package_name: 'com.florea.customer',
            sha256_cert_fingerprints: [
                '63:F6:5C:B6:2E:B0:0E:48:6B:4F:84:EC:9D:C3:9F:44:8C:B3:BF:6A:13:87:27:39:34:57:5F:D4:DF:2D:DF:4B'
            ]
        }
    }
], null, 2));

const serviceWorkerPath = path.join(output, 'service-worker.js');
const buildVersion = process.env.DEPLOY_ID || new Date().toISOString();
const serviceWorkerSource = fs.readFileSync(serviceWorkerPath, 'utf8');
fs.writeFileSync(
    serviceWorkerPath,
    `self.__FLOREA_BUILD_VERSION__ = ${JSON.stringify(buildVersion)};\n${serviceWorkerSource}`
);
