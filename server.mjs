import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getApiHandler } from './server/routes/api-routes.mjs';
import { getApiCorsHeaders } from './server/routes/cors.mjs';
import {
    closePostgresStorage,
    initializePostgresStorage
} from './netlify/functions/lib/postgres-blob-store.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicRoot = path.join(root, 'dist');
const maxRequestBytes = 6 * 1024 * 1024;
const contentTypes = new Map([
    ['.css', 'text/css; charset=utf-8'],
    ['.html', 'text/html; charset=utf-8'],
    ['.ico', 'image/x-icon'],
    ['.jpg', 'image/jpeg'],
    ['.jpeg', 'image/jpeg'],
    ['.js', 'text/javascript; charset=utf-8'],
    ['.json', 'application/json; charset=utf-8'],
    ['.mjs', 'text/javascript; charset=utf-8'],
    ['.png', 'image/png'],
    ['.svg', 'image/svg+xml'],
    ['.webmanifest', 'application/manifest+json'],
    ['.webp', 'image/webp'],
    ['.woff2', 'font/woff2']
]);
const pathAliases = new Map([
    ['/menu', '/florea-prototype.html'],
    ['/menu/', '/florea-prototype.html']
]);

function jsonResponse(response, status, body, headers = {}) {
    response.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        ...headers
    });
    response.end(JSON.stringify(body));
}

async function toFetchRequest(incoming, url) {
    const headers = new Headers();
    for (const [name, value] of Object.entries(incoming.headers)) {
        if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
    }

    let body;
    if (incoming.method !== 'GET' && incoming.method !== 'HEAD') {
        const chunks = [];
        let length = 0;
        for await (const chunk of incoming) {
            length += chunk.length;
            if (length > maxRequestBytes) {
                const error = new Error('Request body is too large.');
                error.statusCode = 413;
                throw error;
            }
            chunks.push(chunk);
        }
        if (length) body = Buffer.concat(chunks, length);
    }

    return new Request(url, {
        method: incoming.method,
        headers,
        ...(body ? { body } : {})
    });
}

async function serveStatic(response, pathname, method) {
    let decodedPath;
    try {
        decodedPath = decodeURIComponent(pathname);
    } catch {
        response.writeHead(400);
        response.end('Invalid path.');
        return;
    }

    let filePath = path.resolve(publicRoot, `.${decodedPath}`);
    if (filePath !== publicRoot && !filePath.startsWith(`${publicRoot}${path.sep}`)) {
        response.writeHead(404);
        response.end('Not found.');
        return;
    }

    try {
        if ((await stat(filePath)).isDirectory()) filePath = path.join(filePath, 'index.html');
        const fileInfo = await stat(filePath);
        if (!fileInfo.isFile()) throw new Error('Not a file.');
        response.writeHead(200, {
            'content-type': contentTypes.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream',
            'content-length': fileInfo.size,
            'cache-control': ['.html', '.js', '.mjs', '.css'].includes(path.extname(filePath).toLowerCase())
                ? 'no-cache'
                : 'public, max-age=3600',
            'x-content-type-options': 'nosniff'
        });
        if (method === 'HEAD') {
            response.end();
            return;
        }
        const stream = createReadStream(filePath);
        stream.on('error', error => {
            console.error('Unable to stream static file.', error);
            if (response.headersSent) response.destroy(error);
            else {
                response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
                response.end('Unable to read the requested file.');
            }
        });
        stream.pipe(response);
    } catch {
        response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        response.end('Not found.');
    }
}

async function handleRequest(incoming, response) {
    const url = new URL(incoming.url, `http://${incoming.headers.host || 'localhost'}`);
    if (url.pathname === '/health' && incoming.method === 'GET') {
        if (process.env.STORAGE_PROVIDER === 'postgres') {
            await initializePostgresStorage();
        }
        response.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
        response.end('ok');
        return;
    }

    if (url.pathname.startsWith('/api/')) {
        const cors = getApiCorsHeaders(incoming.headers.origin, process.env.FRONTEND_ORIGIN);
        if (incoming.method === 'OPTIONS') {
            response.writeHead(cors.allowed ? 204 : 403, {
                ...cors.headers,
                ...(cors.allowed ? {
                    'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS',
                    'access-control-allow-headers': 'content-type',
                    'access-control-max-age': '600'
                } : {})
            });
            response.end();
            return;
        }

        if (process.env.API_MAINTENANCE_MODE === 'true') {
            jsonResponse(response, 503, {
                error: 'The service is temporarily unavailable while data is being migrated.'
            }, cors.headers);
            return;
        }

        const route = getApiHandler(url.pathname);
        if (!route) {
            jsonResponse(response, 404, { error: 'API route not found.' }, cors.headers);
            return;
        }
        const request = await toFetchRequest(incoming, url);
        const result = await route.handler(request, { params: route.params || {} });
        const headers = {};
        result.headers.forEach((value, name) => {
            headers[name] = value;
        });
        Object.assign(headers, cors.headers);
        response.writeHead(result.status, headers);
        response.end(result.body ? Buffer.from(await result.arrayBuffer()) : undefined);
        return;
    }

    if (['GET', 'HEAD'].includes(incoming.method) && pathAliases.has(url.pathname)) {
        response.writeHead(302, {
            location: pathAliases.get(url.pathname),
            'cache-control': 'no-store'
        });
        response.end();
        return;
    }

    if (incoming.method !== 'GET' && incoming.method !== 'HEAD') {
        response.writeHead(405, { allow: 'GET, HEAD' });
        response.end();
        return;
    }
    await serveStatic(response, url.pathname, incoming.method);
}

const server = createServer((request, response) => {
    handleRequest(request, response).catch(error => {
        console.error('Request failed.', error);
        if (response.headersSent) {
            response.destroy(error);
            return;
        }
        const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
        const headers = url.pathname.startsWith('/api/')
            ? getApiCorsHeaders(request.headers.origin, process.env.FRONTEND_ORIGIN).headers
            : {};
        jsonResponse(response, error.statusCode || 500, {
            error: error.statusCode === 413 ? error.message : 'The request could not be completed.'
        }, headers);
    });
});

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid TCP port.');
}

server.listen(port, '0.0.0.0', () => {
    console.log(`Floréa server listening on port ${port}.`);
});

process.once('SIGTERM', () => {
    server.close(async () => {
        await closePostgresStorage();
    });
});
