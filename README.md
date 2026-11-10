<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

<br />
<div align="center">
  <h3 align="center">SwiftShift</h3>

  <p align="center">
    A browser extension that instantly sends web content (links, selections, captures and locations) to Telegram channels, groups and forum topics.
    <br />
    <a href="https://chromewebstore.google.com/detail/swiftshift/hgfbelpjimpdhpabcmnlefnjlfhddffb"><strong>Get it for Chrome</strong></a>
    <br />
    <br />
    <a href="https://addons.mozilla.org/en-US/firefox/addon/swiftshift/">Get it for Firefox</a>
    &middot;
    <a href="https://github.com/aybrkaknc/SwiftShift/issues/new?labels=bug">Report Bug</a>
    &middot;
    <a href="https://github.com/aybrkaknc/SwiftShift/issues/new?labels=enhancement">Request Feature</a>
  </p>

  <p align="center">
    <a href="README.md">English</a> | <a href="README.tr.md">Türkçe</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#features">Features</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation--build">Installation & Build</a></li>
      </ul>
    </li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About The Project

SwiftShift is a high-performance browser extension for bridging web content to Telegram. It has a modern interface and hierarchical target management, so you can share links, selections, captures and locations to channels, groups and specific forum topics.

It supports both Google Chrome and Mozilla Firefox.

### Features

- **Dual-Browser Support**: Native builds for Chrome (Manifest V3) and Firefox (Manifest V3).
- **Hierarchical Destinations**: Organize forum topics under their parent channels and groups.
- **Modern UI**: Clean interface built with Tailwind CSS.
- **Page and Region Capture**: Capture the visible area or a region selected with the mouse as PNG.
- **Smart Location Detection**: Detects Google Maps coordinates and sends them as Telegram locations.
- **Secure Handling**: Bot tokens and configuration are stored locally and never logged.
- **Animations**: Smooth slide-in and slide-out transitions for notifications and modals.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Tailwind CSS][Tailwind-shield]][Tailwind-url]
* [![Vite][Vite-shield]][Vite-url]
* [![Chrome][Chrome-shield]][Chrome-url]
* [![Firefox][Firefox-shield]][Firefox-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

* Node.js (v18+)
* npm

### Installation & Build

1. Clone the repository and install dependencies
   ```sh
   git clone https://github.com/aybrkaknc/SwiftShift.git
   cd SwiftShift
   npm install
   ```
2. Build for a browser
   ```sh
   npm run build:chrome    # output: dist/chrome
   npm run build:firefox   # output: dist/firefox
   npm run build:all       # both
   ```
3. Load the extension
   * **Chrome**: open `chrome://extensions/`, enable Developer Mode, click "Load unpacked" and select `dist/chrome`.
   * **Firefox**: open `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on..." and select `dist/firefox/manifest.json`.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Ayberk - [@aybrkaknc](https://github.com/aybrkaknc)

Project Link: [https://github.com/aybrkaknc/SwiftShift](https://github.com/aybrkaknc/SwiftShift)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

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
