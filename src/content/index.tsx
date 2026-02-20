import { SelectionHandler } from '../services/handlers/selectionHandler';
import { MediaHandler } from '../services/handlers/mediaHandler';

// Listen for Capture Command
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'CAPTURE_CONTENT') {
        processCapture().then(payload => sendResponse(payload));
        return true;
    }

    if (msg.type === 'START_REGION_CAPTURE') {
        startRegionCapture(msg.targetId, msg.threadId, msg.targetName);
        sendResponse({ success: true });
        return true;
    }
});



async function processCapture() {
    // 1. Check for Selection
    const selectedText = SelectionHandler.getSelection();
    if (selectedText) {
        return { text: selectedText };
    }

    // 2. Check for Page Info (Video or Standard)
    let url = window.location.href;
    const title = document.title;

    // Try to find video timestamp if on YouTube
    const video = document.querySelector('video');
    if (video) {
        url = MediaHandler.processVideoUrl(url, video.currentTime);
    }

    return {
        text: `${title}\n${url}`,
        isPage: true
    };
}

/**
 * Region Capture: Kullanıcının bir dikdörtgen seçmesini sağlar
 */
function startRegionCapture(targetId: string, threadId?: number, targetName?: string) {
    // Mevcut overlay varsa kaldır
    const existingOverlay = document.getElementById('swiftshift-region-overlay');
    if (existingOverlay) existingOverlay.remove();

    // Overlay oluştur
    const overlay = document.createElement('div');
    overlay.id = 'swiftshift-region-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.3);
        cursor: crosshair;
        z-index: 2147483647;
    `;

    // Seçim dikdörtgeni
    const selectionBox = document.createElement('div');
    selectionBox.style.cssText = `
        position: fixed;
        border: 2px dashed #F4AB25;
        background: rgba(244, 171, 37, 0.1);
        pointer-events: none;
        display: none;
    `;
    overlay.appendChild(selectionBox);

    // Talimat metni
    const instruction = document.createElement('div');
    instruction.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #1a1a1a;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: system-ui, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.1);
    `;
    instruction.textContent = '✂️ Yakalamak istediğiniz alanı seçin (ESC ile iptal)';
    overlay.appendChild(instruction);

    let startX = 0, startY = 0;
    let isSelecting = false;

    const onMouseDown = (e: MouseEvent) => {
        isSelecting = true;
        startX = e.clientX;
        startY = e.clientY;
        selectionBox.style.display = 'block';
        selectionBox.style.left = `${startX}px`;
        selectionBox.style.top = `${startY}px`;
        selectionBox.style.width = '0';
        selectionBox.style.height = '0';
    };

    const onMouseMove = (e: MouseEvent) => {
        if (!isSelecting) return;
        const currentX = e.clientX;
        const currentY = e.clientY;

        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);

        selectionBox.style.left = `${left}px`;
        selectionBox.style.top = `${top}px`;
        selectionBox.style.width = `${width}px`;
        selectionBox.style.height = `${height}px`;
    };

    const onMouseUp = async (e: MouseEvent) => {
        if (!isSelecting) return;
        isSelecting = false;

        const endX = e.clientX;
        const endY = e.clientY;

        const left = Math.min(startX, endX);
        const top = Math.min(startY, endY);
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

        // Cleanup
        overlay.remove();

        // Minimum boyut kontrolü
        if (width < 10 || height < 10) {
            return;
        }

        // Background'a seçim bilgilerini gönder
        chrome.runtime.sendMessage({
            type: 'REGION_CAPTURE_SELECTED',
            targetId,
            threadId,
            targetName,
            region: { left, top, width, height },
            devicePixelRatio: window.devicePixelRatio || 1,
            pageTitle: document.title,
            pageUrl: window.location.href
        });
    };

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            overlay.remove();
            document.removeEventListener('keydown', onKeyDown);
        }
    };

    overlay.addEventListener('mousedown', onMouseDown);
    overlay.addEventListener('mousemove', onMouseMove);
    overlay.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);

    document.body.appendChild(overlay);
}

