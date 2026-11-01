// The 16:9 hero film: one dark stage, real app footage in a window the camera
// moves around, word-by-word headlines and a cursor rebuilt from the clicks the
// recorder logged. Text and timing live in beats.ts.
import React from "react";
import {
  AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, interpolate,
  spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { LogoMark } from "../brand/Logo";
import { fontFamilyBody, fontFamilyDisplay } from "../brand/fonts";
import { BEAT, BEATS, Beat, Cam, FILM_SECONDS, From, LEGAL } from "./beats";

export const FPS = 60;
export const FILM_FRAMES = Math.round(FILM_SECONDS * FPS);
const MUSIC = "music/close-up.mp3";

// The window the footage plays in, and the page it shows (CSS px).
const WIN = { x: 160, y: 250, w: 1600, h: 790 };
const PAGE = { w: 1440, h: 900 };
// Clip-to-clip cross-dissolve: the outgoing clip keeps playing underneath while
// the incoming one fades in over it and settles.
const XF = Math.round(0.3 * FPS);

type ClipMeta = { duration: number; events: { type: string; t: number; x?: number; y?: number; toX?: number; ms?: number }[] };
// `endSub` swaps the end card's subline, only for rendering a proposed-wording variant.
export type FilmProps = { clips: Record<string, ClipMeta>; endSub?: string };

const ease = Easing.bezier(0.45, 0, 0.2, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Clip time a beat starts at: seconds, or `lead` s before the clip's ev-th logged event. */
function resolveFrom(from: From | undefined, meta?: ClipMeta) {
  if (from == null) return 0;
  if (typeof from === "number") return from;
  const e = meta?.events[from.ev];
  return e ? Math.max(0, e.t - from.lead) : 0;
}

/** Camera at progress p: scale and translate of the page inside the window. */
function camera(path: Cam[], p: number) {
  const i = Math.max(0, path.findIndex((k, j) => p <= k.at && j > 0) - 1);
  const a = path[i]; const b = path[Math.min(i + 1, path.length - 1)];
  const k = b.at === a.at ? 1 : ease(Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at))));
  const zoom = a.zoom + (b.zoom - a.zoom) * k;
  const x = a.x + (b.x - a.x) * k; const y = a.y + (b.y - a.y) * k;
  const s = (WIN.w / PAGE.w) * zoom;
  const tx = Math.min(0, Math.max(WIN.w - PAGE.w * s, WIN.w / 2 - x * s));
  const ty = Math.min(0, Math.max(WIN.h - PAGE.h * s, WIN.h / 2 - y * s));
  return { s, tx, ty };
}

/** Cursor position at clip time t, gliding into each logged click or drag. */
function cursorAt(events: ClipMeta["events"], t: number) {
  const pts = events.filter((e) => e.x != null);
  if (!pts.length) return null;
  let pos = { x: pts[0].x!, y: pts[0].y! };
  let press = -1;
  for (let i = 0; i < pts.length; i++) {
    const e = pts[i];
    const arrive = 0.55;
    if (t < e.t - arrive) break;
    if (t < e.t) {
      const k = ease((t - (e.t - arrive)) / arrive);
      pos = { x: pos.x + (e.x! - pos.x) * k, y: pos.y + (e.y! - pos.y) * k };
      break;
    }
    pos = { x: e.x!, y: e.y! };
    if (e.type === "click") press = t - e.t;
    if (e.type === "drag" && e.toX != null) {
      const k = ease(Math.min(1, (t - e.t) / ((e.ms || 1000) / 1000)));
      pos = { x: e.x! + (e.toX - e.x!) * k, y: e.y! };
    }
  }
  return { ...pos, press };
}

