import { createServer, defineConfig, type Plugin } from 'vite';
import { resolve } from 'node:path';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

// Lists the image files Daniel has dropped into public/assets/decor/ so the game only requests
// files that exist (no 404s). Restart the dev server after adding a file.
const decorFiles = (): Plugin => {
    const id = 'virtual:decor-files';
    return {
        name: 'decor-files',
        resolveId(source) { return source === id ? '\0' + id : null; },
        load(source) {
            if (source !== '\0' + id) return null;
            const dir = resolve(__dirname, 'public/assets/decor');
            const files = existsSync(dir) ? readdirSync(dir).filter((f) => /\.(png|webp|jpe?g|gif)$/i.test(f)) : [];
            return `export default ${JSON.stringify(files)};`;
        }
    };
};

// Serve /portfolio (no trailing slash) in dev and preview like Vercel does, and redirect /plain to it.
const pageRoutes = (): Plugin => {
    const rewrite = (req: { url?: string }, res: { statusCode: number; setHeader: (k: string, v: string) => void; end: () => void }, next: () => void) => {
        if (req.url === '/plain' || req.url?.startsWith('/plain?') || req.url?.startsWith('/plain/')) {
            res.statusCode = 308;
            res.setHeader('Location', '/portfolio');
            res.end();
            return;
        }
        if (req.url === '/portfolio' || req.url?.startsWith('/portfolio?')) {
            req.url = req.url.replace('/portfolio', '/portfolio/index.html');
        }
        if (req.url === '/fonts' || req.url?.startsWith('/fonts?')) {
            req.url = req.url.replace('/fonts', '/fonts/index.html');
        }
        next();
    };
    return {
        name: 'plain-route',
        configureServer(server) { server.middlewares.use(rewrite); },
        configurePreviewServer(server) { server.middlewares.use(rewrite); }
    };
};

// Lists the music files in public/assets/audio/lofi and featured (Daniel drops MP3s there).
// Warns at build time about files missing from CREDITS.md. Empty folders are fine.
const audioFiles = (): Plugin => {
    const id = 'virtual:audio-files';
    const AUDIO = /\.(mp3|m4a|aac|ogg|oga|opus|wav|flac)$/i;
    const list = (dir: string) => {
        const d = resolve(__dirname, 'public/assets/audio', dir);
        return existsSync(d) ? readdirSync(d).filter((f) => AUDIO.test(f)).sort() : [];
    };
    return {
        name: 'audio-files',
        resolveId(source) { return source === id ? '\0' + id : null; },
        load(source) {
            if (source !== '\0' + id) return null;
            const files = { lofi: list('lofi'), featured: list('featured') };
            const creditsPath = resolve(__dirname, 'public/assets/audio/CREDITS.md');
            const credits = existsSync(creditsPath) ? readFileSync(creditsPath, 'utf8') : '';
            [...files.lofi.map((f) => `lofi/${f}`), ...files.featured.map((f) => `featured/${f}`)]
                .filter((f) => !credits.includes(f))
                .forEach((f) => this.warn(`${f} is not listed in public/assets/audio/CREDITS.md`));
            return `export default ${JSON.stringify(files)};`;
        }
    };
};

// Render /portfolio to static HTML from src/content at build time (and on each dev request).
// Production builds hide [TODO] text and list every remaining TODO in the build log.
const portfolioPrerender = (): Plugin => ({
    name: 'portfolio-prerender',
    async transformIndexHtml(html, ctx) {
        const fontsPage = ({ '/fonts/index.html': 'renderFontsIndex', '/fonts/game.html': 'renderFontsGame', '/fonts/quick.html': 'renderFontsQuick' } as Record<string, string>)[ctx.path];
        if (!ctx.path.endsWith('/portfolio/index.html') && !fontsPage) return html;
        const entry = fontsPage ? '/src/fonts/page.ts' : '/src/portfolio/page.ts';
        type Mod = { renderPortfolio: (o: { production: boolean }) => { head: string; body: string; todos: string[] } } & Record<string, () => string>;
        let mod: Mod;
        if (ctx.server) {
            mod = await ctx.server.ssrLoadModule(entry) as Mod;
        } else {
            const server = await createServer({
                configFile: false, logLevel: 'silent', appType: 'custom', plugins: [decorFiles()],
                server: { middlewareMode: true, hmr: false }
            });
            try { mod = await server.ssrLoadModule(entry) as Mod; }
            finally { await server.close(); }
        }
        if (fontsPage) return html.replace('<!--fonts-content-->', mod[fontsPage]());
        const production = !ctx.server;
        const out = mod.renderPortfolio({ production });
        if (production && out.todos.length) {
            const unique = [...new Set(out.todos)];
            console.log(`\n[portfolio] ${unique.length} TODOs hidden in the production build (see TODO_ASSETS.md):`);
            unique.forEach((x) => console.log(`  - ${x}`));
        }
        return html.replace('<!--portfolio-head-->', out.head).replace('<!--portfolio-content-->', out.body);
    }
});

export default defineConfig({
    base: '/',
    plugins: [pageRoutes(), portfolioPrerender(), decorFiles(), audioFiles()],
    build: {
        target: 'es2020',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                portfolio: resolve(__dirname, 'portfolio/index.html'),
                plain: resolve(__dirname, 'plain/index.html'),
                fonts: resolve(__dirname, 'fonts/index.html'),
                fontsGame: resolve(__dirname, 'fonts/game.html'),
                fontsQuick: resolve(__dirname, 'fonts/quick.html')
            },
            output: {
                manualChunks: { phaser: ['phaser'] }
            }
        },
        minify: 'terser',
        terserOptions: { compress: { passes: 2 }, format: { comments: false } },
        chunkSizeWarningLimit: 1500
    },
    server: { port: 8080 }
});
