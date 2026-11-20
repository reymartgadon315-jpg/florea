import test from 'node:test';
import assert from 'node:assert/strict';
import { getApiCorsHeaders } from '../server/routes/cors.mjs';

test('allows credentialed API calls only from the configured frontend origin', () => {
    const result = getApiCorsHeaders(
        'https://florea.onrender.com',
        'https://florea.onrender.com'
    );

    assert.equal(result.allowed, true);
    assert.equal(result.headers['access-control-allow-origin'], 'https://florea.onrender.com');
    assert.equal(result.headers['access-control-allow-credentials'], 'true');
    assert.equal(result.headers.vary, 'Origin');
});

test('does not allow a different or missing frontend origin', () => {
    for (const origin of ['https://untrusted.example', undefined]) {
        const result = getApiCorsHeaders(origin, 'https://florea.onrender.com');
        assert.equal(result.allowed, false);
        assert.equal(result.headers['access-control-allow-origin'], undefined);
    }
});
