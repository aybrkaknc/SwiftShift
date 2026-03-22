import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

// ESM compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @file package.js
 * @description Derlenmiş (build edilmiş) eklenti dosyalarını tarayıcı tipine göre 
 * (chrome/firefox) zip formatında paketleyerek 'releases' klasörüne kaydeden Node.js betiği.
 * 
 * Kullanım: node scripts/package.js [chrome|firefox]
 */

// package.json'dan sürümü dinamik olarak oku
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

const browser = process.argv[2] || 'chrome';
const DIST_DIR = path.join(__dirname, `../dist/${browser}`);
const OUTPUT_DIR = path.join(__dirname, '../releases');

// Ensure releases dir exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

const outputFileName = `swiftshift-${browser}-v${version}.zip`;
const output = fs.createWriteStream(path.join(OUTPUT_DIR, outputFileName));
console.log(`📦 SwiftShift v${version} (${browser}) paketleniyor...`);
const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});

output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log(`✅ Paket '${outputFileName}' başarıyla oluşturuldu.`);
});

archive.on('error', function (err) {
    throw err;
});

archive.pipe(output);

// Append files from dist directory
if (fs.existsSync(DIST_DIR)) {
    archive.directory(DIST_DIR, false);
    console.log(`Packaging ${DIST_DIR} into zip...`);
    archive.finalize();
} else {
    console.error(`Error: ${DIST_DIR} does not exist. Run 'npm run build:${browser}' first.`);
}
