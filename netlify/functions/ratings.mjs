import { getStore } from '@netlify/blobs';

export const config = { path: '/api/ratings' };

function jsonResponse(statusCode, body) {
    return new Response(JSON.stringify(body), {
        status: statusCode,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store'
        }
    });
}

function isValidVisitorId(value) {
    return typeof value === 'string' &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function getRatingKey(productName, visitorId) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(productName));
    const productHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    return `rating:${productHash}:${visitorId}`;
}

async function collectRatings(store, visitorId) {
    const totals = new Map();
    for await (const page of store.list({ prefix: 'rating:', paginate: true })) {
        const votes = await Promise.all(
            page.blobs.map(({ key }) => store.get(key, { type: 'json' }))
        );
        votes.filter(vote =>
            vote &&
            typeof vote.productName === 'string' &&
            Number.isInteger(vote.rating) &&
            vote.rating >= 1 &&
            vote.rating <= 5
        ).forEach(vote => {
            const current = totals.get(vote.productName) || { total: 0, count: 0, myRating: 0 };
            current.total += vote.rating;
            current.count += 1;
            if (vote.visitorId === visitorId) current.myRating = vote.rating;
            totals.set(vote.productName, current);
        });
    }

    return Object.fromEntries(Array.from(totals, ([productName, rating]) => [
        productName,
        {
            average: Math.round((rating.total / rating.count) * 10) / 10,
            count: rating.count,
            myRating: rating.myRating
        }
    ]));
}

export default async function handler(request) {
    const store = getStore('florea-product-ratings', { consistency: 'strong' });

    if (request.method === 'GET') {
        const visitorId = new URL(request.url).searchParams.get('visitorId');
        if (!isValidVisitorId(visitorId)) {
            return jsonResponse(400, { error: 'A valid visitor ID is required.' });
        }
        return jsonResponse(200, { ratings: await collectRatings(store, visitorId) });
    }

    if (request.method !== 'POST') {
        return jsonResponse(405, { error: 'Method not allowed.' });
    }

    let payload;
    try {
        payload = await request.json();
    } catch {
        return jsonResponse(400, { error: 'Request body must be valid JSON.' });
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return jsonResponse(400, { error: 'Request body must be a JSON object.' });
    }

    const productName = typeof payload.productName === 'string' ? payload.productName.trim() : '';
    const { rating, visitorId } = payload;
    if (!productName || productName.length > 120 || !Number.isInteger(rating) ||
        rating < 1 || rating > 5 || !isValidVisitorId(visitorId)) {
        return jsonResponse(400, { error: 'A product name, a rating from 1 to 5, and a valid visitor ID are required.' });
    }

    const key = await getRatingKey(productName, visitorId);
    await store.setJSON(key, { productName, rating, visitorId, updatedAt: new Date().toISOString() });
    const ratings = await collectRatings(store, visitorId);
    return jsonResponse(200, { rating: ratings[productName] });
}
