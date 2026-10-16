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
  'ap-us-history': usHistory,
};

// Slugs match Learn's class slugs (constants/subjects); earlier ones still resolve.
const OLD_SLUGS = { 'us-history': 'ap-us-history' };

export function getTimeline(slug) {
  return TIMELINES[OLD_SLUGS[slug] || slug] || null;
}

/** The current slug for an old one, or null. */
export const currentTimelineSlug = (slug) => OLD_SLUGS[slug] || null;

/**
 * Catalog of TIMELINES rendered in the Learn hub's Timelines section.
 * `status`:
 *   'live' -> clickable, routes to `to`
 *   'soon' -> shown as a disabled "Coming soon" card
 *
 */
export const TIMELINE_CATALOG = [
  {
    kind: 'timeline',
    slug: 'ap-us-history',
    title: 'AP U.S. History',
    subtitle: 'Interactive timeline',
    blurb: 'Every key event from Pre-1491 to today, color-coded by APUSH theme. Click any event for an AI study note grounded in the College Board CED.',
    status: 'live',
    to: '/study/timelines/ap-us-history',
  },
  {
    kind: 'timeline',
    slug: 'ap-world-history-modern',
    title: 'AP World History: Modern',
    subtitle: 'Interactive timeline',
    blurb: 'Same theme-coded timeline treatment for AP World History: Modern.',
    status: 'soon',
  },
  {
    kind: 'timeline',
    slug: 'ap-european-history',
    title: 'AP European History',
    subtitle: 'Interactive timeline',
    blurb: 'Same theme-coded timeline treatment for AP European History.',
    status: 'soon',
  },
];
