import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Lightweight confetti burst animation.
 * Renders ~30 particles that fly out and fade away.
 *
 * Props:
 *   trigger  — set to true to fire. Resets on false → true transition.
 *   duration — how long particles live (ms, default 1500)
 *   colors   — array of hex colors for particles
 */

const PARTICLE_COUNT = 30;
const DEFAULT_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

export default function Confetti({
  trigger = false,
  duration = 1500,
  colors = DEFAULT_COLORS,
}) {
  const [particles, setParticles] = useState([]);

  const fire = useCallback(() => {
    const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: Date.now() + i,
      x: randomBetween(-120, 120),
      y: randomBetween(-160, -40),
      rotation: randomBetween(0, 720),
      scale: randomBetween(0.4, 1),
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), duration);
  }, [colors, duration]);

  useEffect(() => {
    if (trigger) fire();
  }, [trigger, fire]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
            animate={{
              x: p.x,
              y: p.y,
              opacity: [1, 1, 0],
              scale: p.scale,
              rotate: p.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration / 1000, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: p.shape === 'circle' ? 8 : 10,
              height: p.shape === 'circle' ? 8 : 6,
              borderRadius: p.shape === 'circle' ? '50%' : '2px',
              backgroundColor: p.color,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
