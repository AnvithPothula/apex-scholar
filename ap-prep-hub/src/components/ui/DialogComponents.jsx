import React from "react";

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={onOpenChange}>
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full" onClick={e => e.stopPropagation()}>
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
