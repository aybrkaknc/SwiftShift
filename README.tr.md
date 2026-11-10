<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

<br />
<div align="center">
  <h3 align="center">SwiftShift</h3>

  <p align="center">
    Web içeriklerini (bağlantılar, seçimler, ekran görüntüleri ve konumlar) Telegram kanallarına, gruplarına ve forum konularına anında gönderen bir tarayıcı eklentisi.
    <br />
    <a href="https://chromewebstore.google.com/detail/swiftshift/hgfbelpjimpdhpabcmnlefnjlfhddffb"><strong>Chrome için indirin</strong></a>
    <br />
    <br />
    <a href="https://addons.mozilla.org/en-US/firefox/addon/swiftshift/">Firefox için indirin</a>
    &middot;
    <a href="https://github.com/aybrkaknc/SwiftShift/issues/new?labels=bug">Hata Bildir</a>
    &middot;
    <a href="https://github.com/aybrkaknc/SwiftShift/issues/new?labels=enhancement">Özellik İste</a>
  </p>

  <p align="center">
    <a href="README.md">English</a> | <a href="README.tr.md">Türkçe</a>
  </p>
</div>

<details>
  <summary>İçindekiler</summary>
  <ol>
    <li>
      <a href="#proje-hakkında">Proje Hakkında</a>
      <ul>
        <li><a href="#özellikler">Özellikler</a></li>
        <li><a href="#kullanılan-teknolojiler">Kullanılan Teknolojiler</a></li>
      </ul>
    </li>
    <li>
      <a href="#başlarken">Başlarken</a>
      <ul>
        <li><a href="#gereksinimler">Gereksinimler</a></li>
        <li><a href="#kurulum-ve-derleme">Kurulum ve Derleme</a></li>
      </ul>
    </li>
    <li><a href="#iletişim">İletişim</a></li>
  </ol>
</details>

## Proje Hakkında

SwiftShift, web içeriklerini Telegram'a köprülemek için tasarlanmış yüksek performanslı bir tarayıcı eklentisidir. Modern arayüzü ve hiyerarşik hedef yönetimi ile bağlantıları, seçimleri, ekran görüntülerini ve konumları kanallarınıza, gruplarınıza ve belirli forum konularınıza paylaşmanızı sağlar.

Hem Google Chrome hem de Mozilla Firefox'u destekler.

### Özellikler

- **Çift Tarayıcı Desteği**: Chrome (Manifest V3) ve Firefox (Manifest V3) için yerel derlemeler.
- **Hiyerarşik Hedefler**: Forum konularını ana kanallarının ve gruplarının altında düzenleyin.
- **Modern Arayüz**: Tailwind CSS ile oluşturulmuş temiz bir arayüz.
- **Sayfa ve Bölge Yakalama**: Görünür alanı ya da fare ile seçilen bir bölgeyi PNG olarak yakalayın.
- **Akıllı Konum Algılama**: Google Haritalar koordinatlarını algılar ve Telegram konumu olarak gönderir.
- **Güvenli İşleme**: Bot token'ları ve yapılandırma yerel olarak saklanır, asla loglanmaz.
- **Animasyonlar**: Bildirimler ve pencereler için yumuşak kayma geçişleri.

<p align="right">(<a href="#readme-top">başa dön</a>)</p>

### Kullanılan Teknolojiler

* [![Tailwind CSS][Tailwind-shield]][Tailwind-url]
* [![Vite][Vite-shield]][Vite-url]
* [![Chrome][Chrome-shield]][Chrome-url]
* [![Firefox][Firefox-shield]][Firefox-url]

<p align="right">(<a href="#readme-top">başa dön</a>)</p>

## Başlarken

### Gereksinimler

* Node.js (v18+)
* npm

### Kurulum ve Derleme

1. Depoyu klonlayın ve bağımlılıkları yükleyin
   ```sh
   git clone https://github.com/aybrkaknc/SwiftShift.git
   cd SwiftShift
   npm install
   ```
2. Bir tarayıcı için derleyin
   ```sh
   npm run build:chrome    # çıktı: dist/chrome
   npm run build:firefox   # çıktı: dist/firefox
   npm run build:all       # ikisi birden
   ```
3. Eklentiyi yükleyin
   * **Chrome**: `chrome://extensions/` adresini açın, Geliştirici modunu etkinleştirin, "Paketlenmemiş öğe yükle" seçeneğine tıklayıp `dist/chrome` klasörünü seçin.
   * **Firefox**: `about:debugging#/runtime/this-firefox` adresini açın, "Geçici Eklenti Yükle..." seçeneğine tıklayıp `dist/firefox/manifest.json` dosyasını seçin.

<p align="right">(<a href="#readme-top">başa dön</a>)</p>

## İletişim

Ayberk - [@aybrkaknc](https://github.com/aybrkaknc)

Proje Bağlantısı: [https://github.com/aybrkaknc/SwiftShift](https://github.com/aybrkaknc/SwiftShift)

<p align="right">(<a href="#readme-top">başa dön</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/aybrkaknc/SwiftShift.svg?style=for-the-badge
[contributors-url]: https://github.com/aybrkaknc/SwiftShift/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/aybrkaknc/SwiftShift.svg?style=for-the-badge
[forks-url]: https://github.com/aybrkaknc/SwiftShift/network/members
[stars-shield]: https://img.shields.io/github/stars/aybrkaknc/SwiftShift.svg?style=for-the-badge
[stars-url]: https://github.com/aybrkaknc/SwiftShift/stargazers
[issues-shield]: https://img.shields.io/github/issues/aybrkaknc/SwiftShift.svg?style=for-the-badge
[issues-url]: https://github.com/aybrkaknc/SwiftShift/issues
[Tailwind-shield]: https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Vite-shield]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[Chrome-shield]: https://img.shields.io/badge/Chrome-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white
[Chrome-url]: https://chromewebstore.google.com/detail/swiftshift/hgfbelpjimpdhpabcmnlefnjlfhddffb
[Firefox-shield]: https://img.shields.io/badge/Firefox-FF7139?style=for-the-badge&logo=firefoxbrowser&logoColor=white
[Firefox-url]: https://addons.mozilla.org/en-US/firefox/addon/swiftshift/
