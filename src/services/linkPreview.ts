/**
 * LinkPreviewService
 * Fetches OpenGraph metadata for links.
 */
export const LinkPreviewService = {
    async fetchMetadata(url: string) {
        try {
            // Basic URL validation
            if (!url.startsWith('http')) return null;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            const html = await response.text();

            // Simple regex based meta tag extraction (Service Worker friendly)
            const getMeta = (property: string) => {
                const regex = new RegExp(`<meta[^>]+(?:property|name)=["'](?:og:|twitter:)?${property}["'][^>]+content=["']([^"']+)["']`, 'i');
                const match = html.match(regex);
                if (match) return match[1];

                // Try reverse order of attributes
                const regexReverse = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:|twitter:)?${property}["']`, 'i');
                const matchReverse = html.match(regexReverse);
                return matchReverse ? matchReverse[1] : null;
            };

            const title = getMeta('title') || html.match(/<title>([^<]+)<\/title>/i)?.[1];
            const description = getMeta('description');
            const image = getMeta('image');
            const siteName = getMeta('site_name');

            if (!title && !description && !image) return null;

            return {
                title: title?.trim(),
                description: description?.trim(),
                image: image,
                siteName: siteName?.trim()
            };
        } catch {
            // Silent fail - network errors are expected for some URLs
            return null;
        }
    }
};
