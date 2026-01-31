import { SelectionHandler } from '../services/handlers/selectionHandler';
import { MediaHandler } from '../services/handlers/mediaHandler';
// Toast rendering removed. Using native notifications.


// Listen for Capture Command (Alt+Q)
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'CAPTURE_CONTENT') {
        processCapture().then((payload) => {
            sendResponse(payload);
        });
        return true; // Async response
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
