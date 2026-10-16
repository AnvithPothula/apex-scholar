import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';
import TimelineExplorer from '../components/learn/TimelineExplorer';
import { getTimeline, currentTimelineSlug } from '../data/timelines';

/**
 * /study/timelines/:subject — one interactive timeline, listed under Learn
 * (/study) beside the unit lessons. Open to guests like the rest of Learn.
 */
export default function Timeline() {
  const { subject } = useParams();
  const timeline = getTimeline(subject);
  if (currentTimelineSlug(subject)) return <Navigate to={`/study/timelines/${currentTimelineSlug(subject)}`} replace />;
  return (
    <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] bg-base-950">
      <div className="px-4 sm:px-6 lg:px-8 pt-4">
        <Link to="/study" className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-content-primary transition-colors">
          <ArrowLeft strokeWidth={1.5} className="w-4 h-4" />
          Learn
        </Link>
      </div>
      {timeline ? (
        <TimelineExplorer timeline={timeline} />
      ) : (
        <div className="max-w-md mx-auto text-center py-24 px-6">
          <Clock className="w-8 h-8 text-content-muted mx-auto mb-3" strokeWidth={1.5} />
          <h2 className="text-lg font-display font-semibold text-content-primary mb-1.5">Not available yet</h2>
          <p className="text-sm text-content-secondary mb-6">This timeline isn&apos;t ready yet.</p>
          <Link to="/study" className="text-sm text-content-primary font-medium hover:underline">Back to Learn</Link>
        </div>
      )}
    </div>
  );
}
