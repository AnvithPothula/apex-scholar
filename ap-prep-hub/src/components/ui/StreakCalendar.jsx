import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

const WEEKS = 12;
const DAYS_PER_WEEK = 7;
const DAY_LABELS = ['', 'M', '', 'W', '', 'F', ''];

function getIntensity(count) {
  if (!count) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

function formatLocalDateKey(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const intensityClasses = [
  'bg-base-800',
  'bg-primary-950',
  'bg-primary-900',
  'bg-primary-700',
  'bg-primary-500',
];

/**
 * StreakCalendar — GitHub/Duolingo-style heatmap of study activity.
 * @param {Object} props
 * @param {Record<string, number>} props.activityData — { 'YYYY-MM-DD': sessionCount }
 * @param {number} [props.currentStreak] — current consecutive-day streak
 * @param {string} [props.className]
 */
export default function StreakCalendar({ activityData = {}, currentStreak = 0, className }) {
  const { grid, months } = useMemo(() => {
    const today = new Date();
    const todayKey = formatLocalDateKey(today);
    const totalDays = WEEKS * DAYS_PER_WEEK;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays + 1);
    // Align to start of week (Sunday)
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const weeks = [];
    const monthLabels = [];
    let lastMonth = -1;
    const current = new Date(startDate);

    for (let w = 0; w < WEEKS; w++) {
      const week = [];
      for (let d = 0; d < DAYS_PER_WEEK; d++) {
        const key = formatLocalDateKey(current);
        const isToday = key === todayKey;
        const isFuture = current > today;
        week.push({
          date: key,
          count: activityData[key] || 0,
          isToday,
          isFuture,
        });
        if (d === 0 && current.getMonth() !== lastMonth) {
          monthLabels.push({ week: w, label: current.toLocaleString('default', { month: 'short' }) });
          lastMonth = current.getMonth();
        }
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }
    return { grid: weeks, months: monthLabels };
  }, [activityData]);

  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-body-sm text-content-secondary">Study Activity</span>
        </div>
        {currentStreak > 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary-950 border border-primary-900"
          >
            <span className="text-primary-400 text-xs">🔥</span>
            <span className="text-xs font-medium text-primary-400">{currentStreak} day streak</span>
          </motion.div>
        )}
      </div>

      {/* Grid */}
      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="w-3 h-3 flex items-center justify-center text-[8px] text-content-muted">
              {label}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div className="flex gap-0.5 flex-1">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5 flex-1">
              {week.map((day) => (
                <motion.div
                  key={day.date}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: wi * 0.02, duration: 0.2 }}
                  title={day.isFuture ? '' : `${day.date}: ${day.count} session${day.count !== 1 ? 's' : ''}`}
                  className={cn(
                    'aspect-square rounded-[2px] transition-colors duration-150',
                    day.isFuture ? 'bg-transparent' : intensityClasses[getIntensity(day.count)],
                    day.isToday && 'ring-1 ring-primary-400/50'
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Month labels */}
      <div className="flex gap-0.5 mt-1 ml-4">
        {months.map((m, i) => (
          <div
            key={i}
            className="text-[9px] text-content-muted"
            style={{ marginLeft: i === 0 ? 0 : `${(m.week - (months[i - 1]?.week || 0)) * 8.33}%` }}
          >
            {m.label}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-[9px] text-content-muted mr-1">Less</span>
        {intensityClasses.map((cls, i) => (
          <div key={i} className={cn('w-2.5 h-2.5 rounded-[2px]', cls)} />
        ))}
        <span className="text-[9px] text-content-muted ml-1">More</span>
      </div>
    </div>
  );
}
