import React from "react";

export const GlowCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  accent?: "teal" | "blue";
}> = ({ children, className = "", style, accent = "teal" }) => {
  const ring =
    accent === "teal"
      ? "0 0 0 1px rgba(45, 212, 191, 0.22), 0 20px 60px -20px rgba(20, 184, 166, 0.45)"
      : "0 0 0 1px rgba(96, 165, 250, 0.22), 0 20px 60px -20px rgba(59, 130, 246, 0.45)";
  return (
    <div
      className={`rounded-2xl bg-base-850/80 backdrop-blur-sm border border-border ${className}`}
      style={{
        boxShadow: ring,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const SceneLabel: React.FC<{
  index: number;
  total: number;
  title: string;
}> = ({ index, total, title }) => {
  return (
    <div className="flex items-center gap-3 text-content-muted uppercase tracking-[0.25em] text-[18px]">
      <span className="font-display font-semibold text-primary-400">
        {String(index).padStart(2, "0")}
      </span>
      <span className="w-8 h-px bg-border-strong" />
      <span className="font-display font-medium">{title}</span>
      <span className="w-8 h-px bg-border-strong" />
      <span className="font-display text-content-muted">
        {String(total).padStart(2, "0")}
      </span>
    </div>
  );
};
