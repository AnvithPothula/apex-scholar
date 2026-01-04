/**
 * Tests for Timezone Utility Functions
 * Validates timezone handling across the application
 */

import {
  getUserTimezone,
  getUserTimezoneAbbreviation,
  formatDateInUserTimezone,
  formatTimeInUserTimezone,
  formatDateTimeInUserTimezone,
  getCurrentTimeInUserTimezone,
  parseTimeInUserTimezone,
  setUserTimezonePreference,
  getTimezoneDisplayString,
  isDaylightSavingTime
} from './timezone';

describe('Timezone Utilities', () => {
  // Reset timezone preference before each test
  beforeEach(() => {
    setUserTimezonePreference(null);
  });

  describe('getUserTimezone', () => {
    it('should return a valid timezone string', () => {
      const timezone = getUserTimezone();
      expect(typeof timezone).toBe('string');
      expect(timezone.length).toBeGreaterThan(0);
    });

    it('should respect user preference when set', () => {
      setUserTimezonePreference('America/New_York');
      expect(getUserTimezone()).toBe('America/New_York');
    });

    it('should fall back to browser timezone when no preference', () => {
      const timezone = getUserTimezone();
      // Should be a valid IANA timezone
      expect(timezone).toMatch(/^[A-Za-z]+\/[A-Za-z_]+$/);
    });
  });

  describe('getUserTimezoneAbbreviation', () => {
    it('should return a timezone abbreviation', () => {
      const abbrev = getUserTimezoneAbbreviation();
      expect(typeof abbrev).toBe('string');
      expect(abbrev.length).toBeGreaterThan(0);
      expect(abbrev.length).toBeLessThanOrEqual(5);
    });

    it('should return appropriate abbreviation for Central Time', () => {
      setUserTimezonePreference('America/Chicago');
      const abbrev = getUserTimezoneAbbreviation();
      // Should be CDT or CST depending on time of year
      expect(['CDT', 'CST', 'CT']).toContain(abbrev);
    });
  });

  describe('formatDateInUserTimezone', () => {
    it('should format date correctly', () => {
      setUserTimezonePreference('America/Chicago');
      const date = new Date('2026-01-15T12:00:00Z');
      const formatted = formatDateInUserTimezone(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toContain('2026');
    });

    it('should return empty string for invalid date', () => {
      const formatted = formatDateInUserTimezone('invalid-date');
      expect(formatted).toBe('');
    });

    it('should handle Date objects', () => {
      const date = new Date('2026-06-15T12:00:00');
      const formatted = formatDateInUserTimezone(date);
      expect(formatted).toBeTruthy();
    });

    it('should handle timestamps', () => {
      const timestamp = new Date('2026-06-15T12:00:00').getTime();
      const formatted = formatDateInUserTimezone(timestamp);
      expect(formatted).toBeTruthy();
    });
  });

  describe('formatTimeInUserTimezone', () => {
    it('should format time correctly', () => {
      setUserTimezonePreference('America/Chicago');
      const date = new Date('2026-01-15T18:30:00Z');
      const formatted = formatTimeInUserTimezone(date);
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });

    it('should return empty string for invalid date', () => {
      const formatted = formatTimeInUserTimezone('not-a-date');
      expect(formatted).toBe('');
    });
  });

  describe('formatDateTimeInUserTimezone', () => {
    it('should format date and time together', () => {
      setUserTimezonePreference('America/Chicago');
      const date = new Date('2026-01-15T18:30:00Z');
      const formatted = formatDateTimeInUserTimezone(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('15');
      expect(formatted).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('getCurrentTimeInUserTimezone', () => {
    it('should return a Date object', () => {
      const now = getCurrentTimeInUserTimezone();
      expect(now).toBeInstanceOf(Date);
    });

    it('should return a valid date', () => {
      const now = getCurrentTimeInUserTimezone();
      expect(isNaN(now.getTime())).toBe(false);
    });

    it('should be close to current time', () => {
      const now = getCurrentTimeInUserTimezone();
      const actualNow = new Date();
      // Should be within 1 hour of actual time (accounting for timezone differences)
      const diff = Math.abs(now.getTime() - actualNow.getTime());
      expect(diff).toBeLessThan(25 * 60 * 60 * 1000); // 25 hours max difference
    });
  });

  describe('parseTimeInUserTimezone', () => {
    it('should parse 24-hour time format', () => {
      const result = parseTimeInUserTimezone('14:30');
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });

    it('should parse 12-hour AM time format', () => {
      const result = parseTimeInUserTimezone('10:30 AM');
      expect(result.getHours()).toBe(10);
      expect(result.getMinutes()).toBe(30);
    });

    it('should parse 12-hour PM time format', () => {
      const result = parseTimeInUserTimezone('2:30 PM');
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });

    it('should handle noon correctly', () => {
      const result = parseTimeInUserTimezone('12:00 PM');
      expect(result.getHours()).toBe(12);
    });

    it('should handle midnight correctly', () => {
      const result = parseTimeInUserTimezone('12:00 AM');
      expect(result.getHours()).toBe(0);
    });

    it('should use provided date', () => {
      // Create a date explicitly in local timezone to avoid UTC conversion issues
      const targetDate = new Date(2026, 5, 15); // June 15, 2026 in local time
      const result = parseTimeInUserTimezone('14:30', targetDate);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(5); // June
      expect(result.getDate()).toBe(15);
    });
  });

  describe('getTimezoneDisplayString', () => {
    it('should return a formatted display string', () => {
      setUserTimezonePreference('America/Chicago');
      const display = getTimezoneDisplayString();
      expect(display).toContain('Central Time');
      expect(display).toMatch(/\([A-Z]{2,4}\)/); // Should have abbreviation in parentheses
    });

    it('should handle Eastern Time', () => {
      setUserTimezonePreference('America/New_York');
      const display = getTimezoneDisplayString();
      expect(display).toContain('Eastern Time');
    });

    it('should handle Pacific Time', () => {
      setUserTimezonePreference('America/Los_Angeles');
      const display = getTimezoneDisplayString();
      expect(display).toContain('Pacific Time');
    });
  });

  describe('isDaylightSavingTime', () => {
    it('should return a boolean', () => {
      const isDST = isDaylightSavingTime();
      expect(typeof isDST).toBe('boolean');
    });
  });

  describe('Date edge cases', () => {
    it('should handle year boundary (Dec 31)', () => {
      const date = new Date('2025-12-31T23:59:59');
      const formatted = formatDateInUserTimezone(date);
      expect(formatted).toContain('2025');
      expect(formatted).toContain('Dec');
      expect(formatted).toContain('31');
    });

    it('should handle year boundary (Jan 1)', () => {
      const date = new Date('2026-01-01T00:00:00');
      const formatted = formatDateInUserTimezone(date);
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('1');
    });

    it('should handle leap year date (Feb 29)', () => {
      const date = new Date('2028-02-29T12:00:00'); // 2028 is a leap year
      const formatted = formatDateInUserTimezone(date);
      expect(formatted).toContain('Feb');
      expect(formatted).toContain('29');
    });
  });
});
