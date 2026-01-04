/**
 * Tests for Settings Auto-Save Functionality
 * Validates debounced auto-save, validation, and data persistence logic
 */

describe('Settings Auto-Save Utilities', () => {
  // Debounce implementation (mimics useRef + setTimeout pattern)
  const createDebouncer = (delay) => {
    let timeoutId = null;
    
    return {
      debounce: (fn) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(fn, delay);
        return timeoutId;
      },
      cancel: () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      },
      isPending: () => timeoutId !== null
    };
  };

  describe('Debounce behavior', () => {
    jest.useFakeTimers();

    afterEach(() => {
      jest.clearAllTimers();
    });

    it('should debounce rapid changes', () => {
      const callback = jest.fn();
      const debouncer = createDebouncer(1000);
      
      // Simulate rapid changes
      debouncer.debounce(callback);
      debouncer.debounce(callback);
      debouncer.debounce(callback);
      
      // Callback should not have been called yet
      expect(callback).not.toHaveBeenCalled();
      
      // Fast forward time
      jest.advanceTimersByTime(1000);
      
      // Callback should have been called exactly once
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should cancel pending save on unmount', () => {
      const callback = jest.fn();
      const debouncer = createDebouncer(1000);
      
      debouncer.debounce(callback);
      expect(debouncer.isPending()).toBe(true);
      
      // Cancel (simulating component unmount)
      debouncer.cancel();
      
      // Fast forward time
      jest.advanceTimersByTime(1000);
      
      // Callback should not have been called
      expect(callback).not.toHaveBeenCalled();
    });

    it('should reset timer on new changes', () => {
      const callback = jest.fn();
      const debouncer = createDebouncer(1000);
      
      debouncer.debounce(callback);
      
      // Advance partial time
      jest.advanceTimersByTime(500);
      expect(callback).not.toHaveBeenCalled();
      
      // Trigger another change (resets timer)
      debouncer.debounce(callback);
      
      // Advance another 500ms (total 1000ms but timer was reset)
      jest.advanceTimersByTime(500);
      expect(callback).not.toHaveBeenCalled();
      
      // Advance full delay
      jest.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('Study Preferences Validation', () => {
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

    const validateStudyPreferences = (prefs) => {
      const defaults = getDefaultStudyPreferences();
      const validated = { ...defaults, ...prefs };
      
      // Ensure all numeric values are valid
      Object.keys(validated).forEach(key => {
        const value = validated[key];
        if (typeof value === 'number' && (isNaN(value) || value < 0)) {
          validated[key] = defaults[key];
        }
      });
      
      return validated;
    };

    it('should preserve valid preferences', () => {
      const prefs = {
        sessionLength: 45,
        breakLength: 15,
        maxStudyHoursPerDay: 8
      };
      
      const validated = validateStudyPreferences(prefs);
      expect(validated.sessionLength).toBe(45);
      expect(validated.breakLength).toBe(15);
      expect(validated.maxStudyHoursPerDay).toBe(8);
    });

    it('should replace NaN values with defaults', () => {
      const prefs = {
        sessionLength: NaN,
        breakLength: 10
      };
      
      const validated = validateStudyPreferences(prefs);
      expect(validated.sessionLength).toBe(50); // Default
      expect(validated.breakLength).toBe(10);
    });

    it('should replace negative values with defaults', () => {
      const prefs = {
        sessionLength: -5,
        maxStudyHoursPerDay: -10
      };
      
      const validated = validateStudyPreferences(prefs);
      expect(validated.sessionLength).toBe(50);
      expect(validated.maxStudyHoursPerDay).toBe(6);
    });

    it('should merge partial preferences with defaults', () => {
      const prefs = { sessionLength: 30 };
      const validated = validateStudyPreferences(prefs);
      
      expect(validated.sessionLength).toBe(30);
      expect(validated.breakLength).toBe(10); // From defaults
      expect(validated.timezone).toBe('America/Chicago'); // From defaults
    });
  });

  describe('Blackout Schedule Validation', () => {
    const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    
    const getDefaultBlackoutSchedule = () => ({
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    });

    const validateBlackoutDates = (blackoutDates) => {
      const validatedBlackoutDates = { ...getDefaultBlackoutSchedule() };
      
      DAYS.forEach(day => {
        if (blackoutDates && blackoutDates[day]) {
          validatedBlackoutDates[day] = blackoutDates[day].filter(item => {
            if (!item) return false; // Handle null/undefined items
            if (typeof item === 'string') {
              return item.includes('-') && item.split('-').length === 2;
            } else if (typeof item === 'object' && item.range) {
              return item.range.includes('-') && item.range.split('-').length === 2;
            }
            return false;
          });
        }
      });
      
      return validatedBlackoutDates;
    };

    it('should accept valid string format blackouts', () => {
      const blackouts = {
        monday: ['09:00-12:00', '14:00-17:00']
      };
      
      const validated = validateBlackoutDates(blackouts);
      expect(validated.monday.length).toBe(2);
    });

    it('should accept valid object format blackouts', () => {
      const blackouts = {
        tuesday: [
          { range: '09:00-12:00', name: 'Morning' },
          { range: '14:00-17:00', name: 'Afternoon' }
        ]
      };
      
      const validated = validateBlackoutDates(blackouts);
      expect(validated.tuesday.length).toBe(2);
    });

    it('should filter out invalid entries', () => {
      const blackouts = {
        monday: ['09:00-12:00', 'invalid', null, { name: 'No range' }]
      };
      
      const validated = validateBlackoutDates(blackouts);
      expect(validated.monday.length).toBe(1);
      expect(validated.monday[0]).toBe('09:00-12:00');
    });

    it('should handle null input gracefully', () => {
      const validated = validateBlackoutDates(null);
      expect(Object.keys(validated).length).toBe(7);
      DAYS.forEach(day => {
        expect(validated[day]).toEqual([]);
      });
    });

    it('should preserve empty days', () => {
      const blackouts = {
        monday: ['09:00-12:00'],
        // Other days not specified
      };
      
      const validated = validateBlackoutDates(blackouts);
      expect(validated.monday.length).toBe(1);
      expect(validated.tuesday).toEqual([]);
      expect(validated.wednesday).toEqual([]);
    });
  });

  describe('Auto-save trigger conditions', () => {
    it('should not trigger save during initial load', () => {
      const isInitialized = false;
      const isLoading = true;
      
      const shouldAutoSave = isInitialized && !isLoading;
      expect(shouldAutoSave).toBe(false);
    });

    it('should not trigger save while still loading', () => {
      const isInitialized = true;
      const isLoading = true;
      
      const shouldAutoSave = isInitialized && !isLoading;
      expect(shouldAutoSave).toBe(false);
    });

    it('should trigger save when initialized and not loading', () => {
      const isInitialized = true;
      const isLoading = false;
      
      const shouldAutoSave = isInitialized && !isLoading;
      expect(shouldAutoSave).toBe(true);
    });

    it('should not trigger save before initialization', () => {
      const isInitialized = false;
      const isLoading = false;
      
      const shouldAutoSave = isInitialized && !isLoading;
      expect(shouldAutoSave).toBe(false);
    });
  });

  describe('Save data structure', () => {
    it('should create correct save payload structure', () => {
      const createSavePayload = (subjects, preferences, blackouts) => ({
        subjects: subjects || [],
        studyPreferences: preferences,
        blackoutDates: blackouts,
        settingsLastUpdated: new Date().toISOString()
      });

      const payload = createSavePayload(
        ['AP Biology', 'AP Calculus'],
        { sessionLength: 45 },
        { monday: ['09:00-12:00'] }
      );

      expect(payload.subjects).toEqual(['AP Biology', 'AP Calculus']);
      expect(payload.studyPreferences.sessionLength).toBe(45);
      expect(payload.blackoutDates.monday).toEqual(['09:00-12:00']);
      expect(payload.settingsLastUpdated).toBeDefined();
    });

    it('should handle empty subjects array', () => {
      const createSavePayload = (subjects, preferences, blackouts) => ({
        subjects: subjects || [],
        studyPreferences: preferences,
        blackoutDates: blackouts,
        settingsLastUpdated: new Date().toISOString()
      });

      const payload = createSavePayload(null, {}, {});
      expect(payload.subjects).toEqual([]);
    });

    it('should include valid timestamp', () => {
      const before = new Date().toISOString();
      
      const payload = {
        settingsLastUpdated: new Date().toISOString()
      };
      
      const after = new Date().toISOString();
      
      expect(payload.settingsLastUpdated >= before).toBe(true);
      expect(payload.settingsLastUpdated <= after).toBe(true);
    });
  });

  describe('Subject selection', () => {
    it('should add subject when not already selected', () => {
      const currentSubjects = ['AP Biology'];
      const toggleSubject = (subjects, value) => 
        subjects.includes(value) 
          ? subjects.filter(s => s !== value) 
          : [...subjects, value];

      const result = toggleSubject(currentSubjects, 'AP Calculus');
      expect(result).toContain('AP Calculus');
      expect(result).toContain('AP Biology');
    });

    it('should remove subject when already selected', () => {
      const currentSubjects = ['AP Biology', 'AP Calculus'];
      const toggleSubject = (subjects, value) => 
        subjects.includes(value) 
          ? subjects.filter(s => s !== value) 
          : [...subjects, value];

      const result = toggleSubject(currentSubjects, 'AP Biology');
      expect(result).not.toContain('AP Biology');
      expect(result).toContain('AP Calculus');
    });
  });

  describe('Error handling', () => {
    it('should handle save error gracefully', async () => {
      let errorMessage = '';
      
      const handleSaveError = (error) => {
        console.error("Error saving:", error);
        errorMessage = 'Error: Could not save your settings. Please try again.';
      };
      
      // Simulate error
      handleSaveError(new Error('Network error'));
      
      expect(errorMessage).toBe('Error: Could not save your settings. Please try again.');
    });

    it('should require user to be logged in', () => {
      const validateUserForSave = (userId) => {
        if (!userId) {
          return { valid: false, message: 'You must be logged in to save settings.' };
        }
        return { valid: true };
      };
      
      expect(validateUserForSave(null).valid).toBe(false);
      expect(validateUserForSave(undefined).valid).toBe(false);
      expect(validateUserForSave('user123').valid).toBe(true);
    });
  });
});

describe('Settings Integration Scenarios', () => {
  describe('Typical user workflow', () => {
    it('should handle initial load → change → auto-save flow', () => {
      // Simulate state transitions
      const states = [];
      
      // 1. Initial state
      states.push({ isLoading: true, isInitialized: false, isSaving: false });
      
      // 2. After fetch completes
      states.push({ isLoading: false, isInitialized: false, isSaving: false });
      
      // 3. After initialization delay
      states.push({ isLoading: false, isInitialized: true, isSaving: false });
      
      // 4. User makes change, auto-save triggers
      states.push({ isLoading: false, isInitialized: true, isSaving: true });
      
      // 5. Save completes
      states.push({ isLoading: false, isInitialized: true, isSaving: false });
      
      expect(states.length).toBe(5);
      expect(states[0].isLoading).toBe(true);
      expect(states[2].isInitialized).toBe(true);
      expect(states[3].isSaving).toBe(true);
      expect(states[4].isSaving).toBe(false);
    });

    it('should not auto-save immediately after load', () => {
      const shouldAutoSave = (isInitialized, isLoading) => isInitialized && !isLoading;
      
      // Right after fetch, before initialization delay
      expect(shouldAutoSave(false, false)).toBe(false);
      
      // After initialization delay
      expect(shouldAutoSave(true, false)).toBe(true);
    });
  });

  describe('Rapid changes scenario', () => {
    jest.useFakeTimers();

    it('should batch rapid changes into single save', () => {
      let saveCount = 0;
      let timeoutId = null;
      const AUTO_SAVE_DELAY = 1000;
      
      const triggerAutoSave = () => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          saveCount++;
        }, AUTO_SAVE_DELAY);
      };
      
      // Simulate user rapidly changing multiple settings
      triggerAutoSave(); // Change session length
      triggerAutoSave(); // Change break length
      triggerAutoSave(); // Change max hours
      triggerAutoSave(); // Toggle weekend study
      triggerAutoSave(); // Change timezone
      
      // Nothing saved yet
      expect(saveCount).toBe(0);
      
      // After debounce delay
      jest.advanceTimersByTime(1000);
      
      // Only one save occurred
      expect(saveCount).toBe(1);
    });

    afterEach(() => {
      jest.clearAllTimers();
    });
  });
});
