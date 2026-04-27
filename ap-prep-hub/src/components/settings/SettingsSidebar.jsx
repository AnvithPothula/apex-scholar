import React, { useEffect, useState, useCallback } from 'react';
import {
  User,
  Sparkles,
  BookOpen,
  Clock,
  Link2,
  CalendarOff,
  Lock,
  RotateCcw,
} from 'lucide-react';

/**
 * Sticky settings sidebar with section anchors.
 *
 * Each item links to a section by `id`. Active section is auto-detected via
 * IntersectionObserver as the user scrolls; clicking smooth-scrolls to the
 * target. On screens < lg, collapses to a horizontal scrollable pill bar.
 *
 * "Study Preferences" expands into 4 sub-anchors when it (or any of its
 * children) is the active section.
 */

export const SETTINGS_SECTIONS = [
  { id: 'settings-profile',   label: 'Profile',            icon: User },
  { id: 'settings-ai',        label: 'AI Personalization', icon: Sparkles },
  { id: 'settings-subjects',  label: 'AP Subjects',        icon: BookOpen },
  {
    id: 'settings-study',
    label: 'Study Preferences',
    icon: Clock,
    children: [
      { id: 'settings-study-session',  label: 'Session Timing' },
      { id: 'settings-study-daily',    label: 'Daily Schedule' },
      { id: 'settings-study-learning', label: 'Learning Optimization' },
      { id: 'settings-study-advanced', label: 'Advanced Features' },
    ],
  },
  { id: 'settings-schoology', label: 'Schoology',          icon: Link2 },
  { id: 'settings-blackout',  label: 'Blackout Schedule',  icon: CalendarOff },
  { id: 'settings-account',   label: 'Account Security',   icon: Lock },
];

// Flat list of every observable id (top-level + nested)
const ALL_IDS = SETTINGS_SECTIONS.flatMap((s) =>
  s.children ? [s.id, ...s.children.map((c) => c.id)] : [s.id],
);

// Map every id back to its top-level parent id (used to keep the parent
// highlighted while a child is the most-visible target)
const PARENT_OF = (() => {
  const map = {};
  for (const s of SETTINGS_SECTIONS) {
    map[s.id] = s.id;
    if (s.children) for (const c of s.children) map[c.id] = s.id;
  }
  return map;
})();

const SettingsSidebar = ({ isSaving = false, onResetAll }) => {
  // activeId can be a top-level OR a child id; activeParentId is always top-level
  const [activeId, setActiveId] = useState(SETTINGS_SECTIONS[0].id);

  useEffect(() => {
    const sections = ALL_IDS
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (sections.length === 0) return;

    const visible = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        });

        if (visible.size === 0) return;
        let bestId = null;
        let bestRatio = 0;
        for (const [id, ratio] of visible.entries()) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        if (bestId) setActiveId(bestId);
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const activeParentId = PARENT_OF[activeId] || activeId;

  const handleClick = useCallback((id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    setActiveId(id);
    // Use scrollIntoView so the browser honors the element's CSS
    // `scroll-margin-top` — which we set to clear the sticky page header
    // and (on mobile) the sticky pill bar above the content.
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleReset = useCallback(() => {
    if (typeof onResetAll !== 'function') return;
    const ok = window.confirm(
      'Reset all settings to defaults?\n\n' +
      'This will revert your study preferences, AI personalization, and ' +
      'blackout schedule. Your AP subjects and account info will not be ' +
      'changed. This cannot be undone.',
    );
    if (ok) onResetAll();
  }, [onResetAll]);

  return (
    <>
      {/* Desktop: vertical sticky sidebar */}
      <aside
        className="hidden lg:block lg:sticky lg:top-6 self-start w-60 shrink-0"
        aria-label="Settings sections"
      >
        <nav className="bg-base-850/60 backdrop-blur-sm border border-border rounded-xl p-2">
          <ul className="space-y-0.5">
            {SETTINGS_SECTIONS.map(({ id, label, icon: Icon, children }) => {
              const active = id === activeParentId;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={handleClick(id)}
                    className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary-500/15 text-primary-300'
                        : 'text-content-secondary hover:text-content-primary hover:bg-base-800/60'
                    }`}
                    aria-current={active ? 'true' : undefined}
                  >
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r transition-all ${
                        active ? 'bg-primary-400' : 'bg-transparent'
                      }`}
                      aria-hidden="true"
                    />
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-primary-400' : 'text-content-muted group-hover:text-content-secondary'
                      }`}
                    />
                    <span className="truncate">{label}</span>
                  </a>

                  {/* Nested sub-anchors — only render when parent is active */}
                  {children && active && (
                    <ul className="ml-7 mt-0.5 mb-1 space-y-0.5 border-l border-border-subtle pl-2">
                      {children.map((c) => {
                        const childActive = c.id === activeId;
                        return (
                          <li key={c.id}>
                            <a
                              href={`#${c.id}`}
                              onClick={handleClick(c.id)}
                              className={`block px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                                childActive
                                  ? 'text-primary-300 bg-primary-500/10'
                                  : 'text-content-muted hover:text-content-secondary hover:bg-base-800/40'
                              }`}
                              aria-current={childActive ? 'true' : undefined}
                            >
                              {c.label}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-2 pt-2 border-t border-border-subtle">
            {onResetAll && (
              <button
                type="button"
                onClick={handleReset}
                className="group w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-content-muted hover:text-error-400 hover:bg-error-500/10 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0 text-content-muted group-hover:text-error-400" />
                <span>Reset all settings</span>
              </button>
            )}

            <div className="px-3 py-2 flex items-center gap-2 text-xs text-content-muted">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSaving ? 'bg-warning-500 animate-pulse' : 'bg-success-500'
                }`}
                aria-hidden="true"
              />
              <span>{isSaving ? 'Saving…' : 'Auto-save on'}</span>
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile/tablet: horizontal scrollable pill bar */}
      <nav
        className="lg:hidden -mx-3 sm:-mx-4 mb-4 sticky top-0 z-30 bg-base-950/85 backdrop-blur-sm border-b border-border-subtle"
        aria-label="Settings sections"
      >
        <ul
          className="flex gap-1 overflow-x-auto px-3 sm:px-4 py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => {
            const active = id === activeParentId;
            return (
              <li key={id} className="shrink-0">
                <a
                  href={`#${id}`}
                  onClick={handleClick(id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-primary-500/15 text-primary-300 border-primary-500/30'
                      : 'bg-base-850/60 text-content-secondary border-border hover:text-content-primary'
                  }`}
                  aria-current={active ? 'true' : undefined}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </a>
              </li>
            );
          })}
          {onResetAll && (
            <li className="shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border bg-base-850/60 text-content-muted border-border hover:text-error-400 hover:border-error-500/40 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
};

export default SettingsSidebar;
