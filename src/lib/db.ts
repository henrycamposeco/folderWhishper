// ─── IndexedDB persistence via idb ───────────────────────────────────────────
import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "folderwhisper-db";
const DB_VERSION = 1;
const CHUNKS_STORE = "chunks";
const META_STORE = "metadata";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(CHUNKS_STORE)) {
                    const store = db.createObjectStore(CHUNKS_STORE, { keyPath: "id" });
                    store.createIndex("fileName", "metadata.fileName", { unique: false });
                }
                if (!db.objectStoreNames.contains(META_STORE)) {
                    db.createObjectStore(META_STORE, { keyPath: "key" });
                }
            },
        });
    }
    return dbPromise;
}

export interface StoredChunk {
    id: string;
    content: string;
    metadata: {
        fileName: string;
        fileType: string;
        chunkIndex: number;
        totalChunks: number;
        fileSize: number;
    };
    embedding: number[];
}

export async function saveChunks(chunks: StoredChunk[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(CHUNKS_STORE, "readwrite");
    await Promise.all([...chunks.map((c) => tx.store.put(c)), tx.done]);
}

export async function getAllChunks(): Promise<StoredChunk[]> {
    const db = await getDB();
    return db.getAll(CHUNKS_STORE);
}

export async function getChunksByFile(fileName: string): Promise<StoredChunk[]> {
    const db = await getDB();
    const index = db
        .transaction(CHUNKS_STORE, "readonly")
        .store.index("fileName");
    return index.getAll(fileName);
}

export async function deleteFileChunks(fileName: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction(CHUNKS_STORE, "readwrite");
    const index = tx.store.index("fileName");
    const keys = await index.getAllKeys(fileName);
    await Promise.all([...keys.map((k) => tx.store.delete(k)), tx.done]);
}

export async function clearAllChunks(): Promise<void> {
    const db = await getDB();
    await db.clear(CHUNKS_STORE);
}

export async function saveMeta(key: string, value: unknown): Promise<void> {
    const db = await getDB();
    await db.put(META_STORE, { key, value });
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
    const db = await getDB();
    const record = await db.get(META_STORE, key);
    return record?.value as T | undefined;
}

export async function getIndexedFileNames(): Promise<string[]> {
    const db = await getDB();
    const chunks = await db.getAll(CHUNKS_STORE);
    const names = new Set(chunks.map((c) => c.metadata.fileName));
    return Array.from(names);
}

export async function getStorageStats(): Promise<{
    totalChunks: number;
    fileCount: number;
    estimatedBytes: number;
}> {
    const db = await getDB();
    const chunks = await db.getAll(CHUNKS_STORE);
    const fileNames = new Set(chunks.map((c) => c.metadata.fileName));
    const estimatedBytes = chunks.reduce(
        (acc, c) => acc + c.content.length * 2 + (c.embedding?.length || 0) * 4,
        0
    );
    return {
        totalChunks: chunks.length,
        fileCount: fileNames.size,
        estimatedBytes,
    };
}
