// Walk speed regression test (iteration 5, group A).
// Walks a fixed loop in the dorm several times under conditions that used to slow Daniel down
// (low frame rate, unfocused window, just after focus returns) and checks the real time taken.
// Run: npm run test:walk   (needs Google Chrome installed; starts its own Vite server)

import { createServer } from 'vite';
import { chromium } from 'playwright-core';

const WALK_SPEED = 72; // px per second, src/config.ts
const TOLERANCE = 0.12; // allowed shortfall: corners, key latency, polling
const LAPS = 3;
// a rectangle on open carpet below the beanbag and above the bed, in world pixels
const START = { x: 56, y: 142 };
const LEGS = [['ArrowRight', 'x', 120], ['ArrowDown', 'y', 16], ['ArrowLeft', 'x', -120], ['ArrowUp', 'y', -16]];

const server = await createServer({ server: { port: 5199, strictPort: false }, logLevel: 'error' });
await server.listen();
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const cdp = await page.context().newCDPSession(page);
let failed = false;

try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__game?.scene.getScene('Room')?.player, null, { timeout: 30000 });
    await page.evaluate(() => { const s = window.__game.scene.getScene('Room'); if (s.sleeping) s.wake(); });
    await page.waitForFunction(() => { const s = window.__game.scene.getScene('Room'); return !s.sleeping && !s.busy; }, null, { timeout: 15000 });

    const pos = () => page.evaluate(() => { const s = window.__game.scene.getScene('Room'); return { x: s.player.x, y: s.player.y }; });

    /** One lap of the rectangle; returns real seconds and the ideal seconds at WALK_SPEED. */
    async function lap() {
        await page.evaluate((p) => { const s = window.__game.scene.getScene('Room'); s.player.cancelPath(); s.player.teleport(p.x, p.y); }, START);
        await page.waitForTimeout(100);
        let dist = 0;
        const t0 = Date.now();
        for (const [key, axis, d] of LEGS) {
            const from = (await pos())[axis];
            await page.keyboard.down(key);
            await page.waitForFunction(([axis, goal, dir]) => {
                const p = window.__game.scene.getScene('Room').player;
                return dir > 0 ? p[axis] >= goal : p[axis] <= goal;
            }, [axis, from + d, Math.sign(d)], { polling: 'raf', timeout: 20000 });
            await page.keyboard.up(key);
            dist += Math.abs(d);
        }
        return { real: (Date.now() - t0) / 1000, ideal: dist / WALK_SPEED };
    }

    async function run(label, setup) {
        await setup?.();
        const fps0 = await page.evaluate(() => window.__game.loop.frame);
        const t0 = Date.now();
        const times = [];
        for (let i = 0; i < LAPS; i++) times.push(await lap());
        const fps = ((await page.evaluate(() => window.__game.loop.frame)) - fps0) / ((Date.now() - t0) / 1000);
        const worst = times.reduce((a, b) => (b.real / b.ideal > a.real / a.ideal ? b : a));
        const speed = WALK_SPEED * worst.ideal / worst.real;
        const ok = speed >= WALK_SPEED * (1 - TOLERANCE);
        if (!ok) failed = true;
        console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(34)} laps ${times.map((t) => t.real.toFixed(2) + 's').join(' ')}  ` +
            `(ideal ${worst.ideal.toFixed(2)}s)  slowest ${speed.toFixed(0)} px/s  ~${fps.toFixed(0)} fps`);
    }

    await run('focused, normal CPU');
    await run('focused, CPU slowed x6', () => cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 }));
    await run('window unfocused, CPU slowed x6', () => page.evaluate(() => window.__game.events.emit('blur')));
    await run('focus just regained, CPU slowed x6', () => page.evaluate(() => window.__game.events.emit('focus')));
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await run('focused again, normal CPU');
} catch (e) {
    failed = true;
    console.error(e);
} finally {
    await browser.close();
    await server.close();
}
process.exit(failed ? 1 : 0);
