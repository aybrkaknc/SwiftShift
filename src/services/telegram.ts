export interface TelegramMessagePayload {
    chatId: string;
    text?: string;
    photo?: string | Blob; // URL or Blob
    document?: string | Blob; // URL or Blob
    animation?: string | Blob; // URL or Blob
    audio?: string | Blob; // URL or Blob
    video?: string; // URL
    latitude?: number;
    longitude?: number;
    caption?: string;
    threadId?: number; // For Topics
    filename?: string; // Custom filename for file uploads
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
     * Helper to get extension from Blob MIME type
     */
    getExtensionFromBlob(blob: Blob): string {
        const type = blob.type;
        if (type.includes('svg')) return 'svg';
        if (type.includes('png')) return 'png';
        if (type.includes('jpeg') || type.includes('jpg')) return 'jpg';
        if (type.includes('gif')) return 'gif';
        if (type.includes('webp')) return 'webp';
        if (type.includes('mpeg') || type.includes('mp3')) return 'mp3';
        if (type.includes('ogg')) return 'ogg';
        if (type.includes('wav')) return 'wav';
        return 'file';
    },

    /**
     * Validate Bot Token
     */
    async getMe(token: string): Promise<{ ok: boolean; result?: any; description?: string }> {
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
    async getChat(token: string, chatId: string): Promise<{ ok: boolean; result?: any; description?: string }> {
        try {
            const res = await fetch(`${this.baseUrl}${token}/getChat?chat_id=${chatId}`);
            return await res.json();
        } catch (e) {
            return { ok: false };
        }
    },

    /**
     * Send Message (Text/Link) - Handles Chunking for long text (> 4096 chars)
     */
    async sendMessage(token: string, payload: TelegramMessagePayload): Promise<SendResult> {
        if (!payload.text) return { success: false, error: 'Empty text' };

        const MAX_LIMIT = 4096;
        if (payload.text.length <= MAX_LIMIT) {
            const body: any = {
                chat_id: payload.chatId,
                text: payload.text,
                parse_mode: 'HTML',
                link_preview_options: JSON.stringify({ is_disabled: false })
            };
            if (payload.threadId && payload.threadId !== 1) body.message_thread_id = payload.threadId;
            return this.makeRequest(token, 'sendMessage', body);
        }

        // Chunking logic
        const chunks: string[] = [];
        let str = payload.text;
        while (str.length > 0) {
            chunks.push(str.slice(0, MAX_LIMIT));
            str = str.slice(MAX_LIMIT);
        }

        let lastResult: SendResult = { success: false, error: 'Unknown' };
        for (let i = 0; i < chunks.length; i++) {
            const body: any = {
                chat_id: payload.chatId,
                text: chunks[i],
                parse_mode: 'HTML',
                link_preview_options: JSON.stringify({ is_disabled: i === 0 ? false : true }) // Only first chunk shows preview
            };
            if (payload.threadId && payload.threadId !== 1) body.message_thread_id = payload.threadId;

            lastResult = await this.makeRequest(token, 'sendMessage', body);
            if (!lastResult.success) break; // Error in one chunk, stop
        }

        return lastResult;
    },

    /**
     * Send Photo (Smart handling for Blob vs URL)
     */
    async sendPhoto(token: string, payload: TelegramMessagePayload): Promise<SendResult> {
        const formData = new FormData();
        formData.append('chat_id', payload.chatId);
        if (payload.caption) formData.append('caption', payload.caption);
        if (payload.threadId && payload.threadId !== 1) formData.append('message_thread_id', payload.threadId.toString());

        let photo = payload.photo;

        // Auto-convert Data-URI to Blob
        if (typeof photo === 'string' && photo.startsWith('data:')) {
            try {
                const response = await fetch(photo);
                photo = await response.blob();
            } catch (e) {
                return { success: false, error: 'Data-URI işlenirken hata oluştu' };
            }
        }

        if (photo instanceof Blob) {
            const ext = this.getExtensionFromBlob(photo);
            formData.append('photo', photo, `image.${ext}`);
        } else if (typeof photo === 'string') {
            formData.append('photo', photo);
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
            return { success: false, error: this.translateError(data.description || 'Unknown Error'), code: data.error_code };
        }

        return { success: true, messageId: data.result.message_id };
    },

    /**
     * Send Document (Original Quality - No Compression)
     */
    async sendDocument(token: string, payload: TelegramMessagePayload): Promise<SendResult> {
        const formData = new FormData();
        formData.append('chat_id', payload.chatId);
        if (payload.caption) formData.append('caption', payload.caption);
        if (payload.threadId && payload.threadId !== 1) formData.append('message_thread_id', payload.threadId.toString());

        let document = payload.document;

        // Auto-convert Data-URI to Blob
        if (typeof document === 'string' && document.startsWith('data:')) {
            try {
                const response = await fetch(document);
                document = await response.blob();
            } catch (e) {
                return { success: false, error: 'Data-URI işlenirken hata oluştu' };
            }
        }

        if (document instanceof Blob) {
            const ext = this.getExtensionFromBlob(document);
            const fileName = payload.filename || `file.${ext}`;
            formData.append('document', document, fileName);
        } else if (typeof document === 'string') {
            formData.append('document', document);
        } else {
            return { success: false, error: 'Invalid document format' };
        }

        const res = await fetch(`${this.baseUrl}${token}/sendDocument`, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
            return { success: false, error: this.translateError(data.description || 'Unknown Error'), code: data.error_code };
        }

        return { success: true, messageId: data.result.message_id };
    },

    /**
     * Send Animation (GIFs)
     */
    async sendAnimation(token: string, payload: TelegramMessagePayload): Promise<SendResult> {
        const formData = new FormData();
        formData.append('chat_id', payload.chatId);
        if (payload.caption) formData.append('caption', payload.caption);
        if (payload.threadId && payload.threadId !== 1) formData.append('message_thread_id', payload.threadId.toString());

        let animation = payload.animation || payload.photo;

        if (typeof animation === 'string' && animation.startsWith('data:')) {
            try {
                const response = await fetch(animation);
                animation = await response.blob();
            } catch (e) {
                return { success: false, error: 'Data-URI işlenirken hata oluştu' };
            }
        }

        if (animation instanceof Blob) {
            const ext = this.getExtensionFromBlob(animation);
            formData.append('animation', animation, `animation.${ext}`);
        } else if (typeof animation === 'string') {
            formData.append('animation', animation);
        } else {
            return { success: false, error: 'Invalid animation format' };
        }

        const res = await fetch(`${this.baseUrl}${token}/sendAnimation`, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
            return { success: false, error: this.translateError(data.description || 'Unknown Error'), code: data.error_code };
        }

        return { success: true, messageId: data.result.message_id };
    },

    /**
     * Send Audio
     */
    async sendAudio(token: string, payload: TelegramMessagePayload): Promise<SendResult> {
        const formData = new FormData();
        formData.append('chat_id', payload.chatId);
        if (payload.caption) formData.append('caption', payload.caption);
        if (payload.threadId && payload.threadId !== 1) formData.append('message_thread_id', payload.threadId.toString());

        let audio = payload.audio;

        if (typeof audio === 'string' && audio.startsWith('data:')) {
            try {
                const response = await fetch(audio);
                audio = await response.blob();
            } catch (e) {
                return { success: false, error: 'Data-URI işlenirken hata oluştu' };
            }
        }

        if (audio instanceof Blob) {
            const ext = this.getExtensionFromBlob(audio);
            formData.append('audio', audio, `audio.${ext}`);
        } else if (typeof audio === 'string') {
            formData.append('audio', audio);
        } else {
            return { success: false, error: 'Invalid audio format' };
        }

        const res = await fetch(`${this.baseUrl}${token}/sendAudio`, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        if (!res.ok || !data.ok) {
            return { success: false, error: this.translateError(data.description || 'Unknown Error'), code: data.error_code };
        }

        return { success: true, messageId: data.result.message_id };
    },

    /**
     * Send Location
     */
    async sendLocation(token: string, payload: TelegramMessagePayload): Promise<SendResult> {
        if (payload.latitude === undefined || payload.longitude === undefined) {
            return { success: false, error: 'Coordinates missing' };
        }

        const body: any = {
            chat_id: payload.chatId,
            latitude: payload.latitude,
            longitude: payload.longitude
        };
        if (payload.threadId && payload.threadId !== 1) body.message_thread_id = payload.threadId;

        return this.makeRequest(token, 'sendLocation', body);
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
                const errorMessage = this.translateError(data.description || 'API Error');
                return { success: false, error: errorMessage, code: data.error_code };
            }

            return { success: true, messageId: data.result.message_id };
        } catch (e) {
            return { success: false, error: 'Network Error' };
        }
    },

    /**
     * Detect User Chat ID from Updates
     * Scans recent updates to find a message from a user (private chat)
     */
    async detectUserChatId(token: string): Promise<string | null> {
        try {
            const updates = await this.getUpdates(token);
            // Find the first message from a private chat
            const messageUpdate = updates.find((u: any) =>
                u.message && u.message.chat && u.message.chat.type === 'private'
            );

            if (messageUpdate) {
                return messageUpdate.message.chat.id.toString();
            }
            return null;
        } catch (error) {
            console.error('Error detecting chat ID:', error);
            return null;
        }
    },

    /**
     * Translate Cryptic Telegram Errors to Actionable Messages
     */
    translateError(desc: string): string {
        const d = desc.toLowerCase();

        if (d.includes('chat not found')) {
            return 'Sohbet bulunamadı. ID yanlış olabilir veya Botu henüz gruba/kanala eklememiş olabilirsiniz.';
        }
        if (d.includes('bot is not a member')) {
            return 'Bot bu grubun/kanalın üyesi değil. Lütfen önce Botu Telegram\'dan ekleyin.';
        }
        if (d.includes('bot was blocked')) {
            return 'Bot kullanıcı tarafından engellenmiş. Bot mesaj gönderemez.';
        }
        if (d.includes('bot was kicked')) {
            return 'Bot gruptan atılmış. Tekrar eklemeniz gerekiyor.';
        }
        if (d.includes('not enough rights')) {
            return 'Botun mesaj gönderme yetkisi yok. Lütfen Botun yetkilerini kontrol edin.';
        }
        if (d.includes('not an administrator')) {
            return 'Bot bu kanalda/grupta yönetici değil. Lütfen önce Botu yönetici olarak atayın.';
        }
        if (d.includes('forbidden') && d.includes('admin')) {
            return 'Erişim Engellendi: Bot yönetici değil veya mesaj gönderme yetkisi kısıtlanmış.';
        }
        if (d.includes('thread_id_invalid') || d.includes('thread not found')) {
            return 'Konu (Topic) bulunamadı. Silinmiş veya ID değişmiş olabilir.';
        }
        if (d.includes('initiate conversation')) {
            return 'Bot kullanıcıyla sohbet başlatamaz. Lütfen önce Telegram\'dan bota /start komutunu verin.';
        }
        if (d.includes('migrated to a supergroup')) {
            return 'Grup süpergruba dönüştü. Lütfen grubu silip tekrar ekleyin.';
        }

        return desc; // Fallback to original
    },

    /**
     * Smart Router for Payloads
     */
    async sendPayloadSmart(token: string, payload: TelegramMessagePayload): Promise<SendResult> {
        // Detect coordinates in text/URL if not already provided
        if (!payload.latitude && payload.text) {
            const mapsMatch = payload.text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (mapsMatch) {
                payload.latitude = parseFloat(mapsMatch[1]);
                payload.longitude = parseFloat(mapsMatch[2]);
            }
        }

        if (payload.latitude !== undefined && payload.longitude !== undefined) {
            // First send the location object
            const locResult = await this.sendLocation(token, payload);
            // If it had text (like a name), send it as a follow-up if location succeeded
            if (locResult.success && payload.text && !payload.text.startsWith('http')) {
                await this.sendMessage(token, payload);
            }
            return locResult;
        }

        if (payload.document) {
            return this.sendDocument(token, payload);
        }
        if (payload.audio) {
            return this.sendAudio(token, payload);
        }
        if (payload.photo) {
            const photoUrl = typeof payload.photo === 'string' ? payload.photo.toLowerCase() : '';

            const isSvg = photoUrl.endsWith('.svg') ||
                photoUrl.includes('.svg?') ||
                photoUrl.startsWith('data:image/svg+xml');

            const isGif = photoUrl.endsWith('.gif') ||
                photoUrl.includes('.gif?') ||
                (payload.photo instanceof Blob && payload.photo.type === 'image/gif');

            if (isSvg) {
                // Route to sendDocument for SVGs
                return this.sendDocument(token, {
                    ...payload,
                    document: payload.photo,
                    photo: undefined
                });
            }

            if (isGif) {
                // Route to sendAnimation for GIFs
                return this.sendAnimation(token, {
                    ...payload,
                    animation: payload.photo,
                    photo: undefined
                });
            }

            return this.sendPhoto(token, payload);
        }
        return this.sendMessage(token, payload);
    }
}
