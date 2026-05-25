import React from 'react';
import { useParams, Link, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/UIComponents';
import { useAuth } from '../contexts/AuthContext';
import { isAdmin } from '../components/DeveloperSettings';
import TimelineExplorer from '../components/learn/TimelineExplorer';
import CurriculumExplorer from '../components/learn/CurriculumExplorer';
import { TIMELINE_CATALOG, getTimeline } from '../data/timelines';
import { CURRICULUM_CATALOG, getCurriculum } from '../data/curriculums';

/**
 * Learn hub. Two views off one component:
 *   /learn                      -> two sections (Timelines + Learn/curriculums)
 *   /learn/timeline/:subject    -> a single interactive timeline
 *
 * Dev-only for now: non-developer users (and guests) are redirected away.
 * To enable for everyone later: drop the isAdmin gate below and re-add
 * GuestGate around the routes in App.js.
 */
export default function LearnHub() {
  const { subject } = useParams();
  const { user } = useAuth();
  const location = useLocation();

  // Dev-only gate. Layout also hides the nav tab from non-devs.
  if (!isAdmin(user?.uid)) return <Navigate to="/" replace />;

  // ---- Curriculum view -----------------------------------------------
  // Both /learn/timeline/:subject and /learn/curriculum/:subject set the
  // `subject` param; disambiguate by path.
  if (subject && location.pathname.includes('/curriculum/')) {
    const curriculum = getCurriculum(subject);
    return (
      <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] bg-base-950">
        <div className="px-4 sm:px-6 lg:px-8 pt-4">
          <Link
            to="/learn"
            className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-content-primary transition-colors"
          >
            <ArrowLeft strokeWidth={1.5} className="w-4 h-4" />
            All lessons
          </Link>
        </div>
        {curriculum ? (
          <CurriculumExplorer curriculum={curriculum} />
        ) : (
          <div className="max-w-md mx-auto text-center py-24 px-6">
            <h2 className="text-lg font-display font-semibold text-content-primary mb-1.5">Not available yet</h2>
            <p className="text-sm text-content-secondary mb-6">This curriculum isn&apos;t ready yet.</p>
            <Link to="/learn" className="inline-flex items-center gap-1.5 text-sm text-content-primary font-medium hover:underline">
              Back to all lessons<ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    );
  }

  // ---- Timeline view -------------------------------------------------
  if (subject) {
    const timeline = getTimeline(subject);
    return (
      <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] bg-base-950">
        <div className="px-4 sm:px-6 lg:px-8 pt-4">
          <Link
            to="/learn"
            className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-content-primary transition-colors"
          >
            <ArrowLeft strokeWidth={1.5} className="w-4 h-4" />
            All lessons
          </Link>
        </div>
        {timeline ? (
          <TimelineExplorer timeline={timeline} />
        ) : (
          <div className="max-w-md mx-auto text-center py-24 px-6">
            <div className="mx-auto w-12 h-12 rounded-md bg-content-primary/10 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-content-muted" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-display font-semibold text-content-primary mb-1.5">
              Not available yet
            </h2>
            <p className="text-sm text-content-secondary mb-6">
              This timeline isn&apos;t ready yet. It&apos;s on the way.
            </p>
            <Link
              to="/learn"
              className="inline-flex items-center gap-1.5 text-sm text-content-primary font-medium hover:underline"
            >
              Back to all lessons
              <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    );
  }

  // ---- Catalog view (two sections) -----------------------------------
  return (
    <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] bg-base-950">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-9 h-9 rounded-md bg-content-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-content-muted" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-content-primary">Learn</h1>
        </div>
        <p className="text-sm text-content-secondary mb-8">
          Interactive lessons and study tools. More coming.
        </p>

        <CatalogSection
          heading="Timelines"
          description="Theme-coded interactive timelines for history subjects. Click any event for an AI study note grounded in the College Board CED."
          items={TIMELINE_CATALOG}
        />

        <CatalogSection
          heading="Curriculum"
          description="Per-subject curriculum content aligned to the College Board CED. (Coming soon — placeholder cards below.)"
          items={CURRICULUM_CATALOG}
          className="mt-10"
        />
      </div>
    </div>
  );
}

/**
 * A section heading plus a grid of lesson cards.
 * Used for both the Timelines section and the Learn (curriculums) section.
 */
function CatalogSection({ heading, description, items, className = '' }) {
  return (
    <section className={className}>
      <h2 className="text-base sm:text-lg font-display font-semibold text-content-primary mb-1">
        {heading}
      </h2>
      <p className="text-xs sm:text-sm text-content-muted mb-4">{description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <motion.div
            key={`${heading}-${item.slug}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
          >
            <LessonCard item={item} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function LessonCard({ item }) {
  const live = item.status === 'live';
  const inner = (
    <Card
      className={`h-full p-5 border-border transition-all duration-200 ${
        live
          ? 'bg-base-850 hover:bg-base-800 hover:border-border-strong cursor-pointer'
          : 'bg-base-900 opacity-60 cursor-default'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-9 h-9 rounded-md bg-content-primary/10 flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-content-muted" strokeWidth={1.5} />
        </div>
        {live ? (
          <span className="text-[10px] uppercase tracking-wide font-semibold text-primary-400 bg-primary-900/40 border border-primary-700/40 rounded px-2 py-0.5">
            Open
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-semibold text-content-muted bg-base-800 border border-border rounded px-2 py-0.5">
            <Clock strokeWidth={2} className="w-3 h-3" />
            Coming soon
          </span>
        )}
      </div>
      <div className="text-base font-display font-semibold text-content-primary">
        {item.title}
      </div>
      <div className="text-xs text-content-muted mb-2">{item.subtitle}</div>
      <p className="text-sm text-content-secondary leading-relaxed">{item.blurb}</p>
      {live && (
        <div className="mt-4 inline-flex items-center gap-1 text-sm text-content-primary font-medium">
          Open
          <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5" />
        </div>
      )}
    </Card>
  );

  return live ? <Link to={item.to} className="block h-full">{inner}</Link> : inner;
}
