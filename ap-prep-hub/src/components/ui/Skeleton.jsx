import React from 'react';

/**
 * Skeleton loader component for loading states.
 * Uses pulse animation matching the design token system.
 */
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-base-750 ${className}`}
      {...props}
    />
  );
}

/** Skeleton shaped like a line of text. */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

/** Skeleton for a card element. */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`p-4 bg-base-850 border border-border rounded-md space-y-3 ${className}`}>
      <Skeleton className="h-5 w-2/3" />
      <SkeletonText lines={2} />
      <Skeleton className="h-8 w-1/3" />
    </div>
  );
}
