import { getStore as getNetlifyStore } from '@netlify/blobs';
import { Buffer } from 'node:buffer';
import {
    closePostgresStorage,
    getPostgresStore,
    initializePostgresStorage
} from '../netlify/functions/lib/postgres-blob-store.mjs';

const stores = [
    { name: 'florea-orders', type: 'json' },
    { name: 'florea-inventory', type: 'json' },
    { name: 'florea-order-notifications', type: 'json' },
    { name: 'florea-order-sms', type: 'json' },
    { name: 'florea-customer-feedback', type: 'json' },
    { name: 'florea-product-ratings', type: 'json' },
    { name: 'florea-product-images', type: 'image' }
];

function requiredEnvironment(name) {
    const value = process.env[name];
    if (!value) throw new Error(`${name} must be set in this terminal before migration.`);
    return value;
}

async function validateSource(siteId, token, sourceUrl) {
    let source;
    try {
        source = new URL(sourceUrl);
    } catch {
        throw new Error('NETLIFY_SOURCE_URL must be a valid HTTPS URL.');
    }
    if (source.protocol !== 'https:') {
        throw new Error('NETLIFY_SOURCE_URL must use HTTPS.');
    }

    const response = await fetch(`https://api.netlify.com/api/v1/sites/${encodeURIComponent(siteId)}`, {
        headers: { authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
        throw new Error(`Could not verify the Netlify site ID (HTTP ${response.status}).`);
    }
    const site = await response.json();
    const aliases = Array.isArray(site.domain_aliases) ? site.domain_aliases : [];
    const siteHosts = [site.url, site.ssl_url, ...aliases]
        .filter(Boolean)
        .map(value => {
            try {
                return new URL(value.includes('://') ? value : `https://${value}`).hostname.toLowerCase();
            } catch {
                return '';
            }
        });
    if (!siteHosts.includes(source.hostname.toLowerCase())) {
        throw new Error('The Netlify site ID does not match NETLIFY_SOURCE_URL; no data was copied.');
    }

    const apiResponse = await fetch(new URL('/api/orders', source));
    if (apiResponse.status !== 503) {
        throw new Error('The source Netlify API is not in maintenance mode; no data was copied.');
    }
    const maintenance = await apiResponse.json().catch(() => null);
    if (!maintenance?.error?.includes('data is being migrated')) {
        throw new Error('The source Netlify API did not confirm maintenance mode; no data was copied.');
    }
}

async function migrateStore(siteId, token, storeDefinition) {
    const source = getNetlifyStore({
        name: storeDefinition.name,
        siteID: siteId,
        token,
        consistency: 'strong'
    });
    const destination = getPostgresStore(storeDefinition.name);
    let copied = 0;
    let bytesCopied = 0;

    for await (const page of source.list({ paginate: true })) {
        for (const { key } of page.blobs) {
            if (storeDefinition.type === 'image') {
                const image = await source.getWithMetadata(key, { type: 'arrayBuffer' });
                if (!image || typeof image.metadata?.contentType !== 'string') {
                    throw new Error(`Could not read image metadata from ${storeDefinition.name}/${key}.`);
                }
                const data = new Blob([image.data], { type: image.metadata.contentType });
                await destination.set(key, data, { metadata: image.metadata });
                const copiedImage = await destination.getWithMetadata(key, { type: 'arrayBuffer' });
                if (!copiedImage ||
                    !Buffer.from(copiedImage.data).equals(Buffer.from(image.data)) ||
                    copiedImage.metadata?.contentType !== image.metadata.contentType) {
                    throw new Error(`Verification failed for ${storeDefinition.name}/${key}.`);
                }
                bytesCopied += data.size;
            } else {
                const entry = await source.getWithMetadata(key, { type: 'json' });
                if (!entry) throw new Error(`Could not read ${storeDefinition.name}/${key}.`);
                await destination.setJSON(key, entry.data, { metadata: entry.metadata });
                const copiedEntry = await destination.get(key, { type: 'json' });
                if (JSON.stringify(copiedEntry) !== JSON.stringify(entry.data)) {
                    throw new Error(`Verification failed for ${storeDefinition.name}/${key}.`);
                }
                bytesCopied += Buffer.byteLength(JSON.stringify(entry.data));
            }
            copied += 1;
        }
    }

    return { name: storeDefinition.name, copied, bytesCopied };
}

async function migrate() {
    const siteId = requiredEnvironment('NETLIFY_SITE_ID');
    const token = requiredEnvironment('NETLIFY_AUTH_TOKEN');
    const sourceUrl = requiredEnvironment('NETLIFY_SOURCE_URL');
    requiredEnvironment('DATABASE_URL');
    if (process.env.CONFIRM_NETLIFY_READ_ONLY !== 'YES') {
        throw new Error('Set CONFIRM_NETLIFY_READ_ONLY=YES only after pausing writes on the source Netlify site.');
    }

    await validateSource(siteId, token, sourceUrl);
    await initializePostgresStorage();
    console.log(`Copying data from the verified Netlify site ${new URL(sourceUrl).hostname} to PostgreSQL.`);
    for (const store of stores) {
        const result = await migrateStore(siteId, token, store);
        console.log(`${result.name}: ${result.copied} records, ${result.bytesCopied} bytes.`);
    }
    console.log('Migration finished. The Netlify source was not modified.');
}

try {
    await migrate();
} catch (error) {
    console.error(`Data migration failed: ${error.message}`);
    process.exitCode = 1;
} finally {
    await closePostgresStorage();
}
