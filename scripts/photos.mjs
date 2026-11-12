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
// Slot options (scripts/photo-slots.json): "file" takes one named file instead of a folder (the headshot);
// "skip" leaves named files (or split halves, "<file>#2.png") out;
// "first" / "last" move named files to the start / end of a gallery;
// "captions" overrides a file-name caption without renaming the file;
// "crops" cuts one photo to a box of fractions [left, top, right, bottom] (e.g. to drop Instagram arrows);
// "aspect" (width / height) centre crops every image in the folder to one shape so a gallery lines up;
// "pdfPages" renders those pages (or "all") of a PDF in the folder (the L.E.K. deck); "video" compresses the MP4 in
// the folder for the web (H.264, with a poster frame); "alts" gives written alt text per file name.
// Outputs never carry metadata (sharp and ffmpeg drop EXIF, so no GPS locations are published).
//
// Folders that are empty are left alone, so a fresh clone (where originals are not in git)
// keeps the converted photos that are already committed.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
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
const IMAGE = /\.(jpe?g|png|heic|heif|webp|gif|avif|tiff?|nef|cr2|cr3|arw|dng)$/i;
const CAMERA_NAME = /^(img|dsc|dscn|pxl|screenshot|screen shot|photo|image|mvimg|whatsapp image)[\s_-]?\d/i;

const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
let converted = 0;
const warnings = [];
/** Alt text for rendered slides that have no written one: "<deck>, slide N: <slide title>". */
const pdfTitles = {};

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'photo';
/** "2 Roy and me at the meetup.jpg" -> "Roy and me at the meetup" (or null for camera names). */
const describe = (file) => {
    const name = basename(file, extname(file)).replace(/^\d+[\s._-]+/, '').replace(/[_]+/g, ' ').trim();
    return !name || CAMERA_NAME.test(name) ? null : name;
};

/** HEIC and camera RAW (NEF, CR2, ARW, DNG) need macOS sips first (sharp cannot read them). */
function readable(file, tmp) {
    if (!/\.(hei[cf]|nef|cr[23]|arw|dng)$/i.test(file)) return file;
    const out = join(tmp, `${slugify(basename(file))}.jpg`);
    execFileSync('sips', ['-s', 'format', 'jpeg', file, '--out', out], { stdio: 'ignore' });
    return out;
}

