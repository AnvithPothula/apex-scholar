import React from "react";

/**
 * Apex Scholar logo — a minimal teal "A" mark inside a rounded square.
 * Rendered as inline SVG so it can animate smoothly.
 */
export const LogoMark: React.FC<{ size?: number; glow?: boolean }> = ({
  size = 120,
  glow = true,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      style={{
        filter: glow ? "drop-shadow(0 0 24px rgba(20,184,166,0.55))" : undefined,
      }}
    >
      <defs>
        <linearGradient id="lg-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0f766e" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id="lg-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5eead4" />
          <stop offset="1" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="116"
        height="116"
        rx="28"
        fill="url(#lg-bg)"
        stroke="rgba(94,234,212,0.35)"
        strokeWidth="2"
      />
      {/* Stylized A / Apex peak */}
      <path
        d="M30 90 L60 24 L90 90"
        stroke="url(#lg-mark)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M44 68 L76 68"
        stroke="url(#lg-mark)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Small accent dot */}
      <circle cx="60" cy="22" r="4.5" fill="#5eead4" />
    </svg>
  );
};

export const WordMark: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div
      className={`font-display font-bold tracking-tight ${className}`}
      style={{ letterSpacing: "-0.02em" }}
    >
      <span className="text-content-primary">Apex</span>{" "}
      <span className="text-primary-400">Scholar</span>
    </div>
  );
};
