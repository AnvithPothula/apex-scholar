import React from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  isToday as isTodayDateFns,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getHours,
  getMinutes,
  isSameDay,
  isValid,
} from 'date-fns';
// Note: this view previously used `<Droppable>` and `<Draggable>` from
// `@hello-pangea/dnd`, but there was never a `<DragDropContext>` wrapping
// them and no `onDragEnd` handler — the drag handles were non-functional
// and (post-react-redux upgrade) started throwing `f.store` null in
// production. Stripped to plain divs; if drag-to-reschedule is wanted,
// wrap the whole calendar in a real DragDropContext + onDragEnd later.
import { motion } from 'framer-motion';
import { getUpcomingExamsSync } from '../../constants/apExamDates';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { examTopRem } from '../../utils/examTime';
import { insertBreaks } from '../../utils/scheduleBreaks';

// Only shades the theme defines (400/500/900). The old `bg-warning-900/50` and
// `text-warning-200` classes don't exist, so every session drew as bare text.
const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "bg-success-900 border-success-500";
      case "Medium": return "bg-warning-900 border-warning-500";
      case "Hard": return "bg-error-900 border-error-500";
      default: return "bg-base-800 border-border-strong";
    }
};

const toDate = (v) => {
  if (!v) return null;
  const d = typeof v.toDate === 'function' ? v.toDate() : v instanceof Date ? v : new Date(v);
  return isValid(d) ? d : null;
};

/** A task's due marker: clickable, crossed out once the task is done. */
const DueChip = ({ task, onClick }) => (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); onClick?.(task); }}
    className={`w-full text-left truncate rounded-sm border border-border-strong bg-base-850 px-1 py-0.5 text-xs text-content-primary hover:bg-base-750 ${task.is_completed ? 'line-through opacity-60' : ''}`}
    aria-label={`Due: ${task.name}${task.is_completed ? ' (done)' : ''}. Edit task`}
  >
    <span className="text-error-400 font-semibold">Due</span> {task.name}
  </button>
);

/**
 * A gap the scheduler left on purpose. Rendered flat and dashed so it reads as
 * "nothing happens here", and deliberately not interactive — there is no task
 * behind it to open.
 */
const WeekViewBreak = ({ item, top, height }) => (
  <div
    style={{ position: 'absolute', top: `${top}rem`, height: `${height}rem`,
             left: '0.25rem', right: '0.25rem', zIndex: 15 }}
    className="px-2 flex items-center rounded-sm text-xs font-medium
               bg-accent-900 border border-dashed border-accent-500 text-accent-400"
    aria-label={item.name}
  >
    <span className="truncate">☕ {item.name}</span>
  </div>
);

