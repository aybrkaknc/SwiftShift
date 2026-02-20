/**
 * InjectToast Service
 * Aktif sekmeye in-page toast bildirimi enjekte eder.
 * Shadow DOM kullanarak site CSS'inden izole bir bildirim gösterir.
 * Chrome sistem bildirimlerine bağımlılığı ortadan kaldırır.
 *
 * @param tabId - Bildirimin gösterileceği sekme ID'si
 * @param title - Bildirim başlığı
 * @param message - Bildirim mesajı
 * @param type - 'success' | 'error' | 'info'
 */
export async function injectToast(
    tabId: number,
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' = 'success'
): Promise<void> {
    try {
        await chrome.scripting.executeScript({
            target: { tabId },
            func: showToastInPage,
            args: [title, message, type]
        });
    } catch (e) {
        // Fallback: chrome:// veya edge:// gibi korumalı sayfalarda çalışmaz
        // Bu durumda sessizce log'a yaz
        console.warn('InjectToast failed (protected page?):', e);
    }
}

/**
 * Sayfa içinde çalışan toast fonksiyonu
 * Bu fonksiyon chrome.scripting.executeScript ile enjekte edilir.
 * Shadow DOM ile izole bir bildirim gösterir.
 */
function showToastInPage(title: string, message: string, type: 'success' | 'error' | 'info') {
    const CONTAINER_ID = 'swiftshift-toast-container';
    const ANIMATION_DURATION = 300;
    const AUTO_DISMISS_MS = type === 'error' ? 4000 : 2000;

    // Renk paletleri
    const colors: Record<string, { bg: string; border: string; icon: string; glow: string }> = {
        success: {
            bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
            border: 'rgba(52, 211, 153, 0.4)',
            icon: '✓',
            glow: '0 0 20px rgba(16, 185, 129, 0.3)'
        },
        error: {
            bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(185, 28, 28, 0.95))',
            border: 'rgba(252, 165, 165, 0.4)',
            icon: '✕',
            glow: '0 0 20px rgba(239, 68, 68, 0.3)'
        },
        info: {
            bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(29, 78, 216, 0.95))',
            border: 'rgba(147, 197, 253, 0.4)',
            icon: 'ℹ',
            glow: '0 0 20px rgba(59, 130, 246, 0.3)'
        }
    };

    const palette = colors[type] || colors.info;

    // Container yoksa oluştur (Shadow DOM ile)
    let container = document.getElementById(CONTAINER_ID);
    let shadowRoot: ShadowRoot;

    if (!container) {
        container = document.createElement('div');
        container.id = CONTAINER_ID;
        container.style.cssText = `
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 2147483647;
            pointer-events: none;
        `;
        shadowRoot = container.attachShadow({ mode: 'open' });
        document.body.appendChild(container);
    } else {
        shadowRoot = container.shadowRoot!;
    }

    // Toast elementi
    const toast = document.createElement('div');
    toast.style.cssText = `
        display: flex;
        align-items: flex-start;
        gap: 10px;
        max-width: 320px;
        padding: 12px 16px;
        margin-bottom: 8px;
        border-radius: 12px;
        background: ${palette.bg};
        border: 1px solid ${palette.border};
        box-shadow: ${palette.glow}, 0 8px 32px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(12px);
        color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        pointer-events: auto;
        cursor: pointer;
        transform: translateX(120%);
        opacity: 0;
        transition: transform ${ANIMATION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1),
                    opacity ${ANIMATION_DURATION}ms ease;
    `;

    // İkon
    const iconEl = document.createElement('div');
    iconEl.style.cssText = `
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        flex-shrink: 0;
        margin-top: 1px;
    `;
    iconEl.textContent = palette.icon;

    // Metin bölümü
    const textWrap = document.createElement('div');
    textWrap.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    `;

    const titleEl = document.createElement('div');
    titleEl.style.cssText = `
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.02em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    `;
    titleEl.textContent = title;

    const msgEl = document.createElement('div');
    msgEl.style.cssText = `
        font-size: 11px;
        font-weight: 400;
        opacity: 0.85;
        line-height: 1.4;
        word-break: break-word;
    `;
    msgEl.textContent = message;


    textWrap.appendChild(titleEl);
    textWrap.appendChild(msgEl);
    toast.appendChild(iconEl);
    toast.appendChild(textWrap);

    // Progress bar (auto-dismiss indicator)
    const progressWrap = document.createElement('div');
    progressWrap.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 12px;
        right: 12px;
        height: 2px;
        border-radius: 1px;
        background: rgba(255, 255, 255, 0.15);
        overflow: hidden;
    `;

    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 1px;
        transition: width ${AUTO_DISMISS_MS}ms linear;
    `;

    progressWrap.appendChild(progressBar);
    toast.style.position = 'relative';
    toast.appendChild(progressWrap);

    // Shadow DOM'a ekle
    shadowRoot.appendChild(toast);

    // Slide-in animasyonu (rAF ile)
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
            // Progress bar'ı başlat
            progressBar.style.width = '0%';
        });
    });

    // Dismiss fonksiyonu
    const dismiss = () => {
        toast.style.transform = 'translateX(120%)';
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
            // Container'da başka toast yoksa onu da kaldır
            if (shadowRoot.children.length === 0) {
                container?.remove();
            }
        }, ANIMATION_DURATION);
    };

    // Tıkla ile kapat
    toast.addEventListener('click', dismiss);

    // Auto-dismiss
    setTimeout(dismiss, AUTO_DISMISS_MS);
}
