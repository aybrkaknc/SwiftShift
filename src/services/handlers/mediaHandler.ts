/**
 * Media Handler
 * Utilities for processing Images and Videos.
 */

export const MediaHandler = {
    /**
     * Parse Video URL to extract timestamp
     * Supports YouTube standard URLs.
     */
    processVideoUrl(url: string, currentTime?: number): string {
        try {
            const u = new URL(url);

            // YouTube Logic
            if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
                if (currentTime && currentTime > 0) {
                    const timeInt = Math.floor(currentTime);
                    u.searchParams.set('t', timeInt.toString() + 's');
                }
            }

            return u.toString();
        } catch (e) {
            return url;
        }
    },

    /**
     * Attempt to determine if a URL is an image
     */
    isImageUrl(url: string): boolean {
        return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
    }
};