const WeekViewTask = ({ task, onTaskClick }) => {
    const parseTaskDate = (value) => {
      if (value instanceof Date) return value;
      if (typeof value === 'string') return parseISO(value);
      return value ? new Date(value) : null;
    };

    const start = parseTaskDate(task.scheduled_start || task.startTime);
    const end = parseTaskDate(task.scheduled_end || task.endTime);

    if (!start || !end || !isValid(start) || !isValid(end)) {
      return null;
    }

    const startHour = getHours(start) + getMinutes(start) / 60;
    const endHour = getHours(end) + getMinutes(end) / 60;
    
    const topPosition = startHour * 4; // Each hour is 4rem (h-16) high
    const heightDuration = (endHour - startHour) * 4;

    // A break is short by definition, so it gets a smaller floor than a session
    // (2rem would make a 10-minute break look the same size as an hour of work).
    if (task.isBreak) {
      return <WeekViewBreak item={task} top={topPosition} height={Math.max(1.25, heightDuration)} />;
    }

    return (
        <div
            style={{
                position: 'absolute',
                top: `${topPosition}rem`,
                height: `${Math.max(2, heightDuration)}rem`,
                left: '0.25rem',
                right: '0.25rem',
                zIndex: 20,
            }}
            className={`p-2 rounded-sm border-l-4 text-xs font-medium cursor-pointer transition-all duration-200 overflow-hidden shadow-raised hover:shadow-floating ${getDifficultyColor(task.difficulty)} ${task.completed ? 'opacity-60' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={`${task.name}, ${format(start, 'h:mm a')} to ${format(end, 'h:mm a')}${task.completed ? ', done' : ''}`}
            onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onTaskClick(task); } }}
        >
            <div className="flex flex-col h-full justify-between">
                <span className={`font-bold text-content-primary leading-tight ${task.completed ? 'line-through' : ''}`}>{task.name}</span>
                <span className="text-content-secondary">{task.subject}</span>
            </div>
        </div>
    );
};


export default function CalendarGrid({
  currentDate,
  viewMode,
  tasks,
  onTaskClick,
  onDateClick,
  getTasksForDate,
  onDeadlineClick,
}) {
  const { user } = useAuth();
  const [upcomingExams, setUpcomingExams] = React.useState([]);
  // Ref on the scrollable week-view wrapper so we can scroll-to-time on mount.
  // Without this, the week view always opens at 12am and the user has to
  // scroll down to find their actual study sessions (which are usually
  // between 8am-10pm). See the auto-scroll effect below.
  const weekScrollRef = React.useRef(null);

  // Load user's selected subjects and upcoming exams
  React.useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return;
      
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const subjects = userData.subjects || [];
          
          // Get upcoming exams for user's subjects. Late testers must see the
          // late sitting here too, or the calendar marks a different day than
          // the exam dashboard and countdown on the same screen.
          const exams = getUpcomingExamsSync(subjects, userData.lateTestingSubjects || []);
          setUpcomingExams(exams);
        }
      } catch (error) {
        console.error("Error loading user data for calendar:", error);
      }
    };

    loadUserData();
  }, [user]);

  // Auto-scroll the week view to a useful starting hour on mount and when
  // the visible week changes. Priority order:
  //   1. The earliest scheduled session of the day (minus 30 minutes lead-in)
  //   2. The current hour if it's within study hours (7am-11pm)
  //   3. 8am as a sensible default
  // Each hour is 4rem tall = 64px. The day-header is ~5rem.
  React.useEffect(() => {
    if (viewMode !== 'week') return;
    const container = weekScrollRef.current;
    if (!container) return;

    let targetHour = 8;
    try {
      const todayItems = (getTasksForDate && getTasksForDate(currentDate)) || [];
      const startHours = todayItems
        .map((item) => {
          const s = item.startTime ? new Date(item.startTime) : null;
          return s && !isNaN(s.getTime()) ? s.getHours() : null;
        })
        .filter((h) => h !== null);
      if (startHours.length > 0) {
        targetHour = Math.max(0, Math.min(...startHours) - 1);
      } else if (isTodayDateFns(currentDate)) {
        const nowHour = new Date().getHours();
        if (nowHour >= 7 && nowHour <= 23) targetHour = nowHour - 1;
      }
    } catch (_e) {
      // Best-effort — fall back to default 8am.
    }
    // 4rem per hour, header is ~5rem. Use rough rem-to-px (assume 16px/rem).
    const remToPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    container.scrollTop = targetHour * 4 * remToPx;
    // Narrow screens show two or three days; bring today's column into view.
    const today = container.querySelector('[data-today="true"]');
    const timeCol = container.querySelector('[data-time-col]');
    if (today) container.scrollLeft = Math.max(0, today.offsetLeft - (timeCol?.offsetWidth || 0));
  }, [viewMode, currentDate, getTasksForDate]);

  // Task deadlines by day. The calendar only ever drew planned sessions, so a
  // due date (including every synced Schoology assignment) never showed.
  const deadlinesByDay = React.useMemo(() => {
    const m = {};
    (tasks || []).forEach((t) => {
      const d = toDate(t.deadline);
      if (!d) return;
      const k = format(d, 'yyyy-MM-dd');
      (m[k] = m[k] || []).push(t);
    });
    return m;
  }, [tasks]);
  const getDeadlinesForDate = (date) => deadlinesByDay[format(date, 'yyyy-MM-dd')] || [];

  // Helper function to get exam for a specific date
  const getExamForDate = (date) => {
    return upcomingExams.find(exam => 
      exam.examDate && isSameDay(exam.examDate, date)
    );
  };

  // Helper function to get review schedule items for a date
  const getReviewItemsForDate = (date) => {
    const reviewItems = [];
    upcomingExams.forEach(exam => {
      if (exam.reviewSchedule) {
        exam.reviewSchedule.forEach(reviewItem => {
          const reviewDate = new Date(reviewItem.startDate);
          if (isSameDay(reviewDate, date)) {
            reviewItems.push({
              ...reviewItem,
              subject: exam.subject,
              examDate: exam.examDate
            });
          }
        });
      }
    });
    return reviewItems;
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const timeSlots = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div ref={weekScrollRef} className="overflow-auto h-full">
        {/* Removed the explicit `min-w-[1200px]` and shrunk per-column
            min-width from 150px → 110px so the grid fits on typical
            laptop widths (~960px content area after sidebar). Wider
            screens still expand via the `1fr` track. */}
        <div className="grid grid-cols-[auto_repeat(7,minmax(110px,1fr))] min-w-[860px]">
          {/* Top-left empty cell — sits above both header row and time
              column, so its z-index has to beat both. */}
          <div className="sticky left-0 top-0 z-50 bg-base-900 border-b border-r border-border-subtle p-2"></div>
          {/* Days Header */}
          {days.map((d) => {
            const exam = getExamForDate(d);
            const reviewItems = getReviewItemsForDate(d);
            
            return (
              <div key={d.toISOString()} data-today={isTodayDateFns(d) || undefined} className="p-4 text-center border-b border-border-subtle bg-base-900 sticky top-0 z-40">
                <div className="font-semibold text-content-primary flex items-center justify-center gap-2">
                  {format(d, "EEE")}
                  {exam && <div className="w-2 h-2 bg-error-500 rounded-full animate-pulse" title={`AP Exam: ${exam.subject}`}></div>}
                </div>
                <div
                  className={`text-lg mt-1 w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                    isTodayDateFns(d) ? "bg-content-primary text-base-950" : "text-content-secondary"
                  }`}
                >
                  {format(d, "d")}
                </div>
                {/* Show exam or review info */}
                {exam && (
                  <div className="text-xs text-error-400 mt-1 font-medium">
                    📝 {exam.subject.replace('AP ', '')}
                  </div>
                )}
                {reviewItems.length > 0 && !exam && (
                  <div className="text-xs text-info-400 mt-1">
                    📚 {reviewItems.length} review{reviewItems.length > 1 ? 's' : ''}
                  </div>
                )}
                {getDeadlinesForDate(d).length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {getDeadlinesForDate(d).slice(0, 2).map((t) => <DueChip key={t.id} task={t} onClick={onDeadlineClick} />)}
                    {getDeadlinesForDate(d).length > 2 && (
                      <div className="text-xs text-content-muted">+{getDeadlinesForDate(d).length - 2} more due</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {/* Time column */}
          {/* Sticky time column — bumped to z-30 so absolute-positioned
              tasks (z-index: 20) inside day columns don't slide under it
              when the user scrolls horizontally. */}
          <div data-time-col className="sticky left-0 z-30 bg-base-900 border-r border-border-subtle">
            {timeSlots.map((hour) => (
              // Label sits ON the line where its hour starts. Centered in the row,
              // it read half an hour off: a 3:00 session drew above "3PM".
              <div key={hour} className="h-16 px-2 text-xs text-content-muted border-b border-border-subtle text-right">
                {hour > 0 && <span className="relative -top-2">{format(new Date(2000, 0, 1, hour), "ha")}</span>}
              </div>
            ))}
          </div>
          {/* Calendar Body */}
          {days.map((day) => {
            const exam = getExamForDate(day);
            const reviewItems = getReviewItemsForDate(day);
            
            return (
              <div
                  key={day.toISOString()}
                  className="relative h-full"
              >
                  {/* Grid lines */}
                  {timeSlots.map((hour) => (
                      <div
                        key={hour}
                        className="h-16 border-b border-r border-border-subtle"
                      />
                  ))}

                  {/* AP Exam indicator at exam time.
                      examTopRem returns null for a missing or unparseable time
                      rather than throwing — `exam.time.split(...)` used to crash
                      the whole calendar if `time` was absent, and silently
                      dropped AM/PM so an 8 PM exam drew at 8 AM. */}
                  {exam && examTopRem(exam.time, 4) !== null && (
                    <div
                      style={{
                        position: 'absolute',
                        top: `${examTopRem(exam.time, 4)}rem`,
                        height: '3rem',
                        left: '0.25rem',
                        right: '0.25rem',
                        zIndex: 30,
                      }}
                      className="bg-error-900 border-l-4 border-error-500 p-2 rounded-sm text-xs font-bold text-content-primary shadow-raised"
                    >
                      📝 {exam.subject.replace('AP ', '')} Exam
                      <div className="text-content-secondary text-xs">{exam.time}</div>
                    </div>
                  )}

                  {/* Review items displayed at 8 AM */}
                  {reviewItems.map((item, index) => (
                    <div
                      key={`review-${index}`}
                      style={{
                        position: 'absolute',
                        top: `${(8 + index * 0.5) * 4}rem`,
                        height: '2rem',
                        left: '0.25rem',
                        right: '0.25rem',
                        zIndex: 25,
                      }}
                      className="bg-info-900 border-l-2 border-info-400 p-1 rounded text-xs text-content-primary truncate"
                      title={item.description}
                    >
                      📚 {item.unit || 'Review'}
                    </div>
                  ))}

                  {insertBreaks(getTasksForDate(day)).map((task) => (
                      <WeekViewTask
                        key={task.id}
                        task={task}
                        onTaskClick={onTaskClick}
                      />
                  ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName) => (
          <div key={dayName} className="p-2 text-center text-xs font-bold text-content-muted border-b border-r border-border-subtle">
            {dayName}
          </div>
        ))}
        {days.map((day) => {
          const exam = getExamForDate(day);
          const reviewItems = getReviewItemsForDate(day);
          const dayTasks = getTasksForDate(day);
          
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] p-2 border-b border-r border-border-subtle hover:bg-base-850 transition-colors duration-200 relative ${format(day, 'M') !== format(currentDate, 'M') ? 'opacity-50' : ''}`}
              onClick={() => onDateClick && onDateClick(day)}
            >
              <div className="font-semibold text-sm mb-2 flex items-center justify-between text-content-secondary">
                {/* Today used to be the DIMMEST number on the grid (text-content-muted). */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDateClick && onDateClick(day); }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center hover:bg-base-750 ${
                    isTodayDateFns(day) ? 'bg-content-primary text-base-950 hover:bg-content-primary' : ''
                  }`}
                  aria-label={`Open the week of ${format(day, 'MMMM d')}`}
                >
                  {format(day, 'd')}
                </button>
                {exam && (
                  <div className="w-2 h-2 bg-error-500 rounded-full animate-pulse" title={`AP Exam: ${exam.subject}`}></div>
                )}
              </div>
              
              <div className="space-y-1">
                {/* AP Exam Indicator */}
                {exam && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-error-900 border-l-4 border-error-500 p-1 rounded-sm text-xs text-content-primary font-semibold"
                    title={`${exam.subject} AP Exam at ${exam.time}`}
                  >
                    📝 {exam.subject.replace('AP ', '')} Exam
                  </motion.div>
                )}
                
                {/* Review Schedule Items */}
                {reviewItems.map((item, index) => (
                  <motion.div
                    key={`review-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-info-900 border-l-2 border-info-400 p-1 rounded-sm text-xs text-content-primary truncate"
                    title={item.description}
                  >
                    📚 {item.unit || 'Review'}
                  </motion.div>
                ))}

                {getDeadlinesForDate(day).map((t) => <DueChip key={`due-${t.id}`} task={t} onClick={onDeadlineClick} />)}
                
                {/* Regular Tasks */}
                {dayTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`border-l-2 p-1 rounded-sm truncate cursor-pointer text-xs text-content-primary ${getDifficultyColor(task.difficulty)} ${task.completed ? 'line-through opacity-60' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onTaskClick(task); } }}
                  >
                    {task.name}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  return viewMode === 'week' ? renderWeekView() : renderMonthView();
}
