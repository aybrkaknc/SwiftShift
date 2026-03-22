# SwiftShift 🚀

SwiftShift is a high-performance browser extension designed to instantly bridge web content to Telegram. Featuring a modern interface and hierarchical target management, it allows seamless sharing of links, selections, captures, and locations to channels, groups, and specific forum topics.

Now officially supports both **Google Chrome** and **Mozilla Firefox**.

---

## ✨ Features (English)

- **Dual-Browser Support:** Native builds for Chrome (Manifest V3) and Firefox (Manifest V3).
- **Hierarchical Destinations:** Organize forum topics under their parent channels/groups.
- **Modern UI:** A clean, high-end interface built with Tailwind CSS and premium typography.
- **Page & Region Capture:** Capture the full visible area or a specific mouse-selected region as PNG.
- **Smart Location Detection:** Automatically detects Google Maps coordinates and sends them as Telegram locations.
- **Secure Handling:** Bot tokens and configurations are stored locally and never logged.
- **Premium Animations:** Smooth slide-in/out transitions for notifications and modals.

## 🛠️ Installation & Build

### 1. Requirements
- Node.js (v18+)
- npm

### 2. Setup
```bash
git clone https://github.com/aybrkaknc/SwiftShift.git
cd SwiftShift
npm install
```

### 3. Build for Browsers
- **For Chrome:** `npm run build:chrome` (Output: `dist/chrome`)
- **For Firefox:** `npm run build:firefox` (Output: `dist/firefox`)
- **Both:** `npm run build:all`

### 4. Loading the Extension
- **Chrome:** Go to `chrome://extensions/`, enable Developer Mode, click "Load unpacked", and select `dist/chrome`.
- **Firefox:** Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on...", and select `dist/firefox/manifest.json`.

---

# SwiftShift 🚀 (Türkçe)

SwiftShift, web içeriklerini anında Telegram'a köprülemek için tasarlanmış yüksek performanslı bir tarayıcı eklentisidir. Modern arayüzü ve hiyerarşik hedef yönetimi ile bağlantıları, seçimleri, ekran görüntülerini ve konumları kanallarınıza, gruplarınıza veya forum konularınıza sorunsuz bir şekilde paylaşmanızı sağlar.

Artık resmi olarak hem **Google Chrome** hem de **Mozilla Firefox**'u desteklemektedir.

## ✨ Özellikler (Türkçe)

- **Çift Tarayıcı Desteği:** Chrome (Manifest V3) ve Firefox (Manifest V3) için yerel yapılar.
- **Hiyerarşik Hedefler:** Forum konularını ana kanallarının/gruplarının altında düzenleyin.
- **Modern Arayüz:** Tailwind CSS ve premium tipografi ile oluşturulmuş temiz, üst düzey arayüz.
- **Sayfa ve Bölge Yakalama:** Görünür alanı veya fare ile seçilen özel bir bölgeyi PNG olarak yakalayın.
- **Akıllı Konum Algılama:** Google Haritalar koordinatlarını otomatik olarak algılar ve Telegram konumu olarak gönderir.
- **Güvenli İşleme:** Bot token'ları ve konfigürasyonlar yerel olarak saklanır ve asla loglanmaz.
- **Premium Animasyonlar:** Bildirimler ve modallar için pürüzsüz kayma geçişleri.

## 🛠️ Kurulum ve Derleme
- Bağımlılıkları yükleyin: `npm install`
- Chrome için derleyin: `npm run build:chrome`
- Firefox için derleyin: `npm run build:firefox`

---

## 📜 License
This project is licensed under the MIT License.

Built with ❤️ by [Ayberk](https://github.com/aybrkaknc) for a faster web-to-Telegram experience.
