/**
 * Tests for Blackout Schedule Manager
 * Validates blackout schedule normalization, time validation, and range handling
 */

describe('Blackout Schedule Utilities', () => {
  // Helper function replicating normalizeScheduleItem from the component
  const normalizeScheduleItem = (item) => {
    if (typeof item === 'string') {
      return { 
        range: item, 
        name: getDefaultName(item) || "Custom Block", 
        id: `legacy-${item}-${Date.now()}-${Math.random()}` 
      };
    }
    return {
      range: item.range || "09:00-17:00",
      name: item.name || "Custom Block",
      id: item.id || `item-${Date.now()}-${Math.random()}`
    };
  };

  const getDefaultName = (range) => {
    const commonRanges = {
      "22:00-07:00": "Sleep Time",
      "08:00-15:00": "School Hours",
      "09:00-17:00": "Work Hours",
      "23:00-06:00": "Sleep Time",
      "07:00-16:00": "School Hours"
    };
    return commonRanges[range];
  };

  // Time validation regex from the component
  const isValidTimeFormat = (time) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  describe('normalizeScheduleItem', () => {
    it('should convert string format to object format', () => {
      const result = normalizeScheduleItem("09:00-17:00");
      expect(result.range).toBe("09:00-17:00");
      expect(result.name).toBe("Work Hours");
      expect(result.id).toBeDefined();
    });

    it('should identify sleep time from common ranges', () => {
      const result = normalizeScheduleItem("22:00-07:00");
      expect(result.name).toBe("Sleep Time");
    });

    it('should identify school hours from common ranges', () => {
      const result = normalizeScheduleItem("08:00-15:00");
      expect(result.name).toBe("School Hours");
    });

    it('should handle object format with all fields', () => {
      const input = { range: "10:00-12:00", name: "Lunch", id: "lunch-123" };
      const result = normalizeScheduleItem(input);
      expect(result.range).toBe("10:00-12:00");
      expect(result.name).toBe("Lunch");
      expect(result.id).toBe("lunch-123");
    });

    it('should provide default range if missing', () => {
      const input = { name: "Custom", id: "custom-1" };
      const result = normalizeScheduleItem(input);
      expect(result.range).toBe("09:00-17:00");
    });

    it('should provide default name if missing', () => {
      const input = { range: "14:00-16:00", id: "custom-2" };
      const result = normalizeScheduleItem(input);
      expect(result.name).toBe("Custom Block");
    });

    it('should generate unique IDs for string inputs', () => {
      const result1 = normalizeScheduleItem("09:00-17:00");
      const result2 = normalizeScheduleItem("09:00-17:00");
      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('Time format validation', () => {
    it('should validate correct time format HH:MM', () => {
      expect(isValidTimeFormat("09:00")).toBe(true);
      expect(isValidTimeFormat("17:30")).toBe(true);
      expect(isValidTimeFormat("00:00")).toBe(true);
      expect(isValidTimeFormat("23:59")).toBe(true);
    });

    it('should accept single-digit hours', () => {
      expect(isValidTimeFormat("9:00")).toBe(true);
      expect(isValidTimeFormat("1:30")).toBe(true);
    });

    it('should reject invalid time formats', () => {
      expect(isValidTimeFormat("25:00")).toBe(false);
      expect(isValidTimeFormat("12:60")).toBe(false);
      expect(isValidTimeFormat("9:5")).toBe(false);
      expect(isValidTimeFormat("900")).toBe(false);
      expect(isValidTimeFormat("9-00")).toBe(false);
      expect(isValidTimeFormat("")).toBe(false);
    });

    it('should reject invalid hours', () => {
      expect(isValidTimeFormat("24:00")).toBe(false);
      expect(isValidTimeFormat("99:00")).toBe(false);
    });

    it('should reject invalid minutes', () => {
      expect(isValidTimeFormat("12:60")).toBe(false);
      expect(isValidTimeFormat("12:99")).toBe(false);
    });
  });

  describe('Time range parsing', () => {
    const parseTimeRange = (rangeString) => {
      if (!rangeString || !rangeString.includes('-')) return null;
      const [start, end] = rangeString.split('-');
      if (!isValidTimeFormat(start) || !isValidTimeFormat(end)) return null;
      return { start, end };
    };

    it('should parse valid time range', () => {
      const result = parseTimeRange("09:00-17:00");
      expect(result).toEqual({ start: "09:00", end: "17:00" });
    });

    it('should handle overnight ranges', () => {
      const result = parseTimeRange("22:00-07:00");
      expect(result).toEqual({ start: "22:00", end: "07:00" });
    });

    it('should return null for invalid range', () => {
      expect(parseTimeRange("invalid")).toBeNull();
      expect(parseTimeRange("")).toBeNull();
      expect(parseTimeRange(null)).toBeNull();
    });

    it('should return null for missing hyphen', () => {
      expect(parseTimeRange("09001700")).toBeNull();
    });
  });

  describe('Default blackout templates', () => {
    const DEFAULT_BLACKOUTS = {
      sleepTime: { name: "Sleep Time", range: "22:00-07:00", description: "Nighttime rest" },
      schoolHours: { name: "School Hours", range: "08:00-15:00", description: "Class time" },
      workHours: { name: "Work Hours", range: "09:00-17:00", description: "Work time" },
      earlyMorning: { name: "Early Morning", range: "05:00-08:00", description: "Early hours" },
      lateEvening: { name: "Late Evening", range: "20:00-23:00", description: "Evening time" }
    };

    it('should have valid sleep time template', () => {
      expect(DEFAULT_BLACKOUTS.sleepTime.range).toBe("22:00-07:00");
      expect(DEFAULT_BLACKOUTS.sleepTime.name).toBe("Sleep Time");
    });

    it('should have valid school hours template', () => {
      expect(DEFAULT_BLACKOUTS.schoolHours.range).toBe("08:00-15:00");
    });

    it('should have valid work hours template', () => {
      expect(DEFAULT_BLACKOUTS.workHours.range).toBe("09:00-17:00");
    });

    it('should all have valid time format in templates', () => {
      Object.values(DEFAULT_BLACKOUTS).forEach(template => {
        const [start, end] = template.range.split('-');
        expect(isValidTimeFormat(start)).toBe(true);
        expect(isValidTimeFormat(end)).toBe(true);
      });
    });
  });

  describe('Schedule structure', () => {
    const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    it('should have all 7 days defined', () => {
      expect(DAYS.length).toBe(7);
      expect(DAYS).toContain("monday");
      expect(DAYS).toContain("sunday");
    });

    it('should create valid empty schedule', () => {
      const emptySchedule = DAYS.reduce((acc, day) => {
        acc[day] = [];
        return acc;
      }, {});

      DAYS.forEach(day => {
        expect(Array.isArray(emptySchedule[day])).toBe(true);
        expect(emptySchedule[day].length).toBe(0);
      });
    });

    it('should handle adding items to schedule', () => {
      const schedule = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      };

      const newItem = {
        range: "09:00-12:00",
        name: "Work Meeting",
        id: "meeting-1"
      };

      schedule.monday = [...schedule.monday, newItem];
      expect(schedule.monday.length).toBe(1);
      expect(schedule.monday[0].name).toBe("Work Meeting");
    });

    it('should handle removing items from schedule', () => {
      const schedule = {
        monday: [
          { range: "09:00-12:00", name: "Meeting", id: "1" },
          { range: "14:00-16:00", name: "Class", id: "2" }
        ]
      };

      schedule.monday = schedule.monday.filter(item => item.id !== "1");
      expect(schedule.monday.length).toBe(1);
      expect(schedule.monday[0].name).toBe("Class");
    });
  });
});

describe('Scheduler Blackout Conflict Detection', () => {
  // Replicating logic from IntelligentScheduler
  const isOvernightTimeRange = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    return startHour > endHour || (startHour === endHour && startMin > endMin);
  };

  const hasTimeOverlap = (startTime1, endTime1, startTime2, endTime2) => {
    const [start1Hour, start1Min] = startTime1.split(':').map(Number);
    const [end1Hour, end1Min] = endTime1.split(':').map(Number);
    const [start2Hour, start2Min] = startTime2.split(':').map(Number);
    const [end2Hour, end2Min] = endTime2.split(':').map(Number);
    
    const start1Minutes = start1Hour * 60 + start1Min;
    const end1Minutes = end1Hour * 60 + end1Min;
    const start2Minutes = start2Hour * 60 + start2Min;
    const end2Minutes = end2Hour * 60 + end2Min;
    
    return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
  };

  describe('isOvernightTimeRange', () => {
    it('should detect overnight range like 22:00-07:00', () => {
      expect(isOvernightTimeRange("22:00", "07:00")).toBe(true);
    });

    it('should detect overnight range like 23:00-06:00', () => {
      expect(isOvernightTimeRange("23:00", "06:00")).toBe(true);
    });

    it('should not detect normal daytime range', () => {
      expect(isOvernightTimeRange("09:00", "17:00")).toBe(false);
    });

    it('should not detect same hour range', () => {
      expect(isOvernightTimeRange("14:00", "14:30")).toBe(false);
    });

    it('should detect edge case where end is before start', () => {
      expect(isOvernightTimeRange("20:00", "08:00")).toBe(true);
    });
  });

  describe('hasTimeOverlap', () => {
    it('should detect overlapping time slots', () => {
      expect(hasTimeOverlap("09:00", "11:00", "10:00", "12:00")).toBe(true);
    });

    it('should detect fully contained time slots', () => {
      expect(hasTimeOverlap("09:00", "17:00", "10:00", "12:00")).toBe(true);
    });

    it('should not detect adjacent time slots as overlapping', () => {
      expect(hasTimeOverlap("09:00", "10:00", "10:00", "11:00")).toBe(false);
    });

    it('should not detect non-overlapping time slots', () => {
      expect(hasTimeOverlap("09:00", "10:00", "14:00", "16:00")).toBe(false);
    });

    it('should detect when slot1 starts during slot2', () => {
      expect(hasTimeOverlap("10:30", "12:00", "10:00", "11:00")).toBe(true);
    });

    it('should detect when slot1 ends during slot2', () => {
      expect(hasTimeOverlap("09:00", "10:30", "10:00", "12:00")).toBe(true);
    });
  });

  describe('Blackout conflict checking', () => {
    const checkBlackoutConflict = (startTime, endTime, dayBlackouts) => {
      if (!dayBlackouts || dayBlackouts.length === 0) return false;
      
      for (const blackout of dayBlackouts) {
        let blackoutStart, blackoutEnd;
        
        if (typeof blackout === 'string') {
          const [start, end] = blackout.split('-');
          blackoutStart = start;
          blackoutEnd = end;
        } else if (blackout.range) {
          const [start, end] = blackout.range.split('-');
          blackoutStart = start;
          blackoutEnd = end;
        } else {
          continue;
        }
        
        const overnight = isOvernightTimeRange(blackoutStart, blackoutEnd);
        
        if (overnight) {
          // Check period 1: evening part (e.g., 22:00-23:59)
          if (hasTimeOverlap(startTime, endTime, blackoutStart, "23:59")) {
            return true;
          }
          // Check period 2: morning part (e.g., 00:00-07:00)
          if (hasTimeOverlap(startTime, endTime, "00:00", blackoutEnd)) {
            return true;
          }
        } else {
          if (hasTimeOverlap(startTime, endTime, blackoutStart, blackoutEnd)) {
            return true;
          }
        }
      }
      
      return false;
    };

    it('should detect conflict with string format blackout', () => {
      const blackouts = ["09:00-12:00"];
      expect(checkBlackoutConflict("10:00", "11:00", blackouts)).toBe(true);
    });

    it('should detect conflict with object format blackout', () => {
      const blackouts = [{ range: "09:00-12:00", name: "Meeting" }];
      expect(checkBlackoutConflict("10:00", "11:00", blackouts)).toBe(true);
    });

    it('should not find conflict when no blackouts', () => {
      expect(checkBlackoutConflict("10:00", "11:00", [])).toBe(false);
      expect(checkBlackoutConflict("10:00", "11:00", null)).toBe(false);
    });

    it('should handle overnight blackout - conflict in evening', () => {
      const blackouts = ["22:00-07:00"];
      expect(checkBlackoutConflict("23:00", "23:30", blackouts)).toBe(true);
    });

    it('should handle overnight blackout - conflict in morning', () => {
      const blackouts = ["22:00-07:00"];
      expect(checkBlackoutConflict("06:00", "06:30", blackouts)).toBe(true);
    });

    it('should handle overnight blackout - no conflict during day', () => {
      const blackouts = ["22:00-07:00"];
      expect(checkBlackoutConflict("12:00", "13:00", blackouts)).toBe(false);
    });

    it('should check multiple blackouts', () => {
      const blackouts = [
        { range: "08:00-09:00", name: "Morning block" },
        { range: "12:00-13:00", name: "Lunch" }
      ];
      expect(checkBlackoutConflict("08:30", "09:30", blackouts)).toBe(true);
      expect(checkBlackoutConflict("12:30", "13:30", blackouts)).toBe(true);
      expect(checkBlackoutConflict("10:00", "11:00", blackouts)).toBe(false);
    });
  });
});

describe('Settings Validation', () => {
  // Default study preferences from Settings.js
  const getDefaultStudyPreferences = () => ({
    sessionLength: 50,
    breakLength: 10,
    longBreakLength: 30,
    maxStudyHoursPerDay: 6,
    studyStartTime: 7,
    studyEndTime: 22,
    weekendStudy: true,
    studyIntensity: 'moderate',
    preferMorningStudy: true,
    maxConcurrentSubjects: 3,
    difficultTasksInMorning: true,
    avoidPostLunchDip: true,
    timezone: 'America/Chicago',
    procrastinationBuffer: 0.2
  });

  describe('Default preferences', () => {
    it('should have all required fields', () => {
      const defaults = getDefaultStudyPreferences();
      expect(defaults.sessionLength).toBeDefined();
      expect(defaults.breakLength).toBeDefined();
      expect(defaults.maxStudyHoursPerDay).toBeDefined();
      expect(defaults.studyStartTime).toBeDefined();
      expect(defaults.studyEndTime).toBeDefined();
      expect(defaults.timezone).toBeDefined();
    });

    it('should have scientifically valid default values', () => {
      const defaults = getDefaultStudyPreferences();
      // Session length should be 25-90 minutes (Pomodoro and deep work research)
      expect(defaults.sessionLength).toBeGreaterThanOrEqual(25);
      expect(defaults.sessionLength).toBeLessThanOrEqual(90);
      
      // Break length should be 5-20 minutes
      expect(defaults.breakLength).toBeGreaterThanOrEqual(5);
      expect(defaults.breakLength).toBeLessThanOrEqual(20);
      
      // Max hours should be sustainable (4-8 hours)
      expect(defaults.maxStudyHoursPerDay).toBeGreaterThanOrEqual(4);
      expect(defaults.maxStudyHoursPerDay).toBeLessThanOrEqual(8);
    });

    it('should have valid time range for study hours', () => {
      const defaults = getDefaultStudyPreferences();
      expect(defaults.studyStartTime).toBeGreaterThanOrEqual(5);
      expect(defaults.studyStartTime).toBeLessThanOrEqual(12);
      expect(defaults.studyEndTime).toBeGreaterThanOrEqual(18);
      expect(defaults.studyEndTime).toBeLessThanOrEqual(24);
    });
  });

  describe('Preference validation', () => {
    const validatePreference = (key, value, defaults) => {
      const constraints = {
        sessionLength: { min: 15, max: 120 },
        breakLength: { min: 5, max: 30 },
        longBreakLength: { min: 15, max: 60 },
        maxStudyHoursPerDay: { min: 2, max: 10 },
        studyStartTime: { min: 5, max: 12 },
        studyEndTime: { min: 18, max: 24 },
        maxConcurrentSubjects: { min: 1, max: 6 },
        procrastinationBuffer: { min: 0, max: 0.5 }
      };

      if (constraints[key]) {
        const { min, max } = constraints[key];
        if (typeof value !== 'number' || isNaN(value)) {
          return defaults[key];
        }
        return Math.max(min, Math.min(max, value));
      }
      return value;
    };

    it('should constrain session length within bounds', () => {
      const defaults = getDefaultStudyPreferences();
      expect(validatePreference('sessionLength', 5, defaults)).toBe(15);
      expect(validatePreference('sessionLength', 200, defaults)).toBe(120);
      expect(validatePreference('sessionLength', 45, defaults)).toBe(45);
    });

    it('should constrain max study hours within bounds', () => {
      const defaults = getDefaultStudyPreferences();
      expect(validatePreference('maxStudyHoursPerDay', 1, defaults)).toBe(2);
      expect(validatePreference('maxStudyHoursPerDay', 15, defaults)).toBe(10);
      expect(validatePreference('maxStudyHoursPerDay', 6, defaults)).toBe(6);
    });

    it('should constrain study start time within bounds', () => {
      const defaults = getDefaultStudyPreferences();
      expect(validatePreference('studyStartTime', 3, defaults)).toBe(5);
      expect(validatePreference('studyStartTime', 15, defaults)).toBe(12);
      expect(validatePreference('studyStartTime', 8, defaults)).toBe(8);
    });

    it('should handle NaN values', () => {
      const defaults = getDefaultStudyPreferences();
      expect(validatePreference('sessionLength', NaN, defaults)).toBe(defaults.sessionLength);
    });

    it('should handle non-numeric values', () => {
      const defaults = getDefaultStudyPreferences();
      expect(validatePreference('sessionLength', 'invalid', defaults)).toBe(defaults.sessionLength);
    });
  });

  describe('Blackout dates structure', () => {
    const getDefaultBlackoutSchedule = () => ({
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    });

    it('should have all days of the week', () => {
      const schedule = getDefaultBlackoutSchedule();
      expect(Object.keys(schedule).length).toBe(7);
      expect(schedule.monday).toBeDefined();
      expect(schedule.tuesday).toBeDefined();
      expect(schedule.wednesday).toBeDefined();
      expect(schedule.thursday).toBeDefined();
      expect(schedule.friday).toBeDefined();
      expect(schedule.saturday).toBeDefined();
      expect(schedule.sunday).toBeDefined();
    });

    it('should have empty arrays for each day', () => {
      const schedule = getDefaultBlackoutSchedule();
      Object.values(schedule).forEach(daySchedule => {
        expect(Array.isArray(daySchedule)).toBe(true);
        expect(daySchedule.length).toBe(0);
      });
    });
  });

  describe('Blackout validation for saving', () => {
    const validateBlackoutDates = (blackoutDates) => {
      const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      const validated = {};
      
      DAYS.forEach(day => {
        validated[day] = [];
        if (blackoutDates && blackoutDates[day]) {
          validated[day] = blackoutDates[day].filter(item => {
            if (typeof item === 'string') {
              return item.includes('-') && item.split('-').length === 2;
            } else if (typeof item === 'object' && item.range) {
              return item.range.includes('-') && item.range.split('-').length === 2;
            }
            return false;
          });
        }
      });
      
      return validated;
    };

    it('should filter out invalid string entries', () => {
      const input = {
        monday: ["09:00-12:00", "invalid", "notarange"]
      };
      const result = validateBlackoutDates(input);
      expect(result.monday.length).toBe(1);
      expect(result.monday[0]).toBe("09:00-12:00");
    });

    it('should filter out invalid object entries', () => {
      const input = {
        monday: [
          { range: "09:00-12:00", name: "Valid" },
          { name: "Missing range" },
          { range: "invalid", name: "Bad range" }
        ]
      };
      const result = validateBlackoutDates(input);
      expect(result.monday.length).toBe(1);
    });

    it('should preserve valid entries', () => {
      const input = {
        monday: [
          { range: "08:00-12:00", name: "Morning" },
          { range: "14:00-17:00", name: "Afternoon" }
        ],
        tuesday: ["09:00-10:00"]
      };
      const result = validateBlackoutDates(input);
      expect(result.monday.length).toBe(2);
      expect(result.tuesday.length).toBe(1);
    });

    it('should handle null or undefined input', () => {
      expect(() => validateBlackoutDates(null)).not.toThrow();
      expect(() => validateBlackoutDates(undefined)).not.toThrow();
      const result = validateBlackoutDates(null);
      expect(Object.keys(result).length).toBe(7);
    });
  });
});
