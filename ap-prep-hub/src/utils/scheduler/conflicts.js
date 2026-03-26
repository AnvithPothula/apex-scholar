/**
 * Conflict detection and resolution logic for IntelligentScheduler.
 *
 * Each export is a method that will be mixed into the IntelligentScheduler
 * prototype, so `this` refers to the scheduler instance.
 */

import { format } from 'date-fns';
import {
  getUserTimezone,
  formatDateTimeInUserTimezone,
  getCurrentTimeInUserTimezone
} from '../timezone';

// Gate debug logging behind development mode
const IS_DEV = process.env.NODE_ENV === 'development';
const debugLog = IS_DEV ? (...args) => console.log(...args) : () => {}; // eslint-disable-line no-console

// ---------------------------------------------------------------------------
// Blackout-conflict detection
// ---------------------------------------------------------------------------

export function detectBlackoutConflicts(tasks) {
  debugLog("🔍 Detecting blackout conflicts...");
  const conflicts = [];
  const now = new Date();

  const urgentTasks = tasks.filter(task => {
    const urgency = this.calculateUrgency(task);
    const taskDeadline = task.deadline || task.dueDate;
    let deadline;
    if (taskDeadline) {
      if (taskDeadline.toDate && typeof taskDeadline.toDate === 'function') {
        deadline = taskDeadline.toDate();
      } else {
        deadline = new Date(taskDeadline);
      }
    } else {
      return false;
    }

    const daysUntilDue = (deadline - now) / (1000 * 60 * 60 * 24);
    return urgency === 1.0 || (daysUntilDue <= 2 && urgency > 0.7) || daysUntilDue <= 1;
  });

  debugLog(`📋 Found ${urgentTasks.length} urgent tasks to check for conflicts`);

  for (const task of urgentTasks) {
    const taskConflicts = this.findTaskBlackoutConflicts(task);
    conflicts.push(...taskConflicts);
  }

  debugLog(`⚠️ Total blackout conflicts found: ${conflicts.length}`);
  return conflicts;
}

export function findTaskBlackoutConflicts(task) {
  const conflicts = [];
  const now = new Date();
  const taskDeadline = task.deadline || task.dueDate;
  let dueDate;
  if (taskDeadline) {
    if (taskDeadline.toDate && typeof taskDeadline.toDate === 'function') {
      dueDate = taskDeadline.toDate();
    } else {
      dueDate = new Date(taskDeadline);
    }
  } else {
    console.warn(`⚠️ Task ${task.name} has no deadline, skipping conflict check`);
    return conflicts;
  }

  const daysToCheck = Math.max(1, Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)));

  let availableHours = 0;
  const conflictingBlackouts = [];

  for (let i = 0; i < daysToCheck; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() + i);

    const dayStart = new Date(checkDate);
    dayStart.setHours(this.userPreferences.studyStartTime || 7, 0, 0, 0);

    const dayEnd = new Date(checkDate);
    dayEnd.setHours(this.userPreferences.studyEndTime || 23, 0, 0, 0);

    const dayAvailableHours = this.calculateAvailableHours(checkDate, dayStart, dayEnd, conflictingBlackouts);
    availableHours += dayAvailableHours;
  }

  const remainingTime = task.timeRequired - (task.timeSpent || 0);
  const requiredHours = remainingTime;

  debugLog(`📊 Task "${task.name}": needs ${requiredHours.toFixed(1)}h, available: ${availableHours.toFixed(1)}h`);

  if (availableHours < requiredHours && conflictingBlackouts.length > 0) {
    const shortfall = requiredHours - availableHours;

    const primaryConflict = conflictingBlackouts.reduce((worst, current) => {
      return current.blockedHours > worst.blockedHours ? current : worst;
    });

    conflicts.push({
      taskId: task.id,
      taskName: task.name,
      dueDate: taskDeadline,
      requiredHours: requiredHours,
      availableHours: availableHours,
      shortfallHours: shortfall,
      conflictingBlackout: primaryConflict,
      allConflictingBlackouts: conflictingBlackouts
    });
    debugLog(`⚠️ Conflict detected for "${task.name}": need ${shortfall.toFixed(1)}h more time`);
  }

  return conflicts;
}

