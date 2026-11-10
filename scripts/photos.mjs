// npm run photos
//
// Turns the photos dropped into photos/ into web-ready images and wires them into the site.
// - Creates any missing drop folders (one per photo the site needs, see scripts/photo-slots.json).
// - Converts each photo (JPG, PNG, HEIC from an iPhone, WebP...) to WebP, at most 1600px on the
//   long edge, rotated the right way up, into public/media/<slot>/.
// - Room decor images become small PNGs in public/assets/decor/ (the game draws them in the room).
// - Writes src/content/media.json, which the game and the portfolio view read.
//
// A file's name becomes its description (alt text), so name photos for what they show,
// e.g. "Roy and me at the first meetup.jpg". Start names with 1, 2, 3 to set the order.
// Camera names like IMG_1234 fall back to a generic description.
//
// Folders that are empty are left alone, so a fresh clone (where originals are not in git)
// keeps the converted photos that are already committed.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const quiet = process.argv.includes('--quiet');
const log = (...a) => { if (!quiet) console.log(...a); };
const { slots } = JSON.parse(readFileSync(join(root, 'scripts/photo-slots.json'), 'utf8'));
const inbox = join(root, 'photos');
const mediaDir = join(root, 'public/media');
const decorDir = join(root, 'public/assets/decor');
const manifestPath = join(root, 'src/content/media.json');
const IMAGE = /\.(jpe?g|png|heic|heif|webp|gif|avif|tiff?)$/i;
const CAMERA_NAME = /^(img|dsc|dscn|pxl|screenshot|screen shot|photo|image|mvimg|whatsapp image)[\s_-]?\d/i;

const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
let converted = 0;
const warnings = [];

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'photo';
/** "2 Roy and me at the meetup.jpg" -> "Roy and me at the meetup" (or null for camera names). */
const describe = (file) => {
    const name = basename(file, extname(file)).replace(/^\d+[\s._-]+/, '').replace(/[_]+/g, ' ').trim();
    return !name || CAMERA_NAME.test(name) ? null : name;
};

/** HEIC needs macOS sips first (sharp cannot read it). */
function readable(file, tmp) {
    if (!/\.hei[cf]$/i.test(file)) return file;
    const out = join(tmp, `${slugify(basename(file))}.jpg`);
    execFileSync('sips', ['-s', 'format', 'jpeg', file, '--out', out], { stdio: 'ignore' });
    return out;
}

const tmp = mkdtempSync(join(tmpdir(), 'dx-photos-'));
try {
    for (const slot of slots) {
        const dir = join(inbox, slot.folder);
        mkdirSync(dir, { recursive: true });
        if (!existsSync(join(dir, '.gitkeep'))) writeFileSync(join(dir, '.gitkeep'), '');
        let files = readdirSync(dir).filter((f) => IMAGE.test(f) && !f.startsWith('.'))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        if (!files.length) continue;
        if (slot.max && files.length > slot.max) {
            warnings.push(`"${slot.folder}" takes ${slot.max}; using the first ${slot.max} of ${files.length}.`);
            files = files.slice(0, slot.max);
        }

        if (slot.decor) {
            mkdirSync(decorDir, { recursive: true });
            const src = readable(join(dir, files[0]), tmp);
            await sharp(src).rotate().resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true }).png().toFile(join(decorDir, `${slot.key}.png`));
            converted++;
            log(`  decor  ${slot.key}.png`);
            continue;
        }

        const outDir = join(mediaDir, slot.key);
        rmSync(outDir, { recursive: true, force: true });
        mkdirSync(outDir, { recursive: true });
        const entries = [];
        for (const [i, f] of files.entries()) {
            const src = readable(join(dir, f), tmp);
            const name = `${String(i + 1).padStart(2, '0')}-${slugify(describe(f) ?? 'photo')}.webp`;
            const info = await sharp(src).rotate()
                .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 }).toFile(join(outDir, name));
            entries.push({ src: `/media/${slot.key}/${name}`, alt: describe(f), w: info.width, h: info.height });
            converted++;
        }
        manifest[slot.key] = entries;
        log(`  photos ${slot.key}: ${entries.length}`);
    }
} finally {
    rmSync(tmp, { recursive: true, force: true });
}

// drop manifest entries whose files are gone
for (const [key, list] of Object.entries(manifest)) {
    const kept = list.filter((e) => existsSync(join(root, 'public', e.src)));
    if (kept.length) manifest[key] = kept; else delete manifest[key];
}
const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]));
writeFileSync(manifestPath, `${JSON.stringify(sorted, null, 4)}\n`);

warnings.forEach((w) => console.warn(`  note: ${w}`));
const filled = Object.keys(sorted).length;
const needed = slots.filter((s) => !s.decor).length;
log(`Photos: converted ${converted} file(s). ${filled} of ${needed} photo spots filled.${converted ? ' Restart npm run dev to see them.' : ''}`);
