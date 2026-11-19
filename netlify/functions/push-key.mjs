import webPush from 'web-push';

export const config = { path: '/api/push-key' };

export default async function handler(request) {
    if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
            status: 405,
            headers: { 'content-type': 'application/json; charset=utf-8' }
        });
    }

    const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
    const missingVariables = [
        ['VAPID_PUBLIC_KEY', VAPID_PUBLIC_KEY],
        ['VAPID_PRIVATE_KEY', VAPID_PRIVATE_KEY],
        ['VAPID_SUBJECT', VAPID_SUBJECT]
    ].filter(([, value]) => !value).map(([name]) => name);
    if (missingVariables.length) {
        return new Response(JSON.stringify({
            error: 'Order notifications are not configured yet.',
            missingVariables
        }), {
            status: 503,
            headers: { 'content-type': 'application/json; charset=utf-8' }
        });
    }
    try {
        webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    } catch (error) {
        console.error('The configured VAPID keys are invalid.', error);
        return new Response(JSON.stringify({ error: 'Order notifications are misconfigured.' }), {
            status: 503,
            headers: { 'content-type': 'application/json; charset=utf-8' }
        });
    }
    return new Response(JSON.stringify({ publicKey: VAPID_PUBLIC_KEY }), {
        status: 200,
        headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store'
        }
    });
}
