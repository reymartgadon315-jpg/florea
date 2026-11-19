import { Buffer } from 'node:buffer';

export function isTwilioSmsConfigured() {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
    return Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER);
}

export async function sendOrderStatusSms(phoneNumber, customerName, status) {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
    if (!isTwilioSmsConfigured()) {
        throw new Error('Twilio SMS is not configured.');
    }

    const isReady = status === 'ready';
    const message = isReady
        ? `${customerName}, OKAY NA PO ORDERS NIYO`
        : `${customerName}, PA WAIT LANG PO`;
    const body = new URLSearchParams({
        To: phoneNumber,
        From: TWILIO_FROM_NUMBER,
        Body: message
    });
    const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(TWILIO_ACCOUNT_SID)}/Messages.json`,
        {
            method: 'POST',
            headers: {
                authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
                'content-type': 'application/x-www-form-urlencoded'
            },
            body
        }
    );

    if (!response.ok) {
        throw new Error(`Twilio SMS request failed with status ${response.status}.`);
    }
}