// Drawn inside the camera layer so it tracks the page; `k` undoes the zoom so
// it stays one size on screen.
const Cursor: React.FC<{ x: number; y: number; press: number; k: number }> = ({ x, y, press, k }) => {
  const down = press >= 0 && press < 0.12;
  const ring = press >= 0 && press < 0.35 ? press / 0.35 : null;
  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none", transform: `scale(${k})`, transformOrigin: "0 0" }}>
      {ring != null && (
        <div style={{
          position: "absolute", left: -22, top: -22, width: 44, height: 44, borderRadius: 22,
          border: "3px solid rgba(45,212,191,0.9)", transform: `scale(${0.4 + ring})`, opacity: 1 - ring,
        }} />
      )}
      <svg width="30" height="30" viewBox="0 0 24 24" style={{ transform: `scale(${down ? 0.85 : 1})`, transformOrigin: "0 0", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
        <path d="M3 2l7.5 19 2.6-7.9L21 10.5z" fill="#fff" stroke="#111" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** Words rise in one after another; "/" swaps to the next line partway through. */
const Headline: React.FC<{ text: string; sub?: string; frames: number; size?: number; center?: boolean; step?: number }> = ({ text, sub, frames, size = 68, center, step = BEAT / 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const parts = text.split("/").map((s) => s.trim()).filter(Boolean);
  const slot = frames / parts.length;
  const idx = Math.min(parts.length - 1, Math.floor(frame / slot));
  const local = frame - idx * slot;
  const words = parts[idx].split(" ");
  return (
    <div style={{ textAlign: center ? "center" : "left" }}>
      <div style={{ fontFamily: fontFamilyDisplay, fontWeight: 700, fontSize: size, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        {words.map((w, i) => {
          // Each word lands on the next sixteenth note of the track.
          const s = spring({ frame: local - Math.round(i * step * fps), fps, config: { damping: 200 }, durationInFrames: Math.round(fps * 0.4) });
          return (
            <span key={`${idx}-${i}`} style={{ display: "inline-block", marginRight: "0.25em", opacity: s, transform: `translateY(${(1 - s) * 18}px)`, filter: `blur(${(1 - s) * 6}px)` }}>{w}</span>
          );
        })}
      </div>
      {sub && (
        <div style={{
          fontFamily: fontFamilyBody, fontSize: 36, color: "#aab4c3", marginTop: 14,
          opacity: interpolate(frame, [fps * 0.35, fps * 0.75], [0, 1], clamp),
        }}>{sub}</div>
      )}
    </div>
  );
};

const Stage: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: "radial-gradient(1300px 760px at 50% 40%, #0b1117 0%, #040608 60%, #000 100%)" }}>
    {children}
  </AbsoluteFill>
);

type Edge = "clip" | "card";

const ClipBeat: React.FC<{ beat: Beat; frames: number; meta?: ClipMeta; prev: Edge; next: Edge }> = ({ beat, frames, meta, prev, next }) => {
  const frame = useCurrentFrame();
  // Footage always plays at real speed: speeding it up read as choppy.
  const from = resolveFrom(beat.from, meta);
  const t = from + frame / FPS;
  const cam = camera(beat.cam || [{ at: 0, zoom: 1, x: 720, y: 450 }], Math.min(1, frame / frames));
  const cur = meta && cursorAt(meta.events, t);
  // In: fade up and settle (bigger on a chapter downbeat). Out: only when a title
  // card follows; between clips the next one dissolves in on top of this one.
  const k = interpolate(frame, [0, XF], [0, 1], { ...clamp, easing: ease });
  const lift = beat.chapter ? 0.05 : 0.015;
  const fadeOut = next === "card" ? interpolate(frame, [frames, frames + XF], [1, 0], { ...clamp, easing: ease }) : 1;
  const opacity = (prev === "clip" || prev === "card" ? k : 1) * fadeOut;
  const scale = 1 + (1 - k) * lift;
  const blur = (1 - k) * (beat.chapter ? 10 : 6);
  // A soft glow behind the window that flares on chapter downbeats.
  const glow = beat.chapter ? interpolate(frame, [0, 0.25 * FPS, 1.4 * FPS], [0, 1, 0], clamp) : 0;
  return (
    <>
      {glow > 0 && (
        <div style={{
          position: "absolute", left: WIN.x - 200, top: WIN.y - 160, width: WIN.w + 400, height: WIN.h + 320,
          background: "radial-gradient(closest-side, rgba(45,212,191,0.22), rgba(59,130,246,0.08) 60%, transparent)",
          opacity: glow,
        }} />
      )}
      <div style={{
        position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, overflow: "hidden",
        borderRadius: 18, border: "1px solid rgba(255,255,255,0.10)", background: "#0a0a0a",
        boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.6)",
        opacity, transform: `scale(${scale})`, filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: PAGE.w, height: PAGE.h, transformOrigin: "0 0", transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})` }}>
          <OffthreadVideo src={staticFile(`clips/${beat.clip}.mp4`)} trimBefore={Math.round(from * FPS)} muted style={{ width: PAGE.w, height: PAGE.h }} />
          {cur && <Cursor x={cur.x} y={cur.y} press={cur.press} k={1.25 / cam.s} />}
        </div>
      </div>
      {/* A soft click under each cursor press, quiet under the music. */}
      {(meta?.events || []).filter((e) => e.type === "click" && e.t >= from && e.t < from + frames / FPS).map((e) => (
        <Sequence key={e.t} from={Math.round((e.t - from) * FPS)} durationInFrames={Math.round(0.1 * FPS)} layout="none">
          <Audio src={staticFile("sfx/click.wav")} volume={0.32} />
        </Sequence>
      ))}
      {beat.photo && frame < frames && (() => {
        // The paper drops in big, then shrinks into the answer box as the upload lands.
        const drop = spring({ frame, fps: FPS, config: { damping: 16, stiffness: 90 } });
        const away = interpolate(frame, [frames * 0.3, frames * 0.5], [0, 1], { ...clamp, easing: ease });
        return (
          <Img src={staticFile(beat.photo)} style={{
            position: "absolute", left: 960 - 420, top: 300, width: 840, borderRadius: 6,
            border: "10px solid #fff", boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
            transformOrigin: "30% 80%",
            transform: `translate(${away * -260}px, ${(1 - drop) * 500 + away * 260}px) rotate(${-4 + away * 4}deg) scale(${1 - away * 0.75})`,
            opacity: 1 - away,
          }} />
        );
      })()}
      {/* The headline leaves with its beat; the next one's words arrive on the beat. */}
      <div style={{ position: "absolute", left: WIN.x, top: 70, width: WIN.w, opacity: interpolate(frame, [frames - 0.12 * FPS, frames], [1, 0], clamp) }}>
        {beat.headline ? <Headline text={beat.headline} sub={beat.sub} frames={frames} /> : <Headline text={beat.sub!} frames={frames} size={52} />}
      </div>
    </>
  );
};

const CardBeat: React.FC<{ beat: Beat; frames: number }> = ({ beat, frames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const big = beat.card === "logo" || beat.card === "end";
  // The mark lands on the downbeat with a quick overshoot, and a flare behind it.
  const logo = spring({ frame, fps, config: { damping: 11, stiffness: 140 } });
  const flare = interpolate(frame, [0, 0.15 * fps, 1.6 * fps], [0, 1, 0], clamp);
  const fade = interpolate(frame, [0, XF], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 36, opacity: fade }}>
      {big && (
        <div style={{
          position: "absolute", width: 900, height: 900, borderRadius: 450, opacity: flare * 0.9,
          background: "radial-gradient(closest-side, rgba(45,212,191,0.35), rgba(59,130,246,0.12) 55%, transparent)",
          transform: `scale(${0.6 + flare * 0.5})`,
        }} />
      )}
      {big && (
        <div style={{ opacity: Math.min(1, logo * 1.4), transform: `scale(${0.55 + logo * 0.45})` }}>
          <LogoMark size={beat.card === "end" ? 160 : 140} />
        </div>
      )}
      <Headline text={beat.headline!} sub={beat.card === "end" ? undefined : beat.sub} frames={frames} size={beat.card === "end" ? 104 : 84} center step={BEAT / 2} />
      {beat.card === "end" && beat.sub && (() => {
        // Same words as the script; the address gets its own line so it can be read and remembered.
        const [courses, url] = beat.sub.split(/(?<=\.)\s+/);
        const show = interpolate(frame, [0.45 * fps, 0.9 * fps], [0, 1], { ...clamp, easing: ease });
        return (
          <div style={{ textAlign: "center", opacity: show, transform: `translateY(${(1 - show) * 14}px)` }}>
            <div style={{ fontFamily: fontFamilyBody, fontSize: 38, color: "#aab4c3" }}>{courses}</div>
            <div style={{ fontFamily: fontFamilyDisplay, fontWeight: 700, fontSize: 58, color: "#2dd4bf", marginTop: 10, letterSpacing: "-0.01em" }}>{url}</div>
          </div>
        );
      })()}
      {beat.card === "pending" && (
        <div style={{ fontFamily: fontFamilyBody, fontSize: 26, color: "#f59e0b", border: "1px dashed #f59e0b", borderRadius: 10, padding: "10px 18px" }}>
          {beat.note}
        </div>
      )}
      {beat.card === "end" && (
        <div style={{ position: "absolute", bottom: 40, fontFamily: fontFamilyBody, fontSize: 18, color: "#6b7280", opacity: interpolate(frame, [0.7 * FPS, 1.2 * FPS], [0, 1], clamp) }}>
          {LEGAL}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const LaunchFilm: React.FC<FilmProps> = ({ clips, endSub }) => {
  const kind = (i: number): Edge => (BEATS[i]?.clip && clips[BEATS[i].clip!] ? "clip" : "card");
  return (
    <Stage>
      {BEATS.map((beat, i) => {
        const end = i + 1 < BEATS.length ? BEATS[i + 1].start : FILM_SECONDS;
        const frames = Math.round((end - beat.start) * FPS);
        const meta = beat.clip ? clips[beat.clip] : undefined;
        const isClip = kind(i) === "clip";
        // A clip runs on under the next beat while that one dissolves in.
        const tail = isClip && i + 1 < BEATS.length ? XF : 0;
        return (
          <Sequence key={beat.n} from={Math.round(beat.start * FPS)} durationInFrames={frames + tail} name={`${beat.n} ${beat.headline || beat.sub}`}>
            {isClip
              ? <ClipBeat beat={beat} frames={frames} meta={meta} prev={i === 0 ? "card" : kind(i - 1)} next={kind(i + 1)} />
              : <CardBeat beat={beat.clip ? { ...beat, card: "pending", note: `Clip "${beat.clip}" not recorded yet` }
                : beat.card === "end" && endSub ? { ...beat, sub: endSub } : beat} frames={frames} />}
          </Sequence>
        );
      })}
      {BEATS.filter((b) => b.chapter).map((b) => (
        <Sequence key={`w${b.n}`} from={Math.round((b.start - 0.45) * FPS)} durationInFrames={Math.round(0.75 * FPS)} layout="none">
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.28} />
        </Sequence>
      ))}
      <Audio src={staticFile(MUSIC)} volume={(f) => interpolate(f, [FILM_FRAMES - 2.5 * FPS, FILM_FRAMES], [1, 0], clamp)} />
    </Stage>
  );
};
