/**
 * LogService
 * Uygulama logları ve hata kayıtlarını yönetir.
 * Chrome storage.local kullanarak logları saklar.
 */

/**
 * Log girişi arayüzü
 */
export interface LogEntry {
    /** Benzersiz log ID'si */
    id: string;
    /** Log oluşturma zamanı (Unix timestamp) */
    timestamp: number;
    /** Log tipi */
    type: 'error' | 'success' | 'info';
    /** Log mesajı */
    message: string;
    /** Opsiyonel detay bilgisi */
    details?: string;
    /** İlgili hedef adı (opsiyonel) */
    targetName?: string;
}

/**
 * Log yönetim servisi
 * FIFO mantığı ile maksimum 50 log saklar.
 */
export const LogService = {
    /** Maksimum log sayısı */
    MAX_LOGS: 50,

    /**
     * Yeni log girişi ekler
     * @param entry - Log girişi (id ve timestamp otomatik oluşturulur)
     * @returns Promise<void>
     * @example
     * await LogService.add({
     *   type: 'success',
     *   message: 'Message sent successfully',
     *   targetName: 'My Channel'
     * });
     */
    async add(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<void> {
        const { logs } = await chrome.storage.local.get('logs') as { logs: LogEntry[] };
        const currentLogs = logs || [];

        const newEntry: LogEntry = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            ...entry
        };

        const updatedLogs = [newEntry, ...currentLogs].slice(0, this.MAX_LOGS);
        await chrome.storage.local.set({ logs: updatedLogs });
    },

    /**
     * Tüm logları getirir
     * @returns Timestamp'e göre sıralanmış log dizisi (en yeni ilk)
     */
    async getAll(): Promise<LogEntry[]> {
        const { logs } = await chrome.storage.local.get('logs') as { logs: LogEntry[] };
        return logs || [];
    },

    /**
     * Tüm logları temizler
     * @returns Promise<void>
     */
    async clear(): Promise<void> {
        await chrome.storage.local.set({ logs: [] });
    }
};
