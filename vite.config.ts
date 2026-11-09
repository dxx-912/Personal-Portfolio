import { createServer, defineConfig, type Plugin } from 'vite';
import { resolve } from 'node:path';
import { existsSync, readdirSync } from 'node:fs';

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

// Serve /plain (no trailing slash) in dev and preview, like Vercel does in production.
const plainRoute = (): Plugin => {
    const rewrite = (req: { url?: string }, _res: unknown, next: () => void) => {
        if (req.url === '/plain' || req.url?.startsWith('/plain?')) {
            req.url = req.url.replace('/plain', '/plain/index.html');
        }
        next();
    };
    return {
        name: 'plain-route',
        configureServer(server) { server.middlewares.use(rewrite); },
        configurePreviewServer(server) { server.middlewares.use(rewrite); }
    };
};

// Render /plain to static HTML from src/content at build time (and on each dev request).
// The plain page ships no JavaScript at all.
const plainPrerender = (): Plugin => ({
    name: 'plain-prerender',
    async transformIndexHtml(html, ctx) {
        if (!ctx.path.endsWith('/plain/index.html')) return html;
        const entry = '/src/plain/page.ts';
        let mod: { renderPlainPage: () => string };
        if (ctx.server) {
            mod = await ctx.server.ssrLoadModule(entry) as typeof mod;
        } else {
            const server = await createServer({
                configFile: false, logLevel: 'silent', appType: 'custom',
                server: { middlewareMode: true, hmr: false }
            });
            try { mod = await server.ssrLoadModule(entry) as typeof mod; }
            finally { await server.close(); }
        }
        return html.replace('<!--plain-content-->', mod.renderPlainPage());
    }
});

export default defineConfig({
    base: '/',
    plugins: [plainRoute(), plainPrerender(), decorFiles()],
    build: {
        target: 'es2020',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                plain: resolve(__dirname, 'plain/index.html')
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