const tmp = mkdtempSync(join(tmpdir(), 'dx-photos-'));
try {
    for (const slot of slots) {
        if (slot.video) { await convertVideo(slot); continue; }
        const dir = slot.file ? inbox : join(inbox, slot.folder);
        if (!slot.file) {
            mkdirSync(dir, { recursive: true });
            if (!existsSync(join(dir, '.gitkeep'))) writeFileSync(join(dir, '.gitkeep'), '');
        }
        let files = slot.file ? (existsSync(join(dir, slot.file)) ? [slot.file] : [])
            : readdirSync(dir).filter((f) => IMAGE.test(f) && !f.startsWith('.'))
                .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        if (slot.pdfPages) files = pdfPages(dir, slot.pdfPages, slot.deck);
        if (slot.splitRows) files = (await Promise.all(files.map((f) => slot.splitRows.includes(f) ? splitRows(join(dir, f)) : [f]))).flat();
        if (slot.skip) files = files.filter((f) => !slot.skip.includes(basename(f)));
        // "first" files lead, in the order listed
        if (slot.first) files = [...slot.first.filter((f) => files.includes(f)), ...files.filter((f) => !slot.first.includes(f))];
        // "last" files go at the end, in the order listed
        if (slot.last) files = [...files.filter((f) => !slot.last.includes(f)), ...slot.last.filter((f) => files.includes(f))];
        if (!files.length) continue;
        if (slot.max && files.length > slot.max) {
            warnings.push(`"${slot.folder}" takes ${slot.max}; using the first ${slot.max} of ${files.length}.`);
            files = files.slice(0, slot.max);
        }

        if (slot.decor) {
            mkdirSync(decorDir, { recursive: true });
            const src = readable(join(dir, files[0]), tmp);
            const img = (await cropBox(sharp(src).rotate(), slot.crops?.[files[0]])).resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true });
            const out = join(decorDir, `${slot.key}.png`);
            if (slot.clearBackground) await clearBackground(img, out);
            else await img.png().toFile(out);
            converted++;
            log(`  decor  ${slot.key}.png`);
            continue;
        }

        const outDir = join(mediaDir, slot.key);
        rmSync(outDir, { recursive: true, force: true });
        mkdirSync(outDir, { recursive: true });
        const entries = [];
        for (const [i, f] of files.entries()) {
            const src = f.startsWith('/') ? f : readable(join(dir, f), tmp);
            const alt = altFor(slot, basename(f)) ?? pdfTitles[f] ?? describe(f.replace(/#\d+\.png$/, ''));
            const name = `${String(i + 1).padStart(2, '0')}-${slugify(alt ?? 'photo')}.webp`;
            const info = await (await cropToAspect(await cropBox(sharp(src).rotate(), slot.crops?.[basename(f)]), slot.aspect))
                .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
                // slides and screenshots are mostly text: a higher quality keeps them crisp
                .webp({ quality: slot.text ? 88 : 80 }).toFile(join(outDir, name));
            // the original file name (no extension), for panels that caption photos with it
            const file = slot.captions?.[basename(f)] ?? (f.startsWith('/') ? null : basename(f, extname(f)).trim());
            entries.push({ src: `/media/${slot.key}/${name}`, alt, w: info.width, h: info.height, ...(file ? { file } : {}) });
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

/** Crops to a box given as fractions of the image [left, top, right, bottom] (to cut away overlays). */
async function cropBox(img, box) {
    if (!box) return img;
    const { data, info } = await img.toBuffer({ resolveWithObject: true });
    const { width: w, height: h } = info;
    const left = Math.round(box[0] * w), top = Math.round(box[1] * h);
    return sharp(data).extract({ left, top, width: Math.round(box[2] * w) - left, height: Math.round(box[3] * h) - top });
}

/** Centre crops to a width / height ratio, trimming only the longer side. No ratio: unchanged. */
async function cropToAspect(img, aspect) {
    if (!aspect) return img;
    const { data, info } = await img.toBuffer({ resolveWithObject: true });
    const { width: w, height: h } = info;
    let cw = w, ch = h;
    if (w / h > aspect) cw = Math.round(h * aspect); else ch = Math.round(w / aspect);
    if (Math.abs(cw - w) < 2 && Math.abs(ch - h) < 2) return sharp(data);
    return sharp(data).extract({ left: Math.floor((w - cw) / 2), top: Math.floor((h - ch) / 2), width: cw, height: ch });
}

/**
 * A collage of two photos stacked top and bottom becomes two photos: cut at the sharpest row change near
 * the middle, trimming a few pixels either side of the seam. Outputs are named "<file>#1.png" and "#2.png".
 */
async function splitRows(file) {
    const src = readable(file, tmp);
    const base = sharp(src).rotate();
    const { data: grey, info } = await base.clone().greyscale().raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h } = info;
    const row = (y) => { let t = 0; for (let x = 0; x < w; x++) t += grey[y * w + x]; return t / w; };
    let seam = Math.round(h / 2), best = -1;
    for (let y = Math.floor(h * 0.4); y < h * 0.6; y++) { const d = Math.abs(row(y) - row(y - 1)); if (d > best) { best = d; seam = y; } }
    const pad = 3, name = basename(file);
    const top = join(tmp, `${name}#1.png`), bottom = join(tmp, `${name}#2.png`);
    await base.clone().extract({ left: 0, top: 0, width: w, height: seam - pad }).png().toFile(top);
    await base.clone().extract({ left: 0, top: seam + pad, width: w, height: h - seam - pad }).png().toFile(bottom);
    return [top, bottom];
}

/** Written alt text for a file; spaces are compared loosely (macOS puts a narrow space before AM/PM in screenshot names). */
function altFor(slot, name) {
    if (!slot.alts) return undefined;
    const norm = (x) => x.normalize('NFKC').replace(/\s+/g, ' ');
    const hit = Object.entries(slot.alts).find(([k]) => norm(k) === norm(name));
    return hit?.[1];
}

/** Renders the listed pages of the first PDF in a folder to PNGs (poppler's pdftoppm). Names: "page-5.png". */
function pdfPages(dir, pages, deck) {
    const pdf = readdirSync(dir).find((f) => /\.pdf$/i.test(f));
    if (!pdf) return [];
    if (pages === 'all') {
        const info = execFileSync('pdfinfo', [join(dir, pdf)]).toString();
        const count = Number(/Pages:\s+(\d+)/.exec(info)?.[1] ?? 0);
        pages = Array.from({ length: count }, (_, i) => i + 1);
    }
    const out = [];
    for (const n of pages) {
        const base = join(tmp, `page-${n}`);
        execFileSync('pdftoppm', ['-png', '-r', '170', '-f', String(n), '-l', String(n), '-singlefile', join(dir, pdf), base]);
        out.push(`${base}.png`);
        const text = execFileSync('pdftotext', ['-f', String(n), '-l', String(n), join(dir, pdf), '-']).toString();
        const title = text.split('\n').map((l) => l.trim()).find((l) => l.length > 2 && /[a-z]/i.test(l));
        pdfTitles[`${base}.png`] = `${deck ?? 'Slide deck'}, slide ${n}${title ? `: ${title}` : ''}`;
    }
    return out;
}

/** Compresses the first video in a folder for the web, with a poster frame. Skipped when already up to date. */
async function convertVideo(slot) {
    const dir = join(inbox, slot.folder);
    const file = existsSync(dir) && readdirSync(dir).find((f) => /\.(mp4|mov|m4v)$/i.test(f) && !f.startsWith('.'));
    if (!file) return;
    const outDir = join(mediaDir, slot.key);
    const out = join(outDir, 'video.mp4'), poster = join(outDir, 'poster.webp');
    const srcPath = join(dir, file);
    const fresh = existsSync(out) && existsSync(poster) && statSync(out).mtimeMs > statSync(srcPath).mtimeMs;
    if (!fresh) {
        mkdirSync(outDir, { recursive: true });
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', srcPath, '-map_metadata', '-1',
            '-vf', "scale='min(720,iw)':-2", '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-profile:v', 'high',
            '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', out]);
        const still = join(tmp, 'poster.png');
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(slot.posterAt ?? 1), '-i', out, '-frames:v', '1', still]);
        await sharp(still).webp({ quality: 80 }).toFile(poster);
        converted++;
    }
    const meta = await sharp(poster).metadata();
    manifest[slot.key] = [{ src: `/media/${slot.key}/video.mp4`, poster: `/media/${slot.key}/poster.webp`, alt: slot.alt ?? null, w: meta.width, h: meta.height }];
    log(`  video  ${slot.key}${fresh ? ' (up to date)' : ''}`);
}