export function calculateAvailableHours(date, dayStart, dayEnd, conflictingBlackouts) {
  const dayOfWeek = date.getDay();
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];

  let totalMinutes = (dayEnd - dayStart) / (1000 * 60);
  let blockedMinutes = 0;

  const blackoutSchedule = this.userPreferences?.blackoutSchedule || {};
  const dayBlackouts = blackoutSchedule[dayName] || [];

  for (const blackout of dayBlackouts) {
    let startTime, endTime, blackoutName;

    if (typeof blackout === 'string') {
      const [start, end] = blackout.split('-');
      startTime = start;
      endTime = end;
      blackoutName = 'Blackout Period';
    } else if (blackout.range) {
      const [start, end] = blackout.range.split('-');
      startTime = start;
      endTime = end;
      blackoutName = blackout.name || 'Blackout Period';
    } else if (blackout.startTime && blackout.endTime) {
      startTime = blackout.startTime;
      endTime = blackout.endTime;
      blackoutName = blackout.name || 'Blackout Period';
    } else {
      continue;
    }

    if (!startTime || !endTime) continue;

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const blackoutStart = new Date(date);
    blackoutStart.setHours(startHour, startMin, 0, 0);

    const blackoutEnd = new Date(date);
    blackoutEnd.setHours(endHour, endMin, 0, 0);

    if (endHour < startHour) {
      blackoutEnd.setDate(blackoutEnd.getDate() + 1);
    }

    const overlapStart = Math.max(dayStart.getTime(), blackoutStart.getTime());
    const overlapEnd = Math.min(dayEnd.getTime(), blackoutEnd.getTime());

    if (overlapStart < overlapEnd) {
      const overlapMinutes = (overlapEnd - overlapStart) / (1000 * 60);
      blockedMinutes += overlapMinutes;

      const existingConflict = conflictingBlackouts.find(c =>
        c.name === blackoutName && c.day === dayName
      );

      if (!existingConflict) {
        conflictingBlackouts.push({
          name: blackoutName,
          day: dayName,
          timeRange: `${startTime} - ${endTime}`,
          blockedHours: overlapMinutes / 60,
          startTime: startTime,
          endTime: endTime
        });
      } else {
        existingConflict.blockedHours += overlapMinutes / 60;
      }
    }
  }

  const availableMinutes = Math.max(0, totalMinutes - blockedMinutes);
  return availableMinutes / 60;
}

// ---------------------------------------------------------------------------
// Time-slot conflict checks
// ---------------------------------------------------------------------------

