import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

// ESM compatibility for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const OUTPUT_DIR = path.join(__dirname, '../releases');

// Ensure releases dir exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

const output = fs.createWriteStream(path.join(OUTPUT_DIR, 'swiftshift-v0.1.0.zip'));
const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});

output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('Archiver has been finalized and the output file descriptor has closed.');
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
    console.error(`Error: ${DIST_DIR} does not exist. Run 'npm run build' first.`);
}
