// Records real footage of the running app for the launch film.
//
//   node capture/record.mjs --login        open a window and sign in yourself once
//   node capture/record.mjs <shot> [...]   record shots (see shots.mjs)
//   node capture/record.mjs --all          record every shot
//
// Chrome's screencast captures at device pixels (1440x900 at 3x = 4320x2700),
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
// Playwright's bundled "Chrome for Testing" crashed on launch on macOS
// (SIGBUS BUS_ADRALN) when opened as a window, so the installed Google Chrome
// is the default. CAPTURE_BROWSER=chromium switches back to the bundled one.
// Each browser keeps its own profile: a profile written by one Chrome build
// can fail to open in another.
const BROWSER = process.env.CAPTURE_BROWSER || 'chrome';
const PROFILE = path.join(here, '..', BROWSER === 'chromium' ? '.capture-profile' : `.capture-profile-${BROWSER}`);
const OUT = path.join(here, '..', 'public', 'clips');
const BASE = process.env.APP_URL || 'http://localhost:3000';
const VIEWPORT = { width: 1440, height: 900 };
const FPS = 60;
// Device pixels per CSS pixel. 3 gives the 4K master footage it never has to upscale.
const SCALE = Number(process.env.CAPTURE_SCALE || 3);
const W = VIEWPORT.width * SCALE, H = VIEWPORT.height * SCALE;

const open = () => chromium.launchPersistentContext(PROFILE, {
  ...(BROWSER === 'chromium' ? {} : { channel: BROWSER }),
  headless: false,
  viewport: VIEWPORT,
  deviceScaleFactor: SCALE,
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
  // The film is dark; the app reads its theme from localStorage before render.
  await ctx.addInitScript(() => localStorage.setItem('apex-scholar-theme', 'dark'));
  const page = ctx.pages()[0] || await ctx.newPage();
  // Not 'networkidle': Firestore's listen channel keeps the network busy forever.
  await page.goto(`${BASE}${shot.url}`, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await shot.prepare?.(page);

  const frameDir = path.join(here, 'frames', name);
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });
  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  // Ack first, then write without waiting: acking only after a large image hit
  // the disk made Chrome drop most frames of every movement, and holding them all
  // in memory ran out of it on long takes (a 100 s FRQ grade is ~5,000 frames).
  const writes = [];
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
    const file = path.join(frameDir, `${String(frames.length).padStart(5, '0')}.jpg`);
    frames.push({ file, t: metadata.timestamp });
    writes.push(fs.promises.writeFile(file, Buffer.from(data, 'base64')));
  });

  const events = [];
  const t0 = Date.now() / 1000;
  const log = (type, extra) => events.push({ type, t: Date.now() / 1000 - t0, ...extra });
  // Actions the shots use: they record where and when, for the cursor layer.
  const act = {
    page,
    wait: (ms) => page.waitForTimeout(ms),
    // Every click and typed field gets a still beat before (the drawn cursor
    // glides in while nothing moves) and after (the result can be read).
    async click(selector) {
      const el = page.locator(selector).first();
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      const box = await el.boundingBox();
      if (box) log('click', { x: box.x + box.width / 2, y: box.y + box.height / 2 });
      await el.click();
      await page.waitForTimeout(500);
    },
    async type(selector, text, delay = 90) {
      const el = page.locator(selector).first();
      await page.waitForTimeout(600);
      const box = await el.boundingBox();
      if (box) log('type', { x: box.x + 24, y: box.y + box.height / 2, text });
      await el.click();
      await page.keyboard.type(text, { delay });
      await page.waitForTimeout(500);
    },
    async scroll(dy, ms = 3000) {
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
    async hover(selector, ms = 600) {
      const box = await page.locator(selector).first().boundingBox();
      if (box) log('move', { x: box.x + box.width / 2, y: box.y + box.height / 2 });
      await page.locator(selector).first().hover();
      await page.waitForTimeout(ms);
    },
    // Drags a range input's thumb to `value` over `ms`, like a hand would.
    async drag(selector, value, ms = 1200) {
      const el = page.locator(selector).first();
      const { min, max, cur } = await el.evaluate((i) => ({ min: +i.min || 0, max: +(i.max || 100), cur: +i.value }));
      const box = await el.boundingBox();
      const xAt = (v) => box.x + 8 + ((v - min) / (max - min)) * (box.width - 16);
      const y = box.y + box.height / 2;
      const steps = Math.max(10, Math.round(ms / 16));
      log('drag', { x: xAt(cur), y, toX: xAt(value), ms });
      const ev = events[events.length - 1]; const began = Date.now();
      await page.mouse.move(xAt(cur), y);
      await page.mouse.down();
      for (let i = 1; i <= steps; i++) {
        const k = i / steps; const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
        await page.mouse.move(xAt(cur) + (xAt(value) - xAt(cur)) * e, y);
        await page.waitForTimeout(ms / steps);
      }
      await page.mouse.up();
      ev.ms = Date.now() - began; // repaints slow the moves; the cursor layer needs the real length

    },
    // Smooth-scrolls until `selector` sits `offset` px below the top of the viewport.
    async scrollTo(selector, ms = 1200, offset = 140) {
      const top = await page.locator(selector).first().evaluate((e) => e.getBoundingClientRect().top);
      await this.scroll(top - offset, ms);
    },
  };

  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, everyNthFrame: 1, maxWidth: W, maxHeight: H });
  await page.waitForTimeout(400);
  try {
    await shot.run(act);
  } catch (e) {
    // Leave evidence of where it stopped.
    await page.screenshot({ path: path.join(here, 'frames', `${name}-error.png`) }).catch(() => {});
    await ctx.close();
    throw e;
  }
  await page.waitForTimeout(600);
  await cdp.send('Page.stopScreencast');
  // Frames only arrive on repaints, so a still ending would be cut at the last one.
  const tEnd = Date.now() / 1000;
  await ctx.close();

  if (frames.length < 2) throw new Error(`Only ${frames.length} frame(s) captured for ${name}`);
  await Promise.all(writes);
  // Hold each frame until the next one arrived, then resample to 60 fps.
  const list = frames.map((f, i) => {
    const dur = i + 1 < frames.length ? Math.max(1 / FPS, frames[i + 1].t - f.t) : Math.max(0.5, tEnd - f.t);
    return `file '${f.file}'\nduration ${dur.toFixed(4)}`;
  }).join('\n') + `\nfile '${frames[frames.length - 1].file}'\n`;
  const listFile = path.join(frameDir, 'list.txt');
  fs.writeFileSync(listFile, list);
  const mp4 = path.join(OUT, `${name}.mp4`);
  const ff = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-vf', `fps=${FPS},scale=${W}:${H}:flags=lanczos,format=yuv420p`, '-c:v', 'libx264', '-crf', '14', '-preset', 'slow', mp4]);
  if (ff.status !== 0) throw new Error(ff.stderr.toString());
  // Event times are from t0; the clip starts at the first frame, so shift them.
  const lag = frames[0].t - t0;
  const duration = Math.max(tEnd, frames[frames.length - 1].t + 0.5) - frames[0].t;
  fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify({
    viewport: VIEWPORT, scale: SCALE, fps: FPS, duration,
    events: events.map((e) => ({ ...e, t: e.t - lag })),
  }, null, 2));
  console.log(`${name}: ${frames.length} frames -> ${path.relative(process.cwd(), mp4)}`);
}

const args = process.argv.slice(2);
if (args[0] === '--login') await login();
else for (const name of (args[0] === '--all' ? Object.keys(SHOTS) : args)) await record(name);
