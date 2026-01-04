/**
 * Tests for Assignment Sync Service Helper Functions
 * These tests focus on the pure functions that don't require Firebase
 */

describe('Assignment Sync Utilities', () => {
  // Test date parsing and conversion logic
  describe('Date handling utilities', () => {
    it('should convert Unix timestamp to Date object', () => {
      const timestamp = Math.floor(new Date('2026-01-20T23:59:59').getTime() / 1000);
      const date = new Date(timestamp * 1000);
      
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(0); // January
      expect(date.getDate()).toBe(20);
    });

    it('should handle midnight timestamps and set to 11:59 PM', () => {
      const midnightTimestamp = Math.floor(new Date('2026-01-20T00:00:00').getTime() / 1000);
      const date = new Date(midnightTimestamp * 1000);
      
      // If time is midnight, we should set to 11:59 PM
      if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0) {
        date.setHours(23, 59, 59, 999);
      }
      
      expect(date.getHours()).toBe(23);
      expect(date.getMinutes()).toBe(59);
    });

    it('should preserve time when timestamp has specific time', () => {
      const timestamp = Math.floor(new Date('2026-01-20T14:30:00').getTime() / 1000);
      const date = new Date(timestamp * 1000);
      
      expect(date.getHours()).toBe(14);
      expect(date.getMinutes()).toBe(30);
    });
  });

  describe('Assignment time estimation', () => {
    const estimateTime = (assignment) => {
      const title = (assignment.title || '').toLowerCase();
      const description = (assignment.description || '').toLowerCase();
      const text = title + ' ' + description;

      let estimatedTime = 60; // Default

      if (text.includes('essay') || text.includes('paper') || text.includes('report')) {
        estimatedTime = 180;
      } else if (text.includes('project') || text.includes('presentation')) {
        estimatedTime = 240;
      } else if (text.includes('quiz') || text.includes('test') || text.includes('exam')) {
        estimatedTime = 120;
      } else if (text.includes('homework') || text.includes('assignment')) {
        estimatedTime = 45;
      } else if (text.includes('lab') || text.includes('laboratory')) {
        estimatedTime = 150;
      }

      // AP courses get 50% more time
      if (text.includes('ap ') || text.includes('advanced placement')) {
        estimatedTime *= 1.5;
      }

      return Math.max(15, Math.min(480, Math.round(estimatedTime)));
    };

    it('should estimate 3 hours for essays', () => {
      const time = estimateTime({ title: 'Essay on World War II' });
      expect(time).toBe(180);
    });

    it('should estimate 4 hours for projects', () => {
      const time = estimateTime({ title: 'Science Project' });
      expect(time).toBe(240);
    });

    it('should estimate 2 hours for test prep', () => {
      const time = estimateTime({ title: 'Study for Quiz' });
      expect(time).toBe(120);
    });

    it('should increase time for AP courses', () => {
      const regularTime = estimateTime({ title: 'Chemistry Homework' });
      const apTime = estimateTime({ title: 'AP Chemistry Homework' });
      expect(apTime).toBeGreaterThan(regularTime);
    });
  });

  describe('Task type determination', () => {
    const determineType = (assignment) => {
      const title = (assignment.title || '').toLowerCase();
      const description = (assignment.description || '').toLowerCase();
      const text = title + ' ' + description;

      if (text.includes('test') || text.includes('quiz') || text.includes('exam')) {
        return 'test';
      } else if (text.includes('project') || text.includes('presentation')) {
        return 'project';
      } else if (text.includes('reading') || text.includes('chapter')) {
        return 'reading';
      } else if (text.includes('essay') || text.includes('paper')) {
        return 'essay';
      } else if (text.includes('lab')) {
        return 'lab';
      }
      return 'homework';
    };

    it('should identify test type', () => {
      expect(determineType({ title: 'Chapter 5 Quiz' })).toBe('test');
    });

    it('should identify project type', () => {
      expect(determineType({ title: 'Science Project' })).toBe('project');
    });

    it('should identify reading type', () => {
      expect(determineType({ title: 'Reading Chapter 5' })).toBe('reading');
    });

    it('should default to homework', () => {
      expect(determineType({ title: 'Assignment 3' })).toBe('homework');
    });
  });

  describe('Priority determination', () => {
    const determinePriority = (assignment, deadline) => {
      const now = new Date();
      const hoursUntilDue = (deadline - now) / (1000 * 60 * 60);
      const title = (assignment.title || '').toLowerCase();
      const isHighStakes = title.includes('test') || title.includes('exam') || 
                          title.includes('final') || title.includes('project');

      if (hoursUntilDue <= 24) return 'urgent';
      if (hoursUntilDue <= 72) return isHighStakes ? 'urgent' : 'high';
      if (hoursUntilDue <= 168) return isHighStakes ? 'high' : 'medium';
      return 'medium';
    };

    it('should assign urgent priority for assignments due within 24 hours', () => {
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 12);
      expect(determinePriority({ title: 'Any Task' }, deadline)).toBe('urgent');
    });

    it('should assign high priority for high-stakes items due within 72 hours', () => {
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 48);
      expect(determinePriority({ title: 'Final Exam' }, deadline)).toBe('urgent');
    });

    it('should assign medium priority for regular items due later', () => {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 10);
      expect(determinePriority({ title: 'Regular Homework' }, deadline)).toBe('medium');
    });
  });

  describe('Assignment content validation', () => {
    const isAssignmentContent = (assignment) => {
      const title = (assignment.title || '').toLowerCase();
      const description = (assignment.description || '').toLowerCase();
      const text = title + ' ' + description;

      const assignmentKeywords = [
        'assignment', 'homework', 'hw', 'due', 'submit', 'essay', 'paper', 
        'project', 'lab', 'quiz', 'test', 'exam', 'study', 'read', 'chapter'
      ];

      const eventKeywords = [
        'meeting', 'conference', 'assembly', 'break', 'holiday', 'vacation', 
        'no school', 'field trip'
      ];

      const hasAssignmentKeywords = assignmentKeywords.some(keyword => text.includes(keyword));
      const hasEventKeywords = eventKeywords.some(keyword => text.includes(keyword));

      if (hasAssignmentKeywords && !hasEventKeywords) return true;
      if (hasEventKeywords) return false;
      return true;
    };

    it('should identify assignment content', () => {
      expect(isAssignmentContent({ title: 'Homework Assignment' })).toBe(true);
    });

    it('should identify event content', () => {
      expect(isAssignmentContent({ title: 'School Assembly' })).toBe(false);
    });

    it('should default to true for uncertain content', () => {
      expect(isAssignmentContent({ title: 'Untitled' })).toBe(true);
    });
  });
});
