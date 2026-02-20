/**
 * ErrorService
 * Merkezi hata yönetimi servisi.
 * Uygulama genelinde tutarlı hata işleme ve loglama sağlar.
 * i18n: Hata mesajları için getTranslations() desteği eklenmiştir.
 */

import { LogService } from './logService';
import { getTranslations } from '../utils/i18nUtils';

/**
 * Uygulama hatası için özel sınıf
 * @extends Error
 */
export class AppError extends Error {
    /**
     * AppError oluşturur
     * @param message - Hata mesajı
     * @param code - Hata kodu (örn: 'TELEGRAM_API_ERROR', 'STORAGE_ERROR')
     * @param context - Ek bağlam bilgisi
     */
    constructor(
        message: string,
        public readonly code: string,
        public readonly context?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'AppError';
    }

    /**
     * JSON formatında serialize eder
     * @returns Serialize edilmiş hata objesi
     */
    toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context
        };
    }
}

/**
 * Hata kodları enum'u
 */
export const ErrorCodes = {
    // Telegram API hataları
    TELEGRAM_API_ERROR: 'TELEGRAM_API_ERROR',
    TELEGRAM_AUTH_ERROR: 'TELEGRAM_AUTH_ERROR',
    TELEGRAM_RATE_LIMIT: 'TELEGRAM_RATE_LIMIT',
    TELEGRAM_CHAT_NOT_FOUND: 'TELEGRAM_CHAT_NOT_FOUND',

    // Storage hataları
    STORAGE_READ_ERROR: 'STORAGE_READ_ERROR',
    STORAGE_WRITE_ERROR: 'STORAGE_WRITE_ERROR',

    // Network hataları
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',

    // Genel hatalar
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR'
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Merkezi hata yönetimi servisi
 */
export const ErrorService = {
    /**
     * Hatayı işler ve loglar
     * @param error - İşlenecek hata
     * @param context - Hatanın oluştuğu bağlam
     */
    async handle(error: unknown, context?: string): Promise<void> {
        const appError = this.normalize(error);
        await this.log(appError, context);
    },

    /**
     * Hatayı AppError formatına normalize eder
     * @param error - Normalize edilecek hata
     * @returns AppError instance
     */
    normalize(error: unknown): AppError {
        if (error instanceof AppError) {
            return error;
        }

        if (error instanceof Error) {
            return new AppError(
                error.message,
                ErrorCodes.UNKNOWN_ERROR,
                { originalError: error.name, stack: error.stack }
            );
        }

        return new AppError(
            String(error),
            ErrorCodes.UNKNOWN_ERROR
        );
    },

    /**
     * Hatayı LogService'e kaydeder
     * @param error - Loglanacak hata
     * @param context - Hatanın oluştuğu bağlam
     */
    async log(error: AppError, context?: string): Promise<void> {
        const message = context
            ? `[${context}] ${error.code}: ${error.message}`
            : `${error.code}: ${error.message}`;

        await LogService.add({
            type: 'error',
            message
        });
    },

    /**
     * Kullanıcıya bildirim gösterir
     * @param title - Bildirim başlığı
     * @param message - Bildirim mesajı
     */
    notify(title: string, message: string): void {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title,
            message
        });
    },

    /**
     * Telegram API hata kodunu çevirir
     * @param code - Telegram hata kodu
     * @param description - Telegram hata açıklaması
     * @returns Kullanıcı dostu hata mesajı (Locale'e uygun)
     */
    translateTelegramError(code: number, description: string): string {
        const t = getTranslations();

        switch (code) {
            case 400:
                if (description.includes('chat not found')) {
                    return t.telegramErrors.chatNotFound;
                }
                if (description.includes('message thread not found')) {
                    return t.telegramErrors.topicNotFound;
                }
                return t.telegramErrors.badRequest;
            case 401:
                return t.telegramErrors.invalidToken;
            case 403:
                return t.telegramErrors.blocked;
            case 429:
                return t.telegramErrors.rateLimit;
            default:
                // Bilinmeyen hatalarda description'ı olduğu gibi göster (çeviri yoksa)
                // veya generic hata mesajı + orjinal mesaj
                return description || t.telegramErrors.unknown;
        }
    }
};