export function findAvailableTimeSlot(date, durationMinutes, task, existingSchedule = []) {
  debugLog(`🔍 Finding time slot for ${task.name} on ${format(date, 'yyyy-MM-dd')} (${durationMinutes}min)`);
  debugLog(`📋 Existing schedule items to avoid:`, existingSchedule.map(item => ({
    name: item.taskName,
    start: item.startTime?.toLocaleTimeString?.() || item.startTime,
    end: item.endTime?.toLocaleTimeString?.() || item.endTime
  })));

  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
  const blackoutSchedule = this.userPreferences.blackoutSchedule || {};
  const dayBlackouts = blackoutSchedule[dayOfWeek] || [];

  debugLog(`📅 Day: ${dayOfWeek}, Blackouts:`, dayBlackouts);

  const now = getCurrentTimeInUserTimezone();
  const userTimezone = getUserTimezone();

  const targetDateStr = format(date, 'yyyy-MM-dd');
  const todayDateStr = format(now, 'yyyy-MM-dd');
  const isToday = targetDateStr === todayDateStr;

  debugLog(`🕐 Current time in ${userTimezone}: ${formatDateTimeInUserTimezone(now)}`);

  let startHour = this.userPreferences.studyStartTime || 7;
  let endHour = this.userPreferences.studyEndTime || 23;

  let adjustedStartMinute = 0;
  if (isToday) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    if (currentHour >= startHour) {
      startHour = currentHour;
      adjustedStartMinute = Math.ceil(currentMinute / 15) * 15;
      if (adjustedStartMinute >= 60) {
        startHour += 1;
        adjustedStartMinute = 0;
      }
    }

    debugLog(`🕐 Today's scheduling: starting from ${startHour}:${String(adjustedStartMinute).padStart(2, '0')} (current time in ${userTimezone}: ${formatDateTimeInUserTimezone(now, { hour: '2-digit', minute: '2-digit' })})`)
  }

  const taskDeadline = task.deadline || task.dueDate;
  if (taskDeadline) {
    let deadline;
    if (taskDeadline.toDate && typeof taskDeadline.toDate === 'function') {
      deadline = taskDeadline.toDate();
    } else {
      deadline = new Date(taskDeadline);
    }

    if (!isNaN(deadline.getTime())) {
      const deadlineHour = deadline.getHours();

      if (isToday && format(deadline, 'yyyy-MM-dd') === todayDateStr) {
        endHour = Math.min(endHour, deadlineHour);
        debugLog(`⏰ Task due today at ${formatDateTimeInUserTimezone(deadline, { hour: '2-digit', minute: '2-digit' })}, adjusting end time to ${endHour}:00`);
      }
    }
  }

  for (let hour = startHour; hour < endHour; hour++) {
    const startMinute = (hour === startHour && isToday) ? (adjustedStartMinute || 0) : 0;

    for (let minute = startMinute; minute < 60; minute += 15) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, minute, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

      if (slotEnd.getHours() > endHour || (slotEnd.getHours() === endHour && slotEnd.getMinutes() > 0)) {
        continue;
      }

      const slotStartTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const slotEndTime = `${String(slotEnd.getHours()).padStart(2, '0')}:${String(slotEnd.getMinutes()).padStart(2, '0')}`;

      debugLog(`🕐 Checking slot: ${slotStartTime}-${slotEndTime}`);

      const hasBlackoutConflict = this.checkBlackoutConflict(slotStartTime, slotEndTime, dayBlackouts);
      const hasScheduleConflict = this.checkScheduleConflict(slotStart, slotEnd, existingSchedule);

      if (!hasBlackoutConflict && !hasScheduleConflict) {
        debugLog(`✅ Found available slot: ${slotStartTime}-${slotEndTime}`);
        return {
          start: slotStart,
          end: slotEnd,
          isOverride: false
        };
      } else {
        if (hasBlackoutConflict) {
          debugLog(`❌ Slot conflicts with blackout: ${slotStartTime}-${slotEndTime}`);
        }
        if (hasScheduleConflict) {
          debugLog(`❌ Slot conflicts with existing schedule: ${slotStartTime}-${slotEndTime}`);
        }
      }
    }
  }

  debugLog(`❌ No available time slot found for ${task.name} on ${format(date, 'yyyy-MM-dd')}`);
  debugLog(`🔍 Debugging info - Start hour: ${startHour}, End hour: ${endHour}, Is today: ${isToday}`);
  debugLog(`🔍 Duration needed: ${durationMinutes} minutes`);
  debugLog(`🔍 Day blackouts:`, dayBlackouts);

  return null;
}

export function checkBlackoutConflict(startTime, endTime, dayBlackouts) {
  debugLog(`🔍 Checking blackout conflict: ${startTime}-${endTime}`);
  debugLog(`🚫 Day blackouts:`, dayBlackouts);

  if (!dayBlackouts || dayBlackouts.length === 0) {
    debugLog(`✅ No blackouts for this day`);
    return false;
  }

  const effectiveBlackouts = dayBlackouts.filter(blackout => {
    if (!this.temporaryBlackoutOverrides || this.temporaryBlackoutOverrides.length === 0) return true;
    const blackoutRange = typeof blackout === 'string' ? blackout : (blackout.range || `${blackout.start || blackout.startTime}-${blackout.end || blackout.endTime}`);
    const blackoutName = blackout.name || blackoutRange;
    return !this.temporaryBlackoutOverrides.some(override =>
      (override.range === blackoutRange) || (override.name === blackoutName)
    );
  });

  if (effectiveBlackouts.length === 0) {
    debugLog(`✅ All blackouts overridden for this slot`);
    return false;
  }

  for (const blackout of effectiveBlackouts) {
    let blackoutStart, blackoutEnd;

    if (typeof blackout === 'string') {
      const [start, end] = blackout.split('-');
      blackoutStart = start;
      blackoutEnd = end;
    } else if (blackout.range) {
      const [start, end] = blackout.range.split('-');
      blackoutStart = start;
      blackoutEnd = end;
    } else if (blackout.start && blackout.end) {
      blackoutStart = blackout.start;
      blackoutEnd = blackout.end;
    } else if (blackout.startTime && blackout.endTime) {
      blackoutStart = blackout.startTime;
      blackoutEnd = blackout.endTime;
    } else {
      debugLog(`⚠️ Invalid blackout format:`, blackout);
      continue;
    }

    debugLog(`🔍 Checking against blackout: ${blackoutStart}-${blackoutEnd}`);

    const isOvernightRange = this.isOvernightTimeRange(blackoutStart, blackoutEnd);

    if (isOvernightRange) {
      const period1Start = blackoutStart;
      const period1End = "23:59";
      const period2Start = "00:00";
      const period2End = blackoutEnd;

      if (this.hasTimeOverlap(startTime, endTime, period1Start, period1End)) {
        debugLog(`❌ Conflict found with overnight blackout period 1: ${period1Start}-${period1End}`);
        return true;
      }

      if (this.hasTimeOverlap(startTime, endTime, period2Start, period2End)) {
        debugLog(`❌ Conflict found with overnight blackout period 2: ${period2Start}-${period2End}`);
        return true;
      }
    } else {
      if (this.hasTimeOverlap(startTime, endTime, blackoutStart, blackoutEnd)) {
        debugLog(`❌ Conflict found with blackout: ${blackoutStart}-${blackoutEnd}`);
        return true;
      }
    }
  }

  debugLog(`✅ No conflicts found`);
  return false;
}

