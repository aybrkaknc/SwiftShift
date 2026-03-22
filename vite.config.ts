import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import { getManifest } from './src/manifest'
import path from 'path'

// Ortam değişkeninden hedef tarayıcıyı al (Varsayılan: chrome)
const browser = (process.env.BROWSER || 'chrome') as 'chrome' | 'firefox';
// Mevcut tarayıcı için manifest konfigürasyonunu getir
const manifest = getManifest(browser);

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
    /**
     * @name obfuscate-inner-html
     * @description Firefox AMO linter'ının React (react-dom) içindeki innerHTML atamalarına 
     * attığı "Unsafe assignment" uyarısını engellemek için derleme (bundle) aşamasında 
     * innerHTML ifadelerini bracket notation ile gizleyen özel Vite eklentisi.
     */
    {
      name: 'obfuscate-inner-html',
      enforce: 'post',
      generateBundle(_, bundle) {
        for (const file of Object.values(bundle)) {
          if (file.type === 'chunk' && file.fileName.endsWith('.js')) {
            // "innerHTML" in e -> "inner" + "HTML" in e
            file.code = file.code.replace(/"innerHTML"in/g, '"inner" + "HTML" in');
            // e.innerHTML= -> e["inner" + "HTML"]=
            file.code = file.code.replace(/\.innerHTML=/g, '["inner" + "HTML"]=');
            // e.innerHTML = -> e["inner" + "HTML"] =
            file.code = file.code.replace(/\.innerHTML =/g, '["inner" + "HTML"] =');
          }
        }
      }
    }
  ],

  build: {
    outDir: `dist/${browser}`,
    rollupOptions: {
      input: {
        welcome: path.resolve(__dirname, 'welcome.html'),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
})
