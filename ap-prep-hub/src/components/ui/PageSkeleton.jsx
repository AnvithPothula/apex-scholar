import React from 'react';
import { Skeleton, SkeletonCard, SkeletonText } from './Skeleton';

/**
 * Full-page skeleton shown while lazy-loaded routes are loading.
 * Mimics the general page structure (header + card grid).
 */
export default function PageSkeleton() {
  return (
    <div className="min-h-screen bg-base-950 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="text-center space-y-3">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-5 w-80 mx-auto" />
        </div>

        {/* Content skeleton — card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard className="hidden sm:block" />
          <SkeletonCard className="hidden lg:block" />
          <SkeletonCard className="hidden lg:block" />
        </div>

        {/* Bottom section */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <SkeletonText lines={3} />
        </div>
      </div>
    </div>
  );
}
