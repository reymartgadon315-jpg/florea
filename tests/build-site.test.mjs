import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('build serves the customer storefront at the clean root URL', () => {
    const build = spawnSync(process.execPath, [path.join(root, 'scripts', 'build-site.js')], {
        cwd: root,
        encoding: 'utf8'
    });

    assert.equal(build.status, 0, build.stderr || build.stdout);
    const index = fs.readFileSync(path.join(root, 'dist', 'index.html'), 'utf8');
    const storefront = fs.readFileSync(path.join(root, 'dist', 'florea-prototype.html'), 'utf8');

    assert.equal(index, storefront);
    assert.match(index, /florea-orders\.js/);
    assert.match(index, /florea-prototype\.js/);

    for (const route of ['admin', 'cashier']) {
        const portal = fs.readFileSync(path.join(root, 'dist', route, 'index.html'), 'utf8');
        assert.match(portal, /<base href="\/">/);
        assert.match(portal, /florea-prototype\.css/);
        assert.match(portal, /florea-prototype\.js/);
    }
});
