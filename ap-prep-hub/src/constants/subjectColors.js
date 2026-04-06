/**
 * Per-subject accent colors for visual differentiation.
 * Each subject category gets a distinct hue applied to progress rings,
 * card borders, icon backgrounds, and glassmorphism glows.
 *
 * Colors are Tailwind-compatible class fragments AND raw hex values.
 */

const SUBJECT_COLORS = {
  // Sciences — greens/teals
  biology:                    { accent: '#10b981', ring: 'text-emerald-500', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' },
  chemistry:                  { accent: '#06b6d4', ring: 'text-cyan-500',    bg: 'bg-cyan-500/15',    border: 'border-cyan-500/30',    glow: 'shadow-cyan-500/20' },
  environmentalScience:       { accent: '#22c55e', ring: 'text-green-500',   bg: 'bg-green-500/15',   border: 'border-green-500/30',   glow: 'shadow-green-500/20' },
  physics1:                   { accent: '#0ea5e9', ring: 'text-sky-500',     bg: 'bg-sky-500/15',     border: 'border-sky-500/30',     glow: 'shadow-sky-500/20' },
  physics2:                   { accent: '#6366f1', ring: 'text-indigo-500',  bg: 'bg-indigo-500/15',  border: 'border-indigo-500/30',  glow: 'shadow-indigo-500/20' },
  'physicsC_Mechanics':       { accent: '#2563eb', ring: 'text-blue-600',    bg: 'bg-blue-600/15',    border: 'border-blue-600/30',    glow: 'shadow-blue-600/20' },
  'physicsC_ElectricityMagnetism': { accent: '#7c3aed', ring: 'text-violet-600', bg: 'bg-violet-600/15', border: 'border-violet-600/30', glow: 'shadow-violet-600/20' },
  psychology:                 { accent: '#ec4899', ring: 'text-pink-500',    bg: 'bg-pink-500/15',    border: 'border-pink-500/30',    glow: 'shadow-pink-500/20' },

  // Math — reds
  calculusAB:                 { accent: '#ef4444', ring: 'text-red-500',     bg: 'bg-red-500/15',     border: 'border-red-500/30',     glow: 'shadow-red-500/20' },
  calculusBC:                 { accent: '#f87171', ring: 'text-red-400',     bg: 'bg-red-400/15',     border: 'border-red-400/30',     glow: 'shadow-red-400/20' },
  precalculus:                { accent: '#dc2626', ring: 'text-red-600',     bg: 'bg-red-600/15',     border: 'border-red-600/30',     glow: 'shadow-red-600/20' },
  statistics:                 { accent: '#fb7185', ring: 'text-rose-400',    bg: 'bg-rose-400/15',    border: 'border-rose-400/30',    glow: 'shadow-rose-400/20' },

  // CS — slate blue
  computerScienceA:           { accent: '#0ea5e9', ring: 'text-sky-500',     bg: 'bg-sky-500/15',     border: 'border-sky-500/30',     glow: 'shadow-sky-500/20' },
  computerSciencePrinciples:  { accent: '#38bdf8', ring: 'text-sky-400',     bg: 'bg-sky-400/15',     border: 'border-sky-400/30',     glow: 'shadow-sky-400/20' },

  // English — blues
  englishLanguageAndComposition:  { accent: '#3b82f6', ring: 'text-blue-500',  bg: 'bg-blue-500/15',  border: 'border-blue-500/30',  glow: 'shadow-blue-500/20' },
  englishLiteratureAndComposition: { accent: '#60a5fa', ring: 'text-blue-400', bg: 'bg-blue-400/15', border: 'border-blue-400/30', glow: 'shadow-blue-400/20' },

  // History — warm oranges/reds
  europeanHistory:            { accent: '#f97316', ring: 'text-orange-500',  bg: 'bg-orange-500/15',  border: 'border-orange-500/30',  glow: 'shadow-orange-500/20' },
  usHistory:                  { accent: '#d97706', ring: 'text-amber-600',   bg: 'bg-amber-600/15',   border: 'border-amber-600/30',   glow: 'shadow-amber-600/20' },
  worldHistory:               { accent: '#fb923c', ring: 'text-orange-400',  bg: 'bg-orange-400/15',  border: 'border-orange-400/30',  glow: 'shadow-orange-400/20' },
  humanGeography:             { accent: '#f472b6', ring: 'text-pink-400',    bg: 'bg-pink-400/15',    border: 'border-pink-400/30',    glow: 'shadow-pink-400/20' },

  // Economics/Gov — teals
  macroeconomics:             { accent: '#14b8a6', ring: 'text-teal-500',    bg: 'bg-teal-500/15',    border: 'border-teal-500/30',    glow: 'shadow-teal-500/20' },
  microeconomics:             { accent: '#2dd4bf', ring: 'text-teal-400',    bg: 'bg-teal-400/15',    border: 'border-teal-400/30',    glow: 'shadow-teal-400/20' },
  usGovernmentPolitics:       { accent: '#e11d48', ring: 'text-rose-600',    bg: 'bg-rose-600/15',    border: 'border-rose-600/30',    glow: 'shadow-rose-600/20' },
  comparativeGovernment:      { accent: '#ea580c', ring: 'text-orange-600',  bg: 'bg-orange-600/15',  border: 'border-orange-600/30',  glow: 'shadow-orange-600/20' },

  // Arts
  artHistory:                 { accent: '#d946ef', ring: 'text-fuchsia-500', bg: 'bg-fuchsia-500/15', border: 'border-fuchsia-500/30', glow: 'shadow-fuchsia-500/20' },
  musicTheory:                { accent: '#e879f9', ring: 'text-fuchsia-400', bg: 'bg-fuchsia-400/15', border: 'border-fuchsia-400/30', glow: 'shadow-fuchsia-400/20' },

  // Languages — cool blues/slates
  spanishLanguage:            { accent: '#f97316', ring: 'text-orange-500',  bg: 'bg-orange-500/15',  border: 'border-orange-500/30',  glow: 'shadow-orange-500/20' },
  frenchLanguage:             { accent: '#3b82f6', ring: 'text-blue-500',    bg: 'bg-blue-500/15',    border: 'border-blue-500/30',    glow: 'shadow-blue-500/20' },
  germanLanguage:             { accent: '#facc15', ring: 'text-yellow-400',  bg: 'bg-yellow-400/15',  border: 'border-yellow-400/30',  glow: 'shadow-yellow-400/20' },
  chineseLanguage:            { accent: '#ef4444', ring: 'text-red-500',     bg: 'bg-red-500/15',     border: 'border-red-500/30',     glow: 'shadow-red-500/20' },
  japaneseLanguage:           { accent: '#f43f5e', ring: 'text-rose-500',    bg: 'bg-rose-500/15',    border: 'border-rose-500/30',    glow: 'shadow-rose-500/20' },
  italianLanguage:            { accent: '#22c55e', ring: 'text-green-500',   bg: 'bg-green-500/15',   border: 'border-green-500/30',   glow: 'shadow-green-500/20' },
  latin:                      { accent: '#a8a29e', ring: 'text-stone-400',   bg: 'bg-stone-400/15',   border: 'border-stone-400/30',   glow: 'shadow-stone-400/20' },
  spanishLiterature:          { accent: '#fb923c', ring: 'text-orange-400',  bg: 'bg-orange-400/15',  border: 'border-orange-400/30',  glow: 'shadow-orange-400/20' },

  // Special programs
  research:                   { accent: '#64748b', ring: 'text-slate-500',   bg: 'bg-slate-500/15',   border: 'border-slate-500/30',   glow: 'shadow-slate-500/20' },
  seminar:                    { accent: '#94a3b8', ring: 'text-slate-400',   bg: 'bg-slate-400/15',   border: 'border-slate-400/30',   glow: 'shadow-slate-400/20' },

  // Studio art
  studioArt:                  { accent: '#f472b6', ring: 'text-pink-400',    bg: 'bg-pink-400/15',    border: 'border-pink-400/30',    glow: 'shadow-pink-400/20' },
  studioArt2D:                { accent: '#e879f9', ring: 'text-fuchsia-400', bg: 'bg-fuchsia-400/15', border: 'border-fuchsia-400/30', glow: 'shadow-fuchsia-400/20' },
  studioArt3D:                { accent: '#c084fc', ring: 'text-purple-400',  bg: 'bg-purple-400/15',  border: 'border-purple-400/30',  glow: 'shadow-purple-400/20' },
  studioArtDrawing:           { accent: '#fb7185', ring: 'text-rose-400',    bg: 'bg-rose-400/15',    border: 'border-rose-400/30',    glow: 'shadow-rose-400/20' },
};

// Default fallback for unknown subjects
const DEFAULT_COLOR = { accent: '#6b7280', ring: 'text-gray-500', bg: 'bg-gray-500/15', border: 'border-gray-500/30', glow: 'shadow-gray-500/20' };

/**
 * Get the accent color set for a subject key.
 * Falls back to a neutral gray if the subject is unknown.
 */
export function getSubjectColor(subjectKey) {
  return SUBJECT_COLORS[subjectKey] || DEFAULT_COLOR;
}

export default SUBJECT_COLORS;
