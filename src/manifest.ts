import packageJson from '../package.json';

/**
 * @function getManifest
 * @param {'chrome' | 'firefox'} browser - Hedeflenen tarayıcı tipi.
 * @returns {any} Tarayıcıya özel yapılandırılmış Manifest V3 objesi.
 * @description package.json üzerinden versiyon bilgisini okuyarak hem Chrome hem de Firefox 
 * (Firefox için gerekli Gecko ID ve veri izni ayarları dahil) için Manifest V3 dosyası üretir.
 */
export const getManifest = (browser: 'chrome' | 'firefox') => {
  const manifest: any = {
    manifest_version: 3,
    name: "SwiftShift",
    description: "Send content to Telegram instantly",
    version: packageJson.version,
    permissions: [
      "contextMenus",
      "storage",
      "activeTab",
      "tabs",
      "notifications",
      "scripting"
    ],
    host_permissions: [
      "https://api.telegram.org/*"
    ],
    action: {
      default_popup: "popup.html",
      default_icon: {
        "16": "icons/16.png",
        "48": "icons/48.png",
        "128": "icons/128.png"
      }
    },
    icons: {
      "16": "icons/16.png",
      "48": "icons/48.png",
      "128": "icons/128.png"
    },
    content_scripts: [
      {
        matches: ["<all_urls>"],
        js: ["src/content/index.tsx"]
      }
    ],
    commands: {
      "quick_send": {
        "suggested_key": {
          "default": "Alt+Q",
          "mac": "Alt+Q"
        },
        "description": "Send selection or current page to default Telegram target"
      }
    }
  };

  // Browser specific settings
  if (browser === 'chrome') {
    manifest.background = {
      service_worker: "src/background/index.ts",
      type: "module"
    };
  } else if (browser === 'firefox') {
    manifest.background = {
      scripts: ["src/background/index.ts"],
      type: "module"
    };
    manifest.browser_specific_settings = {
      gecko: {
        id: "{37a7b129-479b-48b5-8718-4376ab5ccc3c}",
        strict_min_version: "142.0",
        data_collection_permissions: {
          required: ["none"]
        }
      }
    };
  }

  return manifest;
};
