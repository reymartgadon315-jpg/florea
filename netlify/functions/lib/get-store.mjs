import { getStore as getNetlifyStore } from '@netlify/blobs';
import { getPostgresStore } from './postgres-blob-store.mjs';

export function getStore(name, options) {
    if (process.env.STORAGE_PROVIDER === 'postgres') {
        return getPostgresStore(name, options);
    }
    return getNetlifyStore(name, options);
}
