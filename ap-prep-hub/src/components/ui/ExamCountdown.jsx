import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSubjectColor } from '../../constants/subjectColors';
import {
  getCurrentYearExamDates,
  SUBJECT_KEY_TO_EXAM_NAME,
} from '../../constants/apExamDates';
import AnimatedCounter from './AnimatedCounter';

/**
 * ExamCountdown — displays a live countdown to the next AP exam for a given subject.
 *
 * Props:
 *   subjectKey  — curriculum subject key (e.g. "calculusAB")
 *   className   — optional extra classes for the outer wrapper
 */
export default function ExamCountdown({ subjectKey, className = '' }) {
  const [timeLeft, setTimeLeft] = useState(null); // { days, hours, minutes } | 'passed' | null

  useEffect(() => {
    if (!subjectKey) return;

    const examName = SUBJECT_KEY_TO_EXAM_NAME[subjectKey];
    if (!examName) return;

    const examDates = getCurrentYearExamDates();
    const examInfo = examDates[examName];
    if (!examInfo) return;

    // Parse exam datetime in local time
    const [year, month, day] = examInfo.date.split('-').map(Number);
    const [timePart, meridiem] = examInfo.time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    const examDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

    const compute = () => {
      const now = new Date();
      const diff = examDateTime - now;

      if (diff <= 0) {
        setTimeLeft('passed');
        return;
      }

      const totalMinutes = Math.floor(diff / 60_000);
      const mins = totalMinutes % 60;
      const totalHours = Math.floor(totalMinutes / 60);
      const hrs = totalHours % 24;
      const days = Math.floor(totalHours / 24);

      setTimeLeft({ days, hours: hrs, minutes: mins });
    };

    compute();
    const id = setInterval(compute, 60_000);
    return () => clearInterval(id);
  }, [subjectKey]);

  // Render nothing when there is no data
  if (timeLeft === null) return null;

  const colors = getSubjectColor(subjectKey);

  if (timeLeft === 'passed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`inline-flex items-center gap-2 rounded-xl border border-border bg-base-850 px-4 py-2 ${className}`}
      >
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: colors.accent }}
        />
        <span className="text-label text-content-muted">Exam Complete</span>
      </motion.div>
    );
  }

  const segments = [
    { value: timeLeft.days, label: 'days' },
    { value: timeLeft.hours, label: 'hrs' },
    { value: timeLeft.minutes, label: 'min' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`rounded-2xl border border-border bg-base-850 px-6 py-4 ${className}`}
      style={{ borderColor: `${colors.accent}33` }}
    >
      {/* Accent top bar */}
      <div
        className="mb-3 h-0.5 w-10 rounded-full"
        style={{ backgroundColor: colors.accent }}
      />

      <div className="flex items-end gap-0">
        {segments.map(({ value, label }, i) => (
          <div key={label} className="flex items-end gap-0">
            {/* Number + label pair */}
            <div className="flex flex-col items-center">
              <span style={{ color: colors.accent }}>
                <AnimatedCounter
                  value={value}
                  duration={600}
                  className="text-display font-bold leading-none"
                />
              </span>
              <span className="text-caption text-content-muted mt-0.5 uppercase tracking-widest">
                {label}
              </span>
            </div>

            {/* Separator — skip after last segment */}
            {i < segments.length - 1 && (
              <span className="mx-2 mb-3 text-h3 font-light text-content-muted select-none">
                |
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
