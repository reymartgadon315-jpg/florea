import assert from 'node:assert/strict';
import test from 'node:test';
import { maintenanceResponse } from '../netlify/functions/lib/maintenance.mjs';

test('maintenance mode blocks API access while data is being migrated', async () => {
    const original = process.env.API_MAINTENANCE_MODE;
    process.env.API_MAINTENANCE_MODE = 'true';
    try {
        const response = maintenanceResponse();
        assert.equal(response.status, 503);
        assert.equal(response.headers.get('retry-after'), '300');
        assert.match((await response.json()).error, /data is being migrated/);
    } finally {
        if (original === undefined) delete process.env.API_MAINTENANCE_MODE;
        else process.env.API_MAINTENANCE_MODE = original;
    }
});