/**
 * For logos saved with a fake "transparent" background (a grey and white checkerboard, or plain white, baked
 * into the pixels): flood fill from the image edges through light, colourless pixels and make them transparent.
 * The fill stops at the logo's own coloured edge, so white shapes inside the logo stay. Opt in per slot with
 * "clearBackground": true in photo-slots.json.
 */
async function clearBackground(img, out) {
    const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width: w, height: h } = info;
    const bg = (i) => {
        const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
        return Math.min(r, g, b) > 185 && Math.max(r, g, b) - Math.min(r, g, b) < 18;
    };
    const seen = new Uint8Array(w * h);
    const stack = [];
    for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
    for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
    while (stack.length) {
        const i = stack.pop();
        if (seen[i] || !bg(i)) continue;
        seen[i] = 1;
        data[i * 4 + 3] = 0;
        const x = i % w, y = (i - x) / w;
        if (x > 0) stack.push(i - 1);
        if (x < w - 1) stack.push(i + 1);
        if (y > 0) stack.push(i - w);
        if (y < h - 1) stack.push(i + w);
    }
    // checkerboard showing through cut outs inside the logo (its white glyph) becomes solid white
    for (let i = 0; i < w * h; i++) if (!seen[i] && bg(i)) data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = 255;
    // soften the cut edge: pixels touching the cleared area get partial alpha if they are light
    for (let i = 0; i < w * h; i++) {
        if (seen[i]) continue;
        const x = i % w;
        const near = (x > 0 && seen[i - 1]) || (x < w - 1 && seen[i + 1]) || (i >= w && seen[i - w]) || (i < w * (h - 1) && seen[i + w]);
        if (near && Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]) > 150) data[i * 4 + 3] = 128;
    }
    await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toFile(out);
}
