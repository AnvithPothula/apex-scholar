/**
 * Tests for Schoology Calendar Service
 * Validates date/time parsing, timezone handling, and assignment conversion
 */

import { schoologyCalendar } from './schoologyCalendar';

describe('SchoologyCalendarService', () => {
  describe('parseICalDate', () => {
    it('should parse UTC datetime format (20250825T140000Z)', () => {
      const result = schoologyCalendar.parseICalDate('20250825T140000Z');
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe('2025-08-25T14:00:00.000Z');
    });

    it('should parse local datetime format (20250825T140000)', () => {
      const result = schoologyCalendar.parseICalDate('20250825T140000');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(7); // August (0-indexed)
      expect(result.getDate()).toBe(25);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(0);
    });

    it('should parse date-only format (20250825)', () => {
      const result = schoologyCalendar.parseICalDate('20250825');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(7); // August (0-indexed)
      expect(result.getDate()).toBe(25);
    });

    it('should parse end of day datetime (20250930T235959)', () => {
      const result = schoologyCalendar.parseICalDate('20250930T235959');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(8); // September (0-indexed)
      expect(result.getDate()).toBe(30);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
    });

    it('should handle start of day datetime (20250101T000000)', () => {
      const result = schoologyCalendar.parseICalDate('20250101T000000');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January (0-indexed)
      expect(result.getDate()).toBe(1);
      expect(result.getHours()).toBe(0);
    });

    it('should return null for empty string', () => {
      const result = schoologyCalendar.parseICalDate('');
      expect(result).toBeNull();
    });

    it('should return null for invalid date string', () => {
      const result = schoologyCalendar.parseICalDate('invalid-date');
      expect(result).toBeNull();
    });

    it('should handle whitespace in date string', () => {
      const result = schoologyCalendar.parseICalDate('  20250825T140000Z  ');
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe('2025-08-25T14:00:00.000Z');
    });
  });

  describe('calculateDueDate', () => {
    it('should preserve time when raw date string includes T', () => {
      const parsedDate = new Date('2025-08-25T14:00:00');
      const result = schoologyCalendar.calculateDueDate(parsedDate, '20250825T140000');
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(0);
    });

    it('should set time to 11:59 PM when raw date string has no time', () => {
      const parsedDate = new Date('2025-08-25T00:00:00');
      const result = schoologyCalendar.calculateDueDate(parsedDate, '20250825');
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
    });
  });

  describe('isAssignmentUrl', () => {
    it('should return true for assignment URLs', () => {
      const result = schoologyCalendar.isAssignmentUrl('http://school.district196.org/assignment/7863396025');
      expect(result).toBe(true);
    });

    it('should return false for event URLs', () => {
      const result = schoologyCalendar.isAssignmentUrl('http://school.district196.org/event/7863601655/profile');
      expect(result).toBe(false);
    });

    it('should return null for unknown URL patterns', () => {
      const result = schoologyCalendar.isAssignmentUrl('http://school.district196.org/course/123');
      expect(result).toBeNull();
    });

    it('should return null for empty or undefined URL', () => {
      expect(schoologyCalendar.isAssignmentUrl('')).toBeNull();
      expect(schoologyCalendar.isAssignmentUrl(null)).toBeNull();
      expect(schoologyCalendar.isAssignmentUrl(undefined)).toBeNull();
    });
  });

  describe('decodeICalValue', () => {
    it('should decode escaped newlines', () => {
      const result = schoologyCalendar.decodeICalValue('Line 1\\nLine 2');
      expect(result).toBe('Line 1\nLine 2');
    });

    it('should decode escaped commas', () => {
      const result = schoologyCalendar.decodeICalValue('Item 1\\, Item 2');
      expect(result).toBe('Item 1, Item 2');
    });

    it('should decode escaped semicolons', () => {
      const result = schoologyCalendar.decodeICalValue('Part 1\\; Part 2');
      expect(result).toBe('Part 1; Part 2');
    });

    it('should decode escaped backslashes', () => {
      const result = schoologyCalendar.decodeICalValue('Path\\\\File');
      expect(result).toBe('Path\\File');
    });
  });

  describe('normalizeCalendarUrl', () => {
    it('should convert webcal:// to https://', () => {
      const result = schoologyCalendar.normalizeCalendarUrl('webcal://app.schoology.com/calendar/ical');
      expect(result).toBe('https://app.schoology.com/calendar/ical');
    });

    it('should leave https:// URLs unchanged', () => {
      const url = 'https://app.schoology.com/calendar/ical';
      const result = schoologyCalendar.normalizeCalendarUrl(url);
      expect(result).toBe(url);
    });
  });

  describe('isValidCalendarUrl', () => {
    it('should validate webcal:// URLs with ical and schoology', () => {
      const result = schoologyCalendar.isValidCalendarUrl('webcal://app.schoology.com/calendar/ical/123');
      expect(result).toBe(true);
    });

    it('should validate https:// URLs with ical and schoology', () => {
      const result = schoologyCalendar.isValidCalendarUrl('https://app.schoology.com/calendar/ical/123');
      expect(result).toBe(true);
    });

    it('should reject URLs without ical', () => {
      const result = schoologyCalendar.isValidCalendarUrl('https://app.schoology.com/calendar/123');
      expect(result).toBe(false);
    });

    it('should reject invalid URLs', () => {
      const result = schoologyCalendar.isValidCalendarUrl('not-a-url');
      expect(result).toBe(false);
    });
  });

  describe('parseICalData', () => {
    const sampleICalData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Schoology//NONSGML Calendar Feed//EN
BEGIN:VEVENT
UID:assignment_123
SUMMARY:Math Homework Ch 5
DESCRIPTION:Complete problems 1-20\\n- Link: http://school.district196.org/assignment/7863396025
DTSTART:20260115
DTEND:20260116
LOCATION:Math Class
END:VEVENT
BEGIN:VEVENT
UID:event_456
SUMMARY:School Assembly
DESCRIPTION:All students attend\\n- Link: http://school.district196.org/event/7863601655/profile
DTSTART:20260120T130000
DTEND:20260120T140000
END:VEVENT
END:VCALENDAR`;

    it('should parse valid iCal data and extract assignments', () => {
      const assignments = schoologyCalendar.parseICalData(sampleICalData);
      // Should only include the assignment (not the event)
      expect(assignments.length).toBe(1);
      expect(assignments[0].title).toBe('Math Homework Ch 5');
    });

    it('should extract the correct due date with exclusive DTEND', () => {
      const assignments = schoologyCalendar.parseICalData(sampleICalData);
      expect(assignments[0].dueDate).toBeInstanceOf(Date);
      // DTEND is 20260116 (date-only, exclusive per RFC 5545)
      // Exclusive DTEND means the event goes up to but NOT including Jan 16
      // So the actual due date is Jan 15, 2026 at 11:59 PM
      expect(assignments[0].dueDate.getFullYear()).toBe(2026);
      expect(assignments[0].dueDate.getMonth()).toBe(0); // January
      expect(assignments[0].dueDate.getDate()).toBe(15); // NOT 16 — exclusive DTEND
      expect(assignments[0].dueDate.getHours()).toBe(23);
      expect(assignments[0].dueDate.getMinutes()).toBe(59);
    });

    it('should not include events (only assignments)', () => {
      const assignments = schoologyCalendar.parseICalData(sampleICalData);
      const eventTitles = assignments.map(a => a.title);
      expect(eventTitles).not.toContain('School Assembly');
    });

    it('should include the assignment URL', () => {
      const assignments = schoologyCalendar.parseICalData(sampleICalData);
      expect(assignments[0].url).toBe('http://school.district196.org/assignment/7863396025');
    });
  });

  describe('processAssignmentEvent', () => {
    it('should create valid assignment from event data', () => {
      const event = {
        id: 'test_123',
        title: 'Test Assignment',
        description: 'Do the work',
        endDate: new Date('2026-01-15T00:00:00'),
        url: 'http://school.district196.org/assignment/123'
      };

      const result = schoologyCalendar.processAssignmentEvent(event);
      
      expect(result.title).toBe('Test Assignment');
      expect(result.description).toContain('Do the work');
      expect(result.type).toBe('assignment');
      expect(result.source).toBe('calendar');
    });

    it('should set default title for events with empty title', () => {
      const event = {
        id: 'test_456',
        title: '',
        endDate: new Date('2026-01-15')
      };

      const result = schoologyCalendar.processAssignmentEvent(event);
      expect(result.title).toContain('Schoology Assignment');
    });

    it('should handle undefined title gracefully', () => {
      const event = {
        id: 'test_789',
        title: undefined,
        endDate: new Date('2026-01-15')
      };

      const result = schoologyCalendar.processAssignmentEvent(event);
      expect(result.title).toBeTruthy();
      expect(result.title.length).toBeGreaterThan(0);
    });

    it('should handle midnight datetime DTEND by subtracting a day', () => {
      // DTEND:20260305T000000 means midnight March 5 = end of March 4
      const event = {
        id: 'midnight_test',
        title: 'Midnight DTEND Test',
        endDate: new Date('2026-03-05T00:00:00'),
        rawEndDate: '20260305T000000',
        url: 'http://school.district196.org/assignment/999'
      };

      const result = schoologyCalendar.processAssignmentEvent(event);
      expect(result.dueDate.getFullYear()).toBe(2026);
      expect(result.dueDate.getMonth()).toBe(2); // March
      expect(result.dueDate.getDate()).toBe(4); // March 4 (not March 5)
      expect(result.dueDate.getHours()).toBe(23);
      expect(result.dueDate.getMinutes()).toBe(59);
    });

    it('should use DTSTART when DTEND is early morning and DTSTART is late evening', () => {
      // DTSTART: March 4 at 11:59 PM, DTEND: March 5 at 12:59 AM
      // Should use DTSTART's time (11:59 PM March 4) since DTEND is likely a timezone artifact
      const event = {
        id: 'early_am_test',
        title: 'Early AM DTEND Test',
        startDate: new Date('2026-03-04T23:59:00'),
        endDate: new Date('2026-03-05T00:59:00'),
        rawStartDate: '20260304T235900',
        rawEndDate: '20260305T005900',
        url: 'http://school.district196.org/assignment/888'
      };

      const result = schoologyCalendar.processAssignmentEvent(event);
      expect(result.dueDate.getMonth()).toBe(2); // March
      expect(result.dueDate.getDate()).toBe(4); // March 4
      expect(result.dueDate.getHours()).toBe(23); // 11 PM
      expect(result.dueDate.getMinutes()).toBe(59);
    });

    it('should preserve normal datetime DTEND as-is', () => {
      // DTEND at 3:00 PM should be kept unchanged
      const event = {
        id: 'normal_test',
        title: 'Normal DTEND Test',
        endDate: new Date('2026-03-04T15:00:00'),
        rawEndDate: '20260304T150000',
        url: 'http://school.district196.org/assignment/777'
      };

      const result = schoologyCalendar.processAssignmentEvent(event);
      expect(result.dueDate.getDate()).toBe(4);
      expect(result.dueDate.getHours()).toBe(15);
      expect(result.dueDate.getMinutes()).toBe(0);
    });

    it('should handle date-only DTEND with exclusive subtraction', () => {
      // DTEND date-only 20260305 → March 4 at 11:59 PM
      const event = {
        id: 'dateonly_test',
        title: 'Date Only DTEND Test',
        endDate: new Date(2026, 2, 5), // March 5, midnight local
        rawEndDate: '20260305',
        url: 'http://school.district196.org/assignment/666'
      };

      const result = schoologyCalendar.processAssignmentEvent(event);
      expect(result.dueDate.getMonth()).toBe(2); // March
      expect(result.dueDate.getDate()).toBe(4); // March 4 (exclusive)
      expect(result.dueDate.getHours()).toBe(23);
      expect(result.dueDate.getMinutes()).toBe(59);
    });
  });
});
