# SwiftShift 🚀

SwiftShift is a premium Chrome extension designed to instantly bridge web content to Telegram. Featuring a sleek glassmorphism UI and hierarchical target management, it allows seamless sharing to channels, groups, and specific forum topics.

![Banner](https://raw.githubusercontent.com/aybrkaknc/SwiftShift/main/public/icons/icon128.png)

## ✨ Key Features

- **Hierarchical Destinations:** Organizes topics under their parent channels/groups with **Vertical Hierarchy Lines** for a clear tree-view flow.
- **Glassmorphism UI:** A modern, high-end interface built with Tailwind CSS, featuring subtle glass effects and custom scrollbars.
- **Integrated Action Bar (Integrated Edge):** Hover-triggered actions seamlessly embedded into the right edge of list items with theme-aware gradients.
- **Auto-Discovery:** Automatically detects channel names and bot details when adding new topics.
- **Secure Storage:** All configurations and bot tokens are stored securely in your browser's local storage via IndexedDB.
- **One-Click Sharing:** Instantly send the current page link, selection, or page capture to multiple Telegram destinations.
- **Clickable Recents:** Directly access links and images from your history by clicking items in the Recents tab.

### 🆕 v1.0.0 Features
- **🎨 Design System 2.0:** New vertical accent lines, theme-aware action bars, and refined typography.
- **📷 Page Capture:** Capture the visible area of any webpage as PNG (Compressed or Uncompressed).
- **✂️ Region Selection:** Select a specific area on the page with your mouse and capture only that region.
- **📍 Location Sharing:** Google Maps coordinates are automatically detected and sent as interactive Telegram locations.
- **🎞️ Enhanced Media:** Full support for GIFs, Audio files, WebP images, and SVG documents.
- **🚀 Turbo Refresh:** Added spinning animations and manual refresh for all list views.
- **🔔 Pro Toast:** Bottom-aligned, animated notifications for better non-disturbing feedback.
- **🔒 Security Hardened:** Bot tokens and sensitive data are strictly isolated.

## 🛠️ Tech Stack

- **Framework:** [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Typography:** [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)
- **API:** Telegram Bot API
- **Build Tool:** TypeScript & Vite

## 🚀 Installation

### Development Mode
1. Clone the repository:
   ```bash
   git clone https://github.com/aybrkaknc/SwiftShift.git
   cd SwiftShift
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Load in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked** and select the `dist` folder.

## ⚙️ Configuration

1. Open the extension and follow the setup guide.
2. Enter your **Telegram Bot Token** (get it from [@BotFather](https://t.me/BotFather)).
3. Add your destinations (Channels, Groups, or Topics).
4. Start shifting content!

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for a faster web-to-Telegram experience.
