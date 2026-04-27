import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDateInUserTimezone, formatTimeInUserTimezone } from './timezone';

// Utility function for conditional class names (clsx + tailwind-merge)
export const cn = (...inputs) => twMerge(clsx(inputs));

/**
 * Convert a PascalCase page name to a kebab-case URL slug.
 *
 *   "AITutors"        → "ai-tutors"
 *   "SmartScheduler"  → "smart-scheduler"
 *   "PracticeTests"   → "practice-tests"
 *   "Flashcards"      → "flashcards"
 *
 * The two regex passes handle both normal PascalCase boundaries
 * ("smart|Scheduler") and consecutive-acronym boundaries ("AI|Tutors")
 * before lowercasing the whole string.
 */
const pascalToKebab = (s) =>
  s
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

export const createPageUrl = (pageName, param = '') => {
  const slug = pascalToKebab(pageName);
  return `/${slug}${param ? `/${param}` : ''}`;
};

export const formatDate = (date) => {
    if (!date) return '';
    return formatDateInUserTimezone(date);
};

export const formatTime = (date) => {
    if (!date) return '';
    return formatTimeInUserTimezone(date);
};

export const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
        case 'Easy': return 'bg-success-900 text-success-400 border-success-500';
        case 'Medium': return 'bg-warning-900 text-warning-400 border-warning-500';
        case 'Hard': return 'bg-error-900 text-error-400 border-error-500';
        default: return 'bg-base-800 text-content-secondary border-border';
    }
};

export const generateSampleTasks = () => [
    {
        name: "AP Calculus Practice Problems",
        subject: "AP Calculus AB",
        difficulty: "Hard",
        estimated_time: 45,
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        description: "Complete problems 1-20 in Chapter 3"
    },
    {
        name: "AP Biology Lab Report",
        subject: "AP Biology",
        difficulty: "Medium",
        estimated_time: 60,
        deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        description: "Write lab report for photosynthesis experiment"
    },
    {
        name: "AP English Essay Draft",
        subject: "AP English Literature",
        difficulty: "Medium",
        estimated_time: 90,
        deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        description: "First draft of Shakespeare analysis essay"
    }
];
