import React from 'react';
import { motion } from 'framer-motion';
import { easeOutExpo } from '../../utils/animations';

/**
 * Animated circular progress ring using SVG + Framer Motion pathLength.
 *
 * Props:
 *   percentage  — 0-100
 *   size        — px diameter (default 64)
 *   strokeWidth — px (default 4)
 *   color       — stroke color (CSS color string, default uses --color-text-primary)
 *   trackColor  — background ring color
 *   label       — optional center label (e.g. "85%")
 *   className   — wrapper className
 */
export default function ProgressRing({
  percentage = 0,
  size = 64,
  strokeWidth = 4,
  color = 'var(--color-text-primary)',
  trackColor = 'var(--color-base-800)',
  label,
  className = '',
}) {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: Math.min(percentage, 100) / 100 }}
          transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.1 }}
        />
      </svg>
      {label !== undefined && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-content-primary">
          {label}
        </span>
      )}
    </div>
  );
}
