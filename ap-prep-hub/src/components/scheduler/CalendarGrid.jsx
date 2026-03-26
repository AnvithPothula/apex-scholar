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
} from 'date-fns';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { getUpcomingExamsSync } from '../../constants/apExamDates';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "bg-success-900/50 text-success-200 border-success-800";
      case "Medium": return "bg-warning-900/50 text-warning-200 border-warning-800";
      case "Hard": return "bg-error-900/50 text-error-200 border-error-800";
      default: return "bg-base-900/50 text-content-muted border-base-800";
    }
};

const WeekViewTask = ({ task, onTaskClick }) => {
    const start = parseISO(task.scheduled_start);
    const end = parseISO(task.scheduled_end);

    const startHour = getHours(start) + getMinutes(start) / 60;
    const endHour = getHours(end) + getMinutes(end) / 60;
    
    const topPosition = startHour * 4; // Each hour is 4rem (h-16) high
    const heightDuration = (endHour - startHour) * 4;

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
            className={`p-2 rounded-sm text-xs font-medium cursor-pointer transition-all duration-200 overflow-hidden shadow-raised hover:shadow-floating ${getDifficultyColor(task.difficulty)}`}
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onTaskClick(task); } }}
        >
            <div data-filename="pages/ViewCode" data-linenumber="1065" data-visual-selector-id="pages/ViewCode1065" className="flex flex-col h-full justify-between">
                <span data-filename="pages/ViewCode" data-linenumber="1066" data-visual-selector-id="pages/ViewCode1066" className="font-bold text-content-primary leading-tight">{task.name}</span>
                <span data-filename="pages/ViewCode" data-linenumber="1067" data-visual-selector-id="pages/ViewCode1067" className="text-content-secondary">{task.subject}</span>
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
  onTaskMove,
}) {
  const { user } = useAuth();
  const [upcomingExams, setUpcomingExams] = React.useState([]);

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
          
          // Get upcoming exams for user's subjects
          const exams = getUpcomingExamsSync(subjects);
          setUpcomingExams(exams);
        }
      } catch (error) {
        console.error("Error loading user data for calendar:", error);
      }
    };

    loadUserData();
  }, [user]);

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
      <div data-filename="pages/ViewCode" data-linenumber="1091" data-visual-selector-id="pages/ViewCode1091" className="overflow-x-auto h-full">
        <div data-filename="pages/ViewCode" data-linenumber="1092" data-visual-selector-id="pages/ViewCode1092" className="grid grid-cols-[auto_repeat(7,minmax(150px,1fr))] min-w-[1200px] h-full">
          {/* Top-left empty cell */}
          <div data-filename="pages/ViewCode" data-linenumber="1094" data-visual-selector-id="pages/ViewCode1094" className="sticky left-0 top-0 z-30 bg-base-900 border-b border-r border-border-subtle p-2"></div>
          {/* Days Header */}
          {days.map((d) => {
            const exam = getExamForDate(d);
            const reviewItems = getReviewItemsForDate(d);
            
            return (
              <div data-filename="pages/ViewCode" data-linenumber="1097" data-visual-selector-id="pages/ViewCode1097" key={d.toISOString()} className="p-4 text-center border-b border-border-subtle bg-base-900 sticky top-0 z-20">
                <div data-filename="pages/ViewCode" data-linenumber="1098" data-visual-selector-id="pages/ViewCode1098" className="font-semibold text-content-primary flex items-center justify-center gap-2">
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
                  <div className="text-xs text-error-300 mt-1 font-medium">
                    📝 {exam.subject.replace('AP ', '')}
                  </div>
                )}
                {reviewItems.length > 0 && !exam && (
                  <div className="text-xs text-info-300 mt-1">
                    📚 {reviewItems.length} review{reviewItems.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            );
          })}
          {/* Time column */}
          <div data-filename="pages/ViewCode" data-linenumber="1109" data-visual-selector-id="pages/ViewCode1109" className="sticky left-0 z-20 bg-base-900 border-r border-border-subtle">
            {timeSlots.map((hour) => (
              <div data-filename="pages/ViewCode" data-linenumber="1111" data-visual-selector-id="pages/ViewCode1111" key={hour} className="h-16 p-2 text-xs text-content-muted border-b border-border-subtle text-right flex items-center justify-end">
                {format(new Date(2000, 0, 1, hour), "ha")}
              </div>
            ))}
          </div>
          {/* Calendar Body */}
          {days.map((day) => {
            const exam = getExamForDate(day);
            const reviewItems = getReviewItemsForDate(day);
            
            return (
              <Droppable
                  droppableId={day.toISOString()}
                  key={day.toISOString()}
              >
                  {(provided, snapshot) => (
                      <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`relative h-full ${snapshot.isDraggingOver ? 'bg-base-850/70' : ''}`}
                      >
                          {/* Grid lines */}
                          {timeSlots.map((hour) => (
                              <div
                                key={hour}
                                className="h-16 border-b border-r border-border-subtle"
                              />
                          ))}
                          
                          {/* AP Exam indicator at exam time */}
                          {exam && (
                            <div
                              style={{
                                position: 'absolute',
                                top: `${(parseInt(exam.time.split(':')[0]) * 4)}rem`,
                                height: '3rem',
                                left: '0.25rem',
                                right: '0.25rem',
                                zIndex: 30,
                              }}
                              className="bg-error-900/70 border-l-4 border-error-500 p-2 rounded-sm text-xs font-bold text-error-200 shadow-raised"
                            >
                              📝 {exam.subject.replace('AP ', '')} Exam
                              <div className="text-error-300 text-xs">{exam.time}</div>
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
                              className="bg-info-900/50 border-l-2 border-info-400 p-1 rounded text-xs text-info-200"
                              title={item.description}
                            >
                              📚 {item.unit.length > 15 ? item.unit.substring(0, 15) + '...' : item.unit}
                            </div>
                          ))}
                          
                          {getTasksForDate(day).map((task, index) => (
                              <Draggable data-filename="pages/ViewCode" data-linenumber="1136" data-visual-selector-id="pages/ViewCode1136" key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                      <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={{...provided.draggableProps.style}}
                                          onClick={() => onTaskClick(task)}
                                      >
                                        <WeekViewTask data-filename="pages/ViewCode" data-linenumber="1145" data-visual-selector-id="pages/ViewCode1145" task={task} onTaskClick={onTaskClick} />
                                      </div>
                                  )}
                              </Draggable>
                          ))}
                          {provided.placeholder}
                      </div>
                  )}
              </Droppable>
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
      <div data-filename="pages/ViewCode" data-linenumber="1168" data-visual-selector-id="pages/ViewCode1168" className="grid grid-cols-7">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName) => (
          <div data-filename="pages/ViewCode" data-linenumber="1170" data-visual-selector-id="pages/ViewCode1170" key={dayName} className="p-2 text-center text-xs font-bold text-content-muted border-b border-r border-border-subtle">
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
              className="min-h-[120px] p-2 border-b border-r border-border-subtle hover:bg-base-850/50 transition-colors duration-200 relative"
              onClick={() => onDateClick && onDateClick(day)}
            >
              <div
                className={`font-semibold text-sm mb-2 flex items-center justify-between ${
                  isTodayDateFns(day) ? "text-content-muted" : "text-content-secondary"
                } ${format(day, 'M') !== format(currentDate, 'M') ? 'opacity-50' : ''}`}
              >
                <span>{format(day, 'd')}</span>
                {exam && (
                  <div className="w-2 h-2 bg-error-500 rounded-full animate-pulse" title={`AP Exam: ${exam.subject}`}></div>
                )}
              </div>
              
              <div data-filename="pages/ViewCode" data-linenumber="1187" data-visual-selector-id="pages/ViewCode1187" className="space-y-1">
                {/* AP Exam Indicator */}
                {exam && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-error-900/70 border-l-4 border-error-500 p-1 rounded-sm text-xs text-error-200 font-semibold"
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
                    className="bg-info-900/50 border-l-2 border-info-400 p-1 rounded-sm text-xs text-info-200"
                    title={item.description}
                  >
                    📚 {item.unit.length > 20 ? item.unit.substring(0, 20) + '...' : item.unit}
                  </motion.div>
                ))}
                
                {/* Regular Tasks */}
                {dayTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`border-l-2 p-1 rounded-sm truncate cursor-pointer text-xs ${getDifficultyColor(task.difficulty)}`}
                    onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
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