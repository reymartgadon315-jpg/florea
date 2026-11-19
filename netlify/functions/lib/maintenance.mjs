export function maintenanceResponse() {
    if (process.env.API_MAINTENANCE_MODE !== 'true') return null;
    return new Response(JSON.stringify({
        error: 'The service is temporarily unavailable while data is being migrated.'
    }), {
        status: 503,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'retry-after': '300'
        }
    });
}
