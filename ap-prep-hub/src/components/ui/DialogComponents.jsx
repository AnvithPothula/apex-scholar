import React from "react";

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onOpenChange}>
      <div className="bg-base-850 border border-border rounded-md shadow-floating max-w-lg w-full" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children, className }) => (
  <div className={className}>{children}</div>
);

export const DialogHeader = ({ children, className }) => (
  <div className={className}>{children}</div>
);

export const DialogTitle = ({ children, className }) => (
  <h2 className={className}>{children}</h2>
);
