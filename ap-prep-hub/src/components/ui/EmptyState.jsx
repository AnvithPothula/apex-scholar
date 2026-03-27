import React from 'react';
import { motion } from 'framer-motion';
import { easeOutExpo } from '../../utils/animations';

/**
 * Reusable empty state component with icon, title, description, and optional CTA.
 *
 * Props:
 *   icon        — Lucide icon component
 *   title       — heading text
 *   description — body text
 *   action      — optional { label, onClick } for CTA button
 *   className   — wrapper className
 */
export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOutExpo }}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      {/* Dot-grid pattern background */}
      <div className="relative mb-6">
        <div className="absolute inset-0 -m-8 rounded-full bg-[radial-gradient(circle,var(--color-base-750)_1px,transparent_1px)] bg-[length:8px_8px] opacity-40" />
        <div className="relative p-4 bg-base-800 rounded-2xl border border-border">
          {Icon && <Icon strokeWidth={1.5} className="w-8 h-8 text-content-muted" />}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-content-primary mb-2">{title}</h3>
      <p className="text-sm text-content-muted max-w-sm mb-6">{description}</p>

      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="px-4 py-2 bg-content-primary text-base-950 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
