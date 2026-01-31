# Manifest V3 Specification

This document outlines the required configuration for `manifest.json`.

## 📌 Core Identity
- **Name:** SwiftShift
- **Version:** 0.1.0
- **Manifest Version:** 3
- **Description:** Zero-friction content transfer to Telegram.

## 🔑 Permissions

| Permission | Justification |
| :--- | :--- |
| `contextMenus` | Core Feature. To add "Send to Telegram" options in the right-click menu. |
| `storage` | Required to store the User's Bot Token, Chat IDs, and cached Topics securely. |
| `activeTab` | Required for the `Alt+Q` handler to read the current page title/url without requesting broad host permissions for *all* sites. |
| `scripting` | Might be used to inject the Toast UI dynamically if Content Script persistence is an issue. |
| `commands` | Required for `Alt+Q` keyboard shortcut registration. |

## 🌐 Host Permissions
- `https://api.telegram.org/*`
  - **Reason:** To allow the Service Worker to make direct POST requests to Telegram API. Without this, Fetch API requests would be blocked by CORS policies.

## ⌨️ Commands (Shortcuts)
```json
"commands": {
  "quick_send": {
    "suggested_key": {
      "default": "Alt+Q",
      "mac": "Alt+Q"
    },
    "description": "Send selection or current page to default Telegram target"
  }
}
```

## 📦 Resources
- **Background:** Service Worker (`background.ts`)
- **Popup:** `popup.html`
- **Content Scripts:**
    - Matches: `<all_urls>`
    - CSS: `toast.css` (Minimal styles)
    - JS: `content.ts`
