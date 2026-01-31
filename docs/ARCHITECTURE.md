# SwiftShift Architecture & Data Flow

## 🏗️ High-Level Component Design

The extension follows the standard **Manifest V3** architecture with a heavy reliance on the Service Worker (Background Script) for API communication, large file handling, and intricate caching logic.

```mermaid
graph TD
    User((User)) -->|Right Click| CM[Context Menu]
    User -->|Alt+Q| CS[Content Script]
    User -->|Click Icon| PU[Popup UI]
    
    CM -->|Menu Click| SW[Service Worker]
    CS -->|Message| SW
    PU -->|Save Settings| LS[(Local Storage)]
    
    SW -->|Read Settings| LS
    SW -->|Fetch Topics| TG[Telegram API]
    SW -->|Send Payload| TG
    SW -->|Large File Logic| TG
    
    TG -->|Error (Too Large)| SW
    SW -->|Ask User| UI[In-Page Prompt]
    UI -->|Confirmed| SW
    SW -->|Send Link| TG
    
    CS -->|Show Toast| UI
```

## 🧩 Components

### 1. Popup UI (Settings & Onboarding)
- **Tech:** React + TailwindCSS.
- **Features:** 
    - **Profile Management:** Save multiple "Profiles" (Bot Token + Chat ID sets).
    - **Token Security:** Masked input field (Start/End visible) with toggle eye icon.
    - **Refresh Button:** To manually update cached Topics/Channels.
    - **Guide Link:** Embedded help or link to external guide.

### 2. Service Worker (Background.ts)
- **Role:** The Orchestrator.
- **Responsibilities:**
    - **Cache Manager:** Store and retrieve Topic lists. Manage "Last Used" sorting.
    - **Smart Fallback:** 
        1. Try sending Media (Blob).
        2. If API returns `413 Entity Too Large` -> Trigger User Prompt.
        3. If User accepts -> Send Media Link instead.
    - **Video Parser:** Detect YouTube/Vimeo URLs and append `&t=X` timestamp if available.
    - **Context Menu Builder:** Dynamic rebuilding based on "Top 3 + More" logic.

### 3. Content Script (Overlay.tsx)
- **Role:** Interaction Layer.
- **Responsibilities:**
    - **Alt+Q Listener.**
    - **Toast UI:** Minimal error notifications.
    - **Modern Alert UI:** For the "File Too Large - Send Link?" interactive prompt.

## 💾 Data Storage Schema (`chrome.storage.local`)

```typescript
interface StorageSchema {
  activeProfileId: string;
  profiles: Record<string, UserProfile>;
  recentTargets: string[]; // List of IDs sorted by recency
}

interface UserProfile {
  id: string;
  name: string; // e.g. "My Private Bot"
  botToken: string; // Stored securely
  chatId: string;
  targets: TelegramTarget[]; // Cached list of topics
  lastSynced: number; // Timestamp
}

interface TelegramTarget {
  id: string; // Chat ID or Topic ID
  name: string;
  type: 'channel' | 'group' | 'topic';
}
```

## 🔒 Security & Privacy
- **Host Permissions:** `https://api.telegram.org/*` - Required for API.
- **Data Privacy:** Tokens stored in `chrome.storage.local`.
- **Masking:** Tokens are never displayed in plain text in the UI after entry without explicit user action.