export function isOvernightTimeRange(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  return startHour > endHour || (startHour === endHour && startMin > endMin);
}

export function hasTimeOverlap(startTime1, endTime1, startTime2, endTime2) {
  const [start1Hour, start1Min] = startTime1.split(':').map(Number);
  const [end1Hour, end1Min] = endTime1.split(':').map(Number);
  const [start2Hour, start2Min] = startTime2.split(':').map(Number);
  const [end2Hour, end2Min] = endTime2.split(':').map(Number);

  const start1Minutes = start1Hour * 60 + start1Min;
  const end1Minutes = end1Hour * 60 + end1Min;
  const start2Minutes = start2Hour * 60 + start2Min;
  const end2Minutes = end2Hour * 60 + end2Min;

  return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
}

export function checkScheduleConflict(slotStart, slotEnd, existingSchedule) {
  debugLog(`🔍 Checking schedule conflict: ${formatDateTimeInUserTimezone(slotStart, { hour: '2-digit', minute: '2-digit' })}-${formatDateTimeInUserTimezone(slotEnd, { hour: '2-digit', minute: '2-digit' })} (${getUserTimezone()})`);
  debugLog(`📋 Existing schedule items to check:`, existingSchedule?.length || 0);

  if (!existingSchedule || existingSchedule.length === 0) {
    debugLog(`✅ No existing schedule items to check`);
    return false;
  }

  for (const scheduled of existingSchedule) {
    if (!scheduled || !scheduled.startTime || !scheduled.endTime) {
      debugLog(`⚠️ Skipping invalid schedule item:`, scheduled);
      continue;
    }

    let scheduledStart, scheduledEnd;

    if (scheduled.startTime instanceof Date) {
      scheduledStart = scheduled.startTime;
      scheduledEnd = scheduled.endTime;
    } else {
      scheduledStart = new Date(scheduled.startTime);
      scheduledEnd = new Date(scheduled.endTime);
    }

    debugLog(`🔍 Checking against: ${scheduled.taskName || scheduled.task} (${formatDateTimeInUserTimezone(scheduledStart, { hour: '2-digit', minute: '2-digit' })}-${formatDateTimeInUserTimezone(scheduledEnd, { hour: '2-digit', minute: '2-digit' })})`);

    const slotStartTime = slotStart.getTime();
    const slotEndTime = slotEnd.getTime();
    const scheduledStartTime = scheduledStart.getTime();
    const scheduledEndTime = scheduledEnd.getTime();

    const overlaps = (slotStartTime < scheduledEndTime && slotEndTime > scheduledStartTime);

    if (overlaps) {
      debugLog(`❌ Schedule conflict found with: ${scheduled.taskName || scheduled.task}`);
      debugLog(`   New slot: ${formatDateTimeInUserTimezone(slotStart, { hour: '2-digit', minute: '2-digit' })}-${formatDateTimeInUserTimezone(slotEnd, { hour: '2-digit', minute: '2-digit' })} (${slotStartTime}-${slotEndTime})`);
      debugLog(`   Existing: ${formatDateTimeInUserTimezone(scheduledStart, { hour: '2-digit', minute: '2-digit' })}-${formatDateTimeInUserTimezone(scheduledEnd, { hour: '2-digit', minute: '2-digit' })} (${scheduledStartTime}-${scheduledEndTime})`);
      return true;
    }
  }

  debugLog(`✅ No schedule conflicts found`);
  return false;
}