// === ENHANCED MEDIA SCANNER (v0.6.0) ===

let lastContextMenuCoords = { x: 0, y: 0 };

document.addEventListener('contextmenu', (e) => {
    lastContextMenuCoords = { x: e.clientX, y: e.clientY };
}, true);

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'GET_CLICKED_MEDIA') {
        const media = scanForMedia(lastContextMenuCoords.x, lastContextMenuCoords.y);
        sendResponse(media || null);
        return true;
    }
    return false;
});

/**
 * Puanlama ve Filtreleme Sistemi ile Medya Taraması
 */
function scanForMedia(x: number, y: number) {
    const elements = document.elementsFromPoint(x, y);
    const candidates: any[] = [];

    for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const area = rect.width * rect.height;

        // Görünmeyecek kadar küçükleri yoksay (ikonlar hariç, ikonlar bazen küçük olabilir ama img ise önemlidir)
        if (rect.width < 10 || rect.height < 10) continue;

        // 1. IMG
        if (el instanceof HTMLImageElement && el.src) {
            candidates.push({
                type: 'image',
                src: el.currentSrc || el.src,
                score: 10 + (area / 10000) // Büyük resimlere bonus
            });
        }

        // 2. VIDEO (Poster veya Frame Capture)
        if (el instanceof HTMLVideoElement) {
            // Eğer video oynuyorsa veya durmuşsa frame almayı dene
            // Bu biraz maliyetli ama kullanıcı sağ tıkladıysa istiyordur.
            try {
                const frameUrl = captureVideoFrame(el);
                if (frameUrl) {
                    candidates.push({
                        type: 'image', // Telegram'a fotoğraf olarak gönder
                        src: frameUrl,
                        score: 20 // Videolar yüksek öncelikli
                    });
                } else if (el.poster) {
                    candidates.push({
                        type: 'image',
                        src: el.poster,
                        score: 15
                    });
                }
            } catch (e) {
                // Video cross-origin ise frame alınamaz
                if (el.poster) candidates.push({ type: 'image', src: el.poster, score: 5 });
            }
        }

        // 3. CANVAS
        if (el instanceof HTMLCanvasElement) {
            try {
                const dataUrl = el.toDataURL('image/png');
                candidates.push({
                    type: 'image',
                    src: dataUrl,
                    score: 12 + (area / 10000)
                });
            } catch (e) {
                // Tainted canvas
            }
        }

        // 4. SVG
        if (el instanceof SVGElement) {
            // SVG'yi base64'e çevir
            try {
                new XMLSerializer().serializeToString(el);
                // SVG'yi direk işlemek yerine, burada basitçe varlığını kontrol ediyoruz.
                // İdeal çözüm: SVG'yi canvas'a render etmek. Şimdilik bu kısmı atlıyoruz çünkü karmaşık.
            } catch (e) { }
        }

        // 5. Background Image
        try {
            const style = window.getComputedStyle(el);
            const bg = style.backgroundImage;
            if (bg && bg !== 'none' && bg.startsWith('url(')) {
                const match = bg.match(/url\(['"]?(.*?)['"]?\)/);
                if (match && match[1]) {
                    candidates.push({
                        type: 'image',
                        src: match[1],
                        score: 5 + (area / 20000) // Backgroundlar genelde daha düşük öncelikli
                    });
                }
            }
        } catch (e) { }
    }

    // En yüksek puanlıyı seç
    if (candidates.length > 0) {
        // Puana göre sırala (Azalan)
        candidates.sort((a, b) => b.score - a.score);
        console.log('Media Candidates:', candidates); // Debug için
        return candidates[0];
    }

    return null;
}

/**
 * Videodan anlık kare yakalar
 */
function captureVideoFrame(video: HTMLVideoElement): string | null {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg', 0.85);
        }
    } catch (e) {
        console.warn('Cannot capture video frame (CORS likely):', e);
    }
    return null;
}
