import {
    startOfDay,
    addMinutes,
    isBefore,
    isAfter,
    parseISO,
    setHours,
    setMinutes,
    getMinutes,
  } from 'date-fns';
  
  const SchedulingEngine = {
    // Normalize time to 15-minute intervals
    roundToNearest15(date) {
      const minutes = getMinutes(date);
      const roundedMinutes = Math.round(minutes / 15) * 15;
      return setMinutes(date, roundedMinutes);
    },

    // Check if a time slot is within business hours (8 AM - 10 PM)
    isWithinBusinessHours(date) {
      const hour = date.getHours();
      return hour >= 8 && hour < 22;
    },

    // Check if a date is a weekend
    isWeekend(date) {
      const day = date.getDay();
      return day === 0 || day === 6;
    },
  
    // Find the next available slot for a task
    findNextAvailableSlot(startTime, duration, existingTasks, blackoutSchedule = {}) {
      let currentSlotStart = this.roundToNearest15(new Date(startTime));
      const maxDaysToSearch = 30; // Limit search to 30 days
      const maxIterations = maxDaysToSearch * 24 * 4; // 15-min intervals per day
      const conflicts = []; // Track conflicts for better error reporting
  
      for (let i = 0; i < maxIterations; i++) {
        // Skip to next day if outside business hours
        if (!this.isWithinBusinessHours(currentSlotStart)) {
          const nextDay = new Date(currentSlotStart);
          nextDay.setDate(nextDay.getDate() + 1);
          nextDay.setHours(8, 0, 0, 0);
          currentSlotStart = this.roundToNearest15(nextDay);
          continue;
        }

        let proposedEnd = addMinutes(currentSlotStart, duration);
        let isConflict = false;

        // Ensure the entire slot is within business hours
        if (!this.isWithinBusinessHours(proposedEnd)) {
          const nextDay = new Date(currentSlotStart);
          nextDay.setDate(nextDay.getDate() + 1);
          nextDay.setHours(8, 0, 0, 0);
          currentSlotStart = this.roundToNearest15(nextDay);
          continue;
        }

        // Check for blackout periods
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][currentSlotStart.getDay()];
        const blackoutRanges = blackoutSchedule[dayOfWeek] || [];
        
        for (const blackout of blackoutRanges) {
          try {
            let startStr, endStr, blackoutName;
            
            // Handle both string format ("08:00-15:00") and object format ({ range: "08:00-15:00", name: "School Hours" })
            if (typeof blackout === 'string') {
              [startStr, endStr] = blackout.split('-');
              blackoutName = 'Blackout Period';
            } else if (blackout.range) {
              [startStr, endStr] = blackout.range.split('-');
              blackoutName = blackout.name || 'Blackout Period';
            } else {
              continue;
            }
            
            if (!startStr || !endStr) continue;
            
            const [startHour, startMin] = startStr.split(':').map(Number);
            const [endHour, endMin] = endStr.split(':').map(Number);
            
            if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) continue;
            
            const blackoutStart = setMinutes(setHours(new Date(currentSlotStart), startHour), startMin);
            const blackoutEnd = setMinutes(setHours(new Date(currentSlotStart), endHour), endMin);

            // Handle overnight blackouts (e.g., 22:00-07:00)
            if (endHour < startHour) {
              // Split into two same-day periods:
              //   Evening portion: startHour:startMin to 23:59 (today)
              //   Morning portion: 00:00 to endHour:endMin (today)
              const midnightToday = setMinutes(setHours(new Date(currentSlotStart), 23), 59);
              const morningEnd = setMinutes(setHours(new Date(currentSlotStart), endHour), endMin);
              
              const inEveningBlackout = currentSlotStart >= blackoutStart && currentSlotStart <= midnightToday;
              const inMorningBlackout = currentSlotStart < morningEnd;
              
              if (inEveningBlackout || inMorningBlackout) {
                conflicts.push({
                  blackoutName,
                  timeRange: `${startStr}-${endStr}`,
                  day: dayOfWeek
                });
                if (inMorningBlackout) {
                  currentSlotStart = this.roundToNearest15(addMinutes(morningEnd, 15));
                } else {
                  // Evening blackout — no more valid slots today
                  currentSlotStart = null;
                }
                isConflict = true;
                break;
              }
            } else {
              // Normal blackout within same day
              if (currentSlotStart < blackoutEnd && proposedEnd > blackoutStart) {
                conflicts.push({
                  blackoutName,
                  timeRange: `${startStr}-${endStr}`,
                  day: dayOfWeek
                });
                currentSlotStart = this.roundToNearest15(addMinutes(blackoutEnd, 15));
                isConflict = true;
                break;
              }
            }
          } catch (error) {
            console.warn('Invalid blackout range format:', blackout);
            continue;
          }
        }
        if (isConflict) continue;

        // Check for conflicts with existing tasks
        for (const task of existingTasks) {
          if (!task.scheduled_start || !task.scheduled_end) continue;
          
          try {
            const taskStart = parseISO(task.scheduled_start);
            const taskEnd = parseISO(task.scheduled_end);
            
            if (currentSlotStart < taskEnd && proposedEnd > taskStart) {
              currentSlotStart = this.roundToNearest15(addMinutes(taskEnd, 15));
              isConflict = true;
              break;
            }
          } catch (error) {
            console.warn('Invalid task time format:', task);
            continue;
          }
        }
        if (isConflict) continue;

        return currentSlotStart;
      }
      
      // If no slot is found, return null with conflict information
      return { conflicts };
    },
  
    // Generate a smart schedule for unscheduled tasks
    generateSmartSchedule(unscheduledTasks, scheduledTasks, blackoutSchedule = {}) {
      if (!unscheduledTasks || unscheduledTasks.length === 0) {
        return { schedule: [], errors: [], blackoutConflicts: [] };
      }

      const sortedTasks = [...unscheduledTasks].sort((a, b) => {
        const deadlineA = a.deadline ? new Date(a.deadline) : new Date('2999-12-31');
        const deadlineB = b.deadline ? new Date(b.deadline) : new Date('2999-12-31');
        if (deadlineA.getTime() !== deadlineB.getTime()) {
          return deadlineA - deadlineB;
        }
        const difficultyOrder = { Hard: 3, Medium: 2, Easy: 1 };
        const diffA = difficultyOrder[a.difficulty] || 2;
        const diffB = difficultyOrder[b.difficulty] || 2;
        return diffB - diffA;
      });

      const schedule = [];
      const errors = [];
      const blackoutConflicts = [];
      let existingTasks = [...scheduledTasks];
      let now = new Date();
      
      // Start scheduling from the next hour if current time is close
      if (now.getMinutes() > 45) {
        now.setHours(now.getHours() + 1, 0, 0, 0);
      } else {
        now = this.roundToNearest15(now);
      }

      for (const task of sortedTasks) {
        if (!task.estimated_time || task.estimated_time <= 0) {
          errors.push(`Task "${task.name}" has no valid estimated time.`);
          continue;
        }

        let remainingTime = task.estimated_time;
        const maxSessionDuration = Math.min(120, Math.max(30, remainingTime)); // Between 30min-2hrs
        let sessionCount = 0;
        const totalSessions = Math.ceil(remainingTime / maxSessionDuration);
        let taskScheduled = false;
        let currentSearchStart = new Date(now);

        while (remainingTime > 0 && sessionCount < 10) { // Limit sessions per task
          sessionCount++;
          const sessionDuration = Math.min(remainingTime, maxSessionDuration);
          
          if (sessionDuration < 15) { // Skip very short sessions
            break;
          }
          
          const slotResult = this.findNextAvailableSlot(currentSearchStart, sessionDuration, existingTasks, blackoutSchedule);
          
          // Handle both old format (startTime or null) and new format ({ conflicts })
          let startTime = null;
          if (slotResult && !slotResult.conflicts) {
            startTime = slotResult;
          } else if (slotResult && slotResult.conflicts) {
            // Task conflicts with blackouts
            const now = new Date();
            const deadline = task.deadline ? new Date(task.deadline) : null;
            const hoursUntilDeadline = deadline ? (deadline - now) / (1000 * 60 * 60) : Infinity;
            
            // Only create blackout conflict if deadline is urgent (within 24 hours)
            if (hoursUntilDeadline <= 24) {
              blackoutConflicts.push({
                taskId: task.id,
                taskName: task.name,
                deadline: task.deadline,
                conflictingBlackouts: slotResult.conflicts,
                conflictingBlackout: slotResult.conflicts[0] || { name: 'Unknown', timeRange: 'Unknown' }
              });
            }
            break;
          }
          
          if (!startTime) {
            errors.push(`Could not find available slot for "${task.name}".`);
            break;
          }
          
          // Check if we can schedule before deadline
          if (task.deadline) {
            const deadline = new Date(task.deadline);
            if (isAfter(startTime, deadline)) {
              errors.push(`Could not schedule "${task.name}" before its deadline.`);
              break; 
            }
          }

          const endTime = addMinutes(startTime, sessionDuration);

          const newEvent = {
            taskName: totalSessions > 1 ? `${task.name} (${sessionCount}/${totalSessions})` : task.name,
            taskId: task.id,
            subject: task.subject || 'General',
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: sessionDuration,
            sessionNumber: sessionCount,
            totalSessions: totalSessions,
            isNewTask: sessionCount === 1,
            originalTaskId: task.id
          };
          
          schedule.push(newEvent);
          
          // Add buffer time between tasks (15 minutes)
          const nextSlotStart = addMinutes(endTime, 15);
          existingTasks.push({ 
            scheduled_start: newEvent.startTime, 
            scheduled_end: addMinutes(new Date(newEvent.endTime), 15).toISOString()
          });
          
          currentSearchStart = nextSlotStart;
          remainingTime -= sessionDuration;
          taskScheduled = true;
        }

        if (!taskScheduled) {
          errors.push(`Could not schedule any sessions for "${task.name}".`);
        }
      }

      return { schedule, errors, blackoutConflicts };
    },
  };
  
  export default SchedulingEngine;
  