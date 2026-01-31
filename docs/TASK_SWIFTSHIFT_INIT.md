# SwiftShift - Chrome Extension Master Plan

> **Status:** Planning Phase
> **Objective:** Create a "Zero Friction" Chrome extension to send content (Text, Link, Image, Video) to Telegram (Channels, Groups, Topics) via Context Menu.

## 🗺️ Project Phases

### Phase 1: Foundation & Setup
- [ ] Initialize project with React + TypeScript + Vite (`plasmo` framework recommended for extensions).
- [ ] Configure TailwindCSS for styling.
- [ ] Set up project structure (background, popup, content scripts).
- [ ] Create `manifest.json` based on MANIFEST_SPEC.md.

### Phase 2: Core Functionality (The Bridge)
- [ ] **Onboarding UI:** 
    - [ ] Create Popup UI for entering Bot Token & Chat ID.
    - [ ] Implement "How to find Token" guide with link to bot.
- [ ] **Telegram Service:**
    - [ ] Implement `TelegramService` class in background script.
    - [ ] Handle API methods: `sendMessage`, `sendPhoto`.
    - [ ] Implement Retry Logic (3 attempts on failure).
    - [ ] Implement Error Toast (Bottom-right, minimal).

### Phase 3: Context Menu Logic
- [ ] Implement dynamic Context Menu creation.
- [ ] **Fetch Targets:**
    - [ ] Function to fetch available Topics/Channels from Telegram API (requires Bot Admin rights).
    - [ ] Cache these targets in `chrome.storage.local`.
- [ ] **Build Menu Hierarchy:**
    - [ ] Parent: "SwiftShift" (with Icon).
    - [ ] Children: Dynamic list of Channels/Topics.

### Phase 4: Content Handlers
- [ ] **Text Handler:** Send raw text.
- [ ] **Link Handler:** Send Anchor Text + URL + Preview.
- [ ] **Image Handler:** 
    - [ ] Fetch image blob (no compression).
    - [ ] Send Photo (Method B) + Image URL.
- [ ] **Video Handler:** Send Page URL + Video URL.
- [ ] **Page Handler:** Send Page Title + URL.

### Phase 5: Polish & release
- [ ] **Shortcuts:** Implement `Alt+Q` logic.
- [ ] **Testing:** Verify all content types and network conditions.
- [ ] **Build:** Package for Chrome Web Store.

## 📝 Key Decisions (from User Interview)
- **Target:** Chromium Browsers.
- **Auth:** Single Bot Token, Multiple Targets (Channels/Topics).
- **UX:** Silent success, Toast on error.
- **Image:** Send as Blob (Uncompressed).
- **Keyboard:** `Alt+Q` smart context action.
