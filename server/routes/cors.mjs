export function getApiCorsHeaders(origin, allowedOrigin) {
    const headers = { vary: 'Origin' };
    const allowed = Boolean(origin && allowedOrigin && origin === allowedOrigin);

    if (allowed) {
        headers['access-control-allow-origin'] = allowedOrigin;
        headers['access-control-allow-credentials'] = 'true';
    }

    return { allowed, headers };
}
