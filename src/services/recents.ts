/**
 * RecentsService
 * Son gönderilen içerikleri yönetir.
 * IndexedDB kullanarak blob'ları ve metinleri saklar.
 */

import { openDB, IDBPDatabase } from 'idb';

/** IndexedDB veritabanı adı */
const DB_NAME = 'SwiftShiftRecents';
/** IndexedDB versiyonu */
const DB_VERSION = 1;
/** Object store adı */
const STORE_NAME = 'recents';
/** Maksimum saklanacak recent sayısı */
const MAX_RECENTS = 15;

/**
 * Son gönderim arayüzü
 */
export interface RecentSend {
    /** Benzersiz ID */
    id: string;
    /** İçerik tipi */
    type: 'text' | 'link' | 'image' | 'file' | 'audio' | 'location';
    /** İçerik (metin, URL veya blob referansı) */
    content: string;
    /** Önizleme (ilk 100 karakter veya thumbnail) */
    preview: string;
    /** Gönderildiği hedef adı */
    targetName: string;
    /** Hedef ID'si (resend için) */
    targetId: string;
    /** Thread/Topic ID'si (opsiyonel) */
    threadId?: number;
    /** Gönderim zamanı (Unix timestamp) */
    timestamp: number;
    /** Link metadata (opsiyonel) */
    metadata?: {
        title?: string;
        description?: string;
        image?: string;
        siteName?: string;
    };
}

/** Singleton DB instance */
let dbInstance: IDBPDatabase | null = null;

/**
 * IndexedDB bağlantısını açar veya mevcut olanı döndürür
 * @returns IDBPDatabase instance
 * @internal
 */
async function getDB(): Promise<IDBPDatabase> {
    if (dbInstance) return dbInstance;

    dbInstance = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        }
    });

    return dbInstance;
}

/**
 * Son gönderimler servisi
 * FIFO mantığı ile maksimum 15 kayıt saklar.
 */
export const RecentsService = {
    /**
     * Tüm son gönderilenleri getirir
     * @returns Timestamp'e göre sıralanmış RecentSend dizisi (en yeni ilk)
     * @example
     * const recents = await RecentsService.getAll();
     * console.log(recents[0].content);
     */
    async getAll(): Promise<RecentSend[]> {
        const db = await getDB();
        const all = await db.getAll(STORE_NAME);
        return all.sort((a, b) => b.timestamp - a.timestamp);
    },

    /**
     * Yeni gönderim ekler (FIFO - 15 limit)
     * @param item - Eklenecek gönderim (id ve timestamp otomatik oluşturulur)
     * @returns Oluşturulan RecentSend objesi
     * @example
     * const recent = await RecentsService.add({
     *   type: 'link',
     *   content: 'https://example.com',
     *   preview: 'Example Website',
     *   targetName: 'My Channel',
     *   targetId: '-1001234567890'
     * });
     */
    async add(item: Omit<RecentSend, 'id' | 'timestamp'>): Promise<RecentSend> {
        const db = await getDB();
        const newItem: RecentSend = {
            ...item,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
        };

        await db.put(STORE_NAME, newItem);

        // FIFO: 15'ten fazlaysa en eskiyi sil
        const all = await this.getAll();
        if (all.length > MAX_RECENTS) {
            const toDelete = all.slice(MAX_RECENTS);
            for (const old of toDelete) {
                await db.delete(STORE_NAME, old.id);
            }
        }

        return newItem;
    },

    /**
     * Tek bir gönderimi siler
     * @param id - Silinecek gönderimin ID'si
     * @returns Promise<void>
     */
    async delete(id: string): Promise<void> {
        const db = await getDB();
        await db.delete(STORE_NAME, id);
    },

    /**
     * Tüm gönderim geçmişini temizler
     * @returns Promise<void>
     */
    async clear(): Promise<void> {
        const db = await getDB();
        await db.clear(STORE_NAME);
    }
};
