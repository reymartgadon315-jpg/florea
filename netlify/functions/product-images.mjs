import { randomUUID } from 'node:crypto';
import { getStore } from './lib/get-store.mjs';
import { verifyAdminSession } from './lib/admin-session.mjs';
import { maintenanceResponse } from './lib/maintenance.mjs';

export const config = { path: '/api/product-images/:key' };

export const maxProductImageBytes = 5 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

function jsonResponse(statusCode, body, headers = {}) {
    return new Response(JSON.stringify(body), {
        status: statusCode,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
            'x-content-type-options': 'nosniff',
            ...headers
        }
    });
}

function getImageType(bytes) {
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        return 'image/jpeg';
    }
    if (bytes.length >= 8 &&
        bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
        bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
        return 'image/png';
    }
    if (bytes.length >= 12 &&
        String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
        String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') {
        return 'image/webp';
    }
    return '';
}

function imageKeyFromRequest(request) {
    let segments;
    try {
        segments = new URL(request.url).pathname.split('/').filter(Boolean);
    } catch {
        return '';
    }
    if (segments.length !== 3 || segments[0] !== 'api' || segments[1] !== 'product-images') return '';
    try {
        return decodeURIComponent(segments[2]);
    } catch {
        return '';
    }
}

function validImageKey(key) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key);
}

export function getProductImageStore() {
    return getStore('florea-product-images', { consistency: 'strong' });
}

export async function handleProductImageRequest(request, store, env = process.env) {
    if (request.method === 'POST') {
        if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET || env.ADMIN_SESSION_SECRET.length < 32) {
            return jsonResponse(503, { error: 'Admin image uploads are not configured on the server.' });
        }
        if (!verifyAdminSession(request, env.ADMIN_SESSION_SECRET)) {
            return jsonResponse(401, { error: 'Admin sign-in is required to upload product images.' });
        }
        if (!allowedTypes.has(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase())) {
            return jsonResponse(415, { error: 'Choose a JPG, PNG, or WEBP image.' });
        }
        const declaredLength = Number(request.headers.get('content-length'));
        if (Number.isFinite(declaredLength) && declaredLength > maxProductImageBytes) {
            return jsonResponse(413, { error: 'Image must be 5 MB or smaller.' });
        }

        const bytes = new Uint8Array(await request.arrayBuffer());
        if (bytes.byteLength === 0) return jsonResponse(400, { error: 'The selected image is empty.' });
        if (bytes.byteLength > maxProductImageBytes) {
            return jsonResponse(413, { error: 'Image must be 5 MB or smaller.' });
        }

        const imageType = getImageType(bytes);
        if (!imageType || imageType !== request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()) {
            return jsonResponse(415, { error: 'The file contents do not match a supported JPG, PNG, or WEBP image.' });
        }

        const key = randomUUID();
        await store.set(key, new Blob([bytes], { type: imageType }), {
            metadata: { contentType: imageType }
        });
        return jsonResponse(201, {
            url: `/api/product-images/${key}`,
            contentType: imageType,
            size: bytes.byteLength
        });
    }

    if (request.method === 'GET') {
        const key = imageKeyFromRequest(request);
        if (!validImageKey(key)) return jsonResponse(404, { error: 'Image not found.' });
        const image = await store.getWithMetadata(key, { type: 'blob' });
        if (!image) return jsonResponse(404, { error: 'Image not found.' });
        const contentType = image.metadata?.contentType;
        if (!allowedTypes.has(contentType)) return jsonResponse(500, { error: 'Stored image metadata is invalid.' });
        return new Response(image.data, {
            status: 200,
            headers: {
                'content-type': contentType,
                'cache-control': 'public, max-age=31536000, immutable',
                'x-content-type-options': 'nosniff',
                'etag': image.etag
            }
        });
    }

    return jsonResponse(405, { error: 'Method not allowed.' }, { allow: 'GET, POST' });
}

export default async function handler(request) {
    const maintenance = maintenanceResponse();
    if (maintenance) return maintenance;
    return handleProductImageRequest(request, getProductImageStore());
}
