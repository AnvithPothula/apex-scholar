// Records real footage of the running app for the launch film.
//
//   node capture/record.mjs --login        open a window and sign in yourself once
//   node capture/record.mjs <shot> [...]   record shots (see shots.mjs)
//   node capture/record.mjs --all          record every shot
//
// Chrome's screencast captures at device pixels (1440x900 at 2x = 2880x1800),
// so the film can push in on a detail without going soft. Frames arrive only
// when the page repaints; ffmpeg rebuilds a constant 60 fps clip from their
// timestamps. Clicks are logged to <shot>.json so Remotion can draw a smooth
// cursor on top (the real cursor is never in the capture).
import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SHOTS } from './shots.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const PROFILE = path.join(here, '..', '.capture-profile');
const OUT = path.join(here, '..', 'public', 'clips');
const BASE = process.env.APP_URL || 'http://localhost:3000';
const VIEWPORT = { width: 1440, height: 900 };
const FPS = 60;

const open = () => chromium.launchPersistentContext(PROFILE, {
  headless: false,
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
  colorScheme: 'dark',
  args: ['--hide-scrollbars'],
});

async function login() {
  const ctx = await open();
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto(`${BASE}/login`);
  console.log('Sign in in the window that opened, then close it.');
  await new Promise((r) => ctx.on('close', r));
}

async function record(name) {
  const shot = SHOTS[name];
  if (!shot) throw new Error(`No shot "${name}". Shots: ${Object.keys(SHOTS).join(', ')}`);
  const ctx = await open();
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto(`${BASE}${shot.url}`, { waitUntil: 'networkidle' });
  await shot.prepare?.(page);

  const frameDir = path.join(here, 'frames', name);
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });
  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  // Ack first and keep frames in memory: acking only after writing a large
  // image to disk made Chrome wait and drop most frames of every movement.
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
    frames.push({ data, t: metadata.timestamp });
  });

  const events = [];
  const t0 = Date.now() / 1000;
  const log = (type, extra) => events.push({ type, t: Date.now() / 1000 - t0, ...extra });
  // Actions the shots use: they record where and when, for the cursor layer.
  const act = {
    page,
    wait: (ms) => page.waitForTimeout(ms),
    async click(selector) {
      const box = await page.locator(selector).first().boundingBox();
      if (box) log('click', { x: box.x + box.width / 2, y: box.y + box.height / 2 });
      await page.locator(selector).first().click();
    },
    async type(selector, text, delay = 55) {
      const box = await page.locator(selector).first().boundingBox();
      if (box) log('type', { x: box.x + 24, y: box.y + box.height / 2, text });
      await page.locator(selector).first().click();
      await page.keyboard.type(text, { delay });
    },
    async scroll(dy, ms = 1200) {
      log('scroll', { dy });
      await page.evaluate(({ dy, ms }) => new Promise((done) => {
        // The app scrolls an inner panel, not always the window: use whichever
        // element actually scrolls and is largest.
        const scrollers = [document.scrollingElement, ...document.querySelectorAll('*')]
          .filter((el) => el && el.scrollHeight > el.clientHeight + 40
            && (el === document.scrollingElement || /(auto|scroll)/.test(getComputedStyle(el).overflowY)));
        const el = scrollers.sort((a, b) => b.clientHeight * b.clientWidth - a.clientHeight * a.clientWidth)[0] || document.scrollingElement;
        const start = el.scrollTop; const t = performance.now();
        const step = (now) => {
          const k = Math.min(1, (now - t) / ms);
          el.scrollTop = start + dy * (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
          if (k < 1) requestAnimationFrame(step); else done();
        };
        requestAnimationFrame(step);
      }), { dy, ms });
    },
  };

  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, everyNthFrame: 1, maxWidth: 2880, maxHeight: 1800 });
  await page.waitForTimeout(400);
  await shot.run(act);
  await page.waitForTimeout(600);
  await cdp.send('Page.stopScreencast');
  await ctx.close();

  if (frames.length < 2) throw new Error(`Only ${frames.length} frame(s) captured for ${name}`);
  frames.forEach((f, i) => {
    f.file = path.join(frameDir, `${String(i).padStart(5, '0')}.jpg`);
    fs.writeFileSync(f.file, Buffer.from(f.data, 'base64'));
  });
  // Hold each frame until the next one arrived, then resample to 60 fps.
  const list = frames.map((f, i) => {
    const dur = i + 1 < frames.length ? Math.max(1 / FPS, frames[i + 1].t - f.t) : 0.5;
    return `file '${f.file}'\nduration ${dur.toFixed(4)}`;
  }).join('\n') + `\nfile '${frames[frames.length - 1].file}'\n`;
  const listFile = path.join(frameDir, 'list.txt');
  fs.writeFileSync(listFile, list);
  const mp4 = path.join(OUT, `${name}.mp4`);
  const ff = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-vf', `fps=${FPS},scale=2880:1800:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-crf', '14', '-preset', 'slow', mp4]);
  if (ff.status !== 0) throw new Error(ff.stderr.toString());
  fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify({ viewport: VIEWPORT, scale: 2, fps: FPS, events }, null, 2));
  console.log(`${name}: ${frames.length} frames -> ${path.relative(process.cwd(), mp4)}`);
}

const args = process.argv.slice(2);
if (args[0] === '--login') await login();
else for (const name of (args[0] === '--all' ? Object.keys(SHOTS) : args)) await record(name);
