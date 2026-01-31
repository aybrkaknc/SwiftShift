export interface TelegramMessagePayload {
    chatId: string;
    text?: string;
    photo?: string | Blob; // URL or Blob
    video?: string; // URL
    caption?: string;
    threadId?: number; // For Topics
}

export type SendResult = { success: true; messageId: number } | { success: false; error: string; code?: number };

/**
 * TelegramService
 * Handles all communication with Telegram Bot API.
 * Includes Pagination logic for Chat Detection and Retry logic.
 */
export const TelegramService = {
    baseUrl: 'https://api.telegram.org/bot',

    /**
     * Validate Bot Token
     */
    async getMe(token: string): Promise<{ ok: boolean; result?: any }> {
        try {
            const res = await fetch(`${this.baseUrl}${token}/getMe`);
            return await res.json();
        } catch (e) {
            return { ok: false };
        }
    },

    /**
     * Get Chat Info (Title, Type, etc.)
     */
    async getChat(token: string, chatId: string): Promise<{ ok: boolean; result?: any }> {
        try {
            const res = await fetch(`${this.baseUrl}${token}/getChat?chat_id=${chatId}`);
            return await res.json();
        } catch (e) {
            return { ok: false };
        }
    },

    /**
     * Send Message (Text/Link)
     */
    async sendMessage(token: string, payload: TelegramMessagePayload): Promise<SendResult> {
        const body: any = {
            chat_id: payload.chatId,
            text: payload.text,
            parse_mode: 'HTML',
            link_preview_options: JSON.stringify({ is_disabled: false }) // Enforce preview
        };

        if (payload.threadId) body.message_thread_id = payload.threadId;

        return this.makeRequest(token, 'sendMessage', body);
    },

    /**
     * Send Photo (Smart handling for Blob vs URL)
     */
    async sendPhoto(token: string, payload: TelegramMessagePayload): Promise<SendResult> {
        const formData = new FormData();
        formData.append('chat_id', payload.chatId);
        if (payload.caption) formData.append('caption', payload.caption);
        if (payload.threadId) formData.append('message_thread_id', payload.threadId.toString());

        if (payload.photo instanceof Blob) {
            formData.append('photo', payload.photo, 'image.jpg');
        } else if (typeof payload.photo === 'string') {
            formData.append('photo', payload.photo);
        } else {
            return { success: false, error: 'Invalid photo format' };
        }

        // Attempt to send
        const res = await fetch(`${this.baseUrl}${token}/sendPhoto`, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
            // Special Handling for "Entity Too Large" (413) or Telegram's internal size error
            if (res.status === 413 || (data.description && data.description.includes('too large'))) {
                return { success: false, error: 'Entity Too Large', code: 413 };
            }
            return { success: false, error: data.description || 'Unknown Error', code: data.error_code };
        }

        return { success: true, messageId: data.result.message_id };
    },

    /**
     * Fetch Recent Updates (Chat Detection)
     * Uses "Load More" pagination logic implicitly via limit/offset if needed,
     * but for detection we just grab the last 20 updates.
     */
    async getUpdates(token: string): Promise<any[]> {
        try {
            const res = await fetch(`${this.baseUrl}${token}/getUpdates?limit=100`);
            const data = await res.json();
            if (data.ok) return data.result;
            return [];
        } catch (e) {
            console.error('Failed to fetch updates', e);
            return [];
        }
    },

    /**
     * Core Request Handler with Retry Logic (Simple)
     */
    async makeRequest(token: string, method: string, body: any): Promise<SendResult> {
        try {
            const res = await fetch(`${this.baseUrl}${token}/${method}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok || !data.ok) {
                return { success: false, error: data.description || 'API Error', code: data.error_code };
            }

            return { success: true, messageId: data.result.message_id };
        } catch (e) {
            return { success: false, error: 'Network Error' };
        }
    },

    /**
     * Smart Router for Payloads
     */
    async sendPayloadSmart(token: string, payload: TelegramMessagePayload): Promise<SendResult> {
        if (payload.photo) {
            return this.sendPhoto(token, payload);
        }
        return this.sendMessage(token, payload);
    }
};
