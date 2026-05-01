import React from "react";
import { Img, staticFile } from "remotion";

/**
 * Apex Scholar logo — the real brand mark from the production app.
 *
 * The asset (`logo.webp`) lives in `/public` so it's served by Remotion's
 * static-file server during render. We don't manipulate the artwork; we just
 * size it and apply a soft glow that picks up the navy + teal in the badge.
 */
export const LogoMark: React.FC<{ size?: number; glow?: boolean }> = ({
  size = 120,
  glow = true,
}) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Two-layer glow: a tight teal halo + a wider navy bloom.
        // Picks up the dominant colors in the actual logo so it feels native.
        filter: glow
          ? "drop-shadow(0 0 24px rgba(45, 212, 191, 0.55)) drop-shadow(0 0 48px rgba(59, 130, 246, 0.30))"
          : undefined,
      }}
    >
      <Img
        src={staticFile("logo.webp")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
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
