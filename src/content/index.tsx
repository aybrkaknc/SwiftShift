import { SelectionHandler } from '../services/handlers/selectionHandler';
import { MediaHandler } from '../services/handlers/mediaHandler';
import html2canvas from 'html2canvas';

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

    if (msg.type === 'CAPTURE_FULL_PAGE_FOR_PDF') {
        captureFullPage().then(data => sendResponse(data));
        return true;
    }
});

async function captureFullPage() {
    try {
        // html2canvas ile tüm body'yi yakala
        const canvas = await html2canvas(document.body, {
            useCORS: true, // Cross-origin görseller için
            logging: false,
            allowTaint: true,
            scrollY: -window.scrollY // Sayfa başından itibaren al
        } as any);

        return {
            success: true,
            dataUrl: canvas.toDataURL('image/png'),
            width: canvas.width,
            height: canvas.height,
            title: document.title,
            url: window.location.href
        };
    } catch (error) {
        console.error('PDF Capture Failed:', error);
        return { success: false, error: String(error) };
    }
}

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

// === SMART MEDIA DETECTION (Chrome-like) ===

let lastContextMenuCoords = { x: 0, y: 0 };

document.addEventListener('contextmenu', (e) => {
    lastContextMenuCoords = { x: e.clientX, y: e.clientY };
}, true);

// Mesaj dinleyicisine ekleme (Dosyanın başındaki listener'ı güncellemek yerine buraya ayrı bir listener ekleyelim veya mevcut listener'ı editleyelim. 
// replace_file_content olduğu için mevcut listener'ı güncellemek zor olabilir, yeni bir listener eklemek sorun olmaz, karmaşıklığı önler.)

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'GET_CLICKED_MEDIA') {
        const media = findMediaAtCoords(lastContextMenuCoords.x, lastContextMenuCoords.y);
        sendResponse(media || null);
        return true;
    }
    return false; // Other messages handled by first listener
});

function findMediaAtCoords(x: number, y: number) {
    const elements = document.elementsFromPoint(x, y);

    for (const el of elements) {
        // 1. IMG tag
        if (el instanceof HTMLImageElement && el.src) {
            return { src: el.src, type: 'image' };
        }

        // 2. VIDEO tag
        if (el instanceof HTMLVideoElement) {
            // Video src or poster
            const src = el.currentSrc || el.src || el.poster;
            if (src) return { src, type: 'video' };
        }

        // 3. Background Image
        try {
            const style = window.getComputedStyle(el);
            const bg = style.backgroundImage;
            if (bg && bg !== 'none' && bg.startsWith('url(')) {
                // url("...") formatını temizle
                // Regex: url\(['"]?(.*?)['"]?\)(.*?)
                // Basitçe:
                const match = bg.match(/url\(['"]?(.*?)['"]?\)/);
                if (match && match[1]) {
                    const url = match[1];
                    // Twitter emojileri veya küçük ikonlar hariç tutulabilir ama şimdilik kalsın
                    return { src: url, type: 'image' };
                }
            }
        } catch (e) {
            // Ignore computed style errors
        }
    }
    return null;
}
