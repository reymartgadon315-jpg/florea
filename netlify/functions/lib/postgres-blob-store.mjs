import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';

const pageSize = 250;
let pool;
let schemaPromises = new WeakMap();

function getPool() {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL must be configured for PostgreSQL storage.');
    }
    if (!pool) {
        pool = new Pool({ connectionString: process.env.DATABASE_URL });
        pool.on('error', error => console.error('Unexpected PostgreSQL pool error.', error));
    }
    return pool;
}

async function ensureSchema(database = getPool()) {
    let schemaPromise = schemaPromises.get(database);
    if (!schemaPromise) {
        schemaPromise = database.query(`
            CREATE TABLE IF NOT EXISTS florea_blobs (
                store_name text NOT NULL,
                key text NOT NULL,
                data bytea NOT NULL,
                content_type text NOT NULL,
                metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
                etag uuid NOT NULL,
                updated_at timestamptz NOT NULL DEFAULT now(),
                PRIMARY KEY (store_name, key)
            )
        `).catch(error => {
            schemaPromises.delete(database);
            throw error;
        });
        schemaPromises.set(database, schemaPromise);
    }
    await schemaPromise;
    return database;
}

function bytesFrom(data) {
    if (typeof data === 'string') return Buffer.from(data);
    if (data instanceof Blob) return data.arrayBuffer().then(Buffer.from);
    if (data instanceof ArrayBuffer) return Buffer.from(data);
    if (ArrayBuffer.isView(data)) {
        return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    }
    throw new TypeError('PostgreSQL blob storage only accepts strings, buffers, ArrayBuffers, and Blobs.');
}

function decode(data, contentType, type) {
    const bytes = Buffer.from(data);
    if (type === 'json') return JSON.parse(bytes.toString('utf8'));
    if (type === 'text' || type === undefined) return bytes.toString('utf8');
    if (type === 'blob') return new Blob([bytes], { type: contentType });
    if (type === 'arrayBuffer') {
        return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    }
    if (type === 'stream') return new Blob([bytes], { type: contentType }).stream();
    throw new TypeError(`Unsupported PostgreSQL blob response type: ${type}`);
}

export class PostgresBlobStore {
    constructor(name, database = getPool()) {
        this.name = name;
        this.database = database;
    }

    async getWithMetadata(key, options = {}) {
        const database = await ensureSchema(this.database);
        const result = await database.query(
            'SELECT data, content_type, metadata, etag FROM florea_blobs WHERE store_name = $1 AND key = $2',
            [this.name, key]
        );
        const row = result.rows[0];
        if (!row) return null;
        return {
            data: decode(row.data, row.content_type, options.type),
            etag: row.etag,
            metadata: row.metadata || {}
        };
    }

    async get(key, options = {}) {
        const result = await this.getWithMetadata(key, options);
        return result ? result.data : null;
    }

    async getMetadata(key) {
        const result = await this.getWithMetadata(key);
        return result ? { etag: result.etag, metadata: result.metadata } : null;
    }

    async set(key, data, options = {}) {
        const bytes = await bytesFrom(data);
        const metadata = options.metadata || {};
        const contentType = data instanceof Blob
            ? data.type || metadata.contentType || 'application/octet-stream'
            : metadata.contentType || 'application/octet-stream';
        const etag = randomUUID();
        const database = await ensureSchema(this.database);
        let result;

        if (options.onlyIfNew) {
            result = await database.query(`
                INSERT INTO florea_blobs (store_name, key, data, content_type, metadata, etag)
                VALUES ($1, $2, $3, $4, $5::jsonb, $6)
                ON CONFLICT (store_name, key) DO NOTHING
                RETURNING etag
            `, [this.name, key, bytes, contentType, JSON.stringify(metadata), etag]);
        } else if (options.onlyIfMatch !== undefined) {
            result = await database.query(`
                UPDATE florea_blobs
                SET data = $3, content_type = $4, metadata = $5::jsonb, etag = $6, updated_at = now()
                WHERE store_name = $1 AND key = $2 AND etag = $7::uuid
                RETURNING etag
            `, [this.name, key, bytes, contentType, JSON.stringify(metadata), etag, options.onlyIfMatch]);
        } else {
            result = await database.query(`
                INSERT INTO florea_blobs (store_name, key, data, content_type, metadata, etag)
                VALUES ($1, $2, $3, $4, $5::jsonb, $6)
                ON CONFLICT (store_name, key) DO UPDATE
                SET data = EXCLUDED.data,
                    content_type = EXCLUDED.content_type,
                    metadata = EXCLUDED.metadata,
                    etag = EXCLUDED.etag,
                    updated_at = now()
                RETURNING etag
            `, [this.name, key, bytes, contentType, JSON.stringify(metadata), etag]);
        }

        return { modified: result.rows.length > 0, etag: result.rows[0]?.etag };
    }

    async setJSON(key, value, options = {}) {
        return this.set(key, JSON.stringify(value), {
            ...options,
            metadata: { ...options.metadata, contentType: 'application/json' }
        });
    }

    async delete(key) {
        const database = await ensureSchema(this.database);
        await database.query(
            'DELETE FROM florea_blobs WHERE store_name = $1 AND key = $2',
            [this.name, key]
        );
    }

    list(options = {}) {
        return options.paginate
            ? this.listPages(options.prefix || '')
            : this.listAll(options.prefix || '');
    }

    async *listPages(prefix) {
        const database = await ensureSchema(this.database);
        let lastKey = '';
        while (true) {
            const result = await database.query(`
                SELECT key, etag
                FROM florea_blobs
                WHERE store_name = $1
                  AND left(key, char_length($2)) = $2
                  AND key > $3
                ORDER BY key
                LIMIT $4
            `, [this.name, prefix, lastKey, pageSize]);
            if (!result.rows.length) return;
            yield {
                blobs: result.rows.map(row => ({ key: row.key, etag: row.etag })),
                directories: []
            };
            lastKey = result.rows[result.rows.length - 1].key;
        }
    }

    async listAll(prefix) {
        const database = await ensureSchema(this.database);
        const result = await database.query(`
            SELECT key, etag
            FROM florea_blobs
            WHERE store_name = $1
              AND left(key, char_length($2)) = $2
            ORDER BY key
        `, [this.name, prefix]);
        return { blobs: result.rows.map(row => ({ key: row.key, etag: row.etag })), directories: [] };
    }
}

export async function initializePostgresStorage() {
    await ensureSchema();
}

export async function closePostgresStorage() {
    if (pool) {
        await pool.end();
        pool = undefined;
        schemaPromises = new WeakMap();
    }
}

export function getPostgresStore(name) {
    return new PostgresBlobStore(name, getPool());
}
