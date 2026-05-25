/**
 * Timeline + lesson registry for the Learn hub.
 *
 * Adding a new timeline later (AP World, AP Euro, ...):
 *   1. Create src/data/timelines/<subject>.js (same shape as usHistory.js)
 *   2. import it here and add to TIMELINES
 *   3. Flip its catalog entry below from status:'soon' to status:'live'
 * No component or routing changes required.
 */

import usHistory from './usHistory';

// slug -> timeline config (only LIVE timelines are registered here)
export const TIMELINES = {
  'us-history': usHistory,
};

export function getTimeline(slug) {
  return TIMELINES[slug] || null;
}

/**
 * Catalog of TIMELINES rendered in the Learn hub's Timelines section.
 * `status`:
 *   'live' -> clickable, routes to `to`
 *   'soon' -> shown as a disabled "Coming soon" card
 *
 * Curriculum catalog lives in src/data/curriculums/index.js.
 */
export const TIMELINE_CATALOG = [
  {
    kind: 'timeline',
    slug: 'us-history',
    title: 'AP U.S. History',
    subtitle: 'Interactive timeline',
    blurb: 'Every key event from Pre-1491 to today, color-coded by APUSH theme. Click any event for an AI study note grounded in the College Board CED.',
    status: 'live',
    to: '/learn/timeline/us-history',
  },
  {
    kind: 'timeline',
    slug: 'world-history',
    title: 'AP World History',
    subtitle: 'Interactive timeline',
    blurb: 'Same theme-coded timeline treatment for AP World History.',
    status: 'soon',
  },
  {
    kind: 'timeline',
    slug: 'euro',
    title: 'AP European History',
    subtitle: 'Interactive timeline',
    blurb: 'Same theme-coded timeline treatment for AP European History.',
    status: 'soon',
  },
];
