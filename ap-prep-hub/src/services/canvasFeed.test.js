// Canvas calendar feeds, in the exact shape canvas-lms writes them
// (app/models/calendar_event.rb IcalEvent#to_ics): UID event-assignment-<id>,
// SUMMARY "Title [COURSE_CODE]", DTSTART/DTEND = due time with TZID=UTC, URL to
// the Canvas calendar tagged #assignment_<id> (lines folded at 75 octets).
import { schoologyCalendar, FEED_PATHS } from './schoologyCalendar';

const { FEED_PATHS: SERVER_PATHS, feedKind, isPrivateAddress, resolvesPublic } = require('../../netlify/lib/feedUrl');

const fold = (line) => line.match(/.{1,74}/g).join('\r\n ');
const FEED = [
  'BEGIN:VCALENDAR', 'VERSION:2.0', 'METHOD:PUBLISH',
  'BEGIN:VEVENT', 'CLASS:PUBLIC',
  'DTSTART;TZID=UTC:20261021T035900', 'DTEND;TZID=UTC:20261021T035900',
  'SUMMARY:Unit 3 FRQ practice [AP Biology]',
  fold('URL;VALUE=URI:https://district.instructure.com/calendar?include_contexts=course_812&month=10&year=2026#assignment_44021'),
  'UID:event-assignment-44021', 'SEQUENCE:0', 'END:VEVENT',
  'BEGIN:VEVENT',
  'DTSTART;VALUE=DATE:20261023',
  'SUMMARY:Read chapter 9 [ENG-11]',
  fold('URL;VALUE=URI:https://district.instructure.com/calendar?include_contexts=course_9&month=10&year=2026#assignment_44100'),
  'UID:event-assignment-44100', 'END:VEVENT',
  'BEGIN:VEVENT',
  'DTSTART;TZID=UTC:20261022T230000', 'DTEND;TZID=UTC:20261023T000000',
  'SUMMARY:Football game [AP Bio]',
  fold('URL;VALUE=URI:https://district.instructure.com/calendar?include_contexts=course_812&month=10&year=2026#calendar_event_7'),
  'UID:event-calendar-event-7', 'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

describe('Canvas calendar feed', () => {
  test('assignments become tasks with title, course and due time; events are skipped', () => {
    const items = schoologyCalendar.parseICalData(FEED);
    expect(items.map((a) => a.title)).toEqual(['Unit 3 FRQ practice', 'Read chapter 9']);
    const [frq, reading] = items;
    expect(frq).toMatchObject({ provider: 'canvas', courseCode: 'AP Biology', courseName: 'AP Biology', id: 'ical_event-assignment-44021' });
    expect(frq.dueDate.toISOString()).toBe('2026-10-21T03:59:00.000Z');
    // Unknown codes stay as written; all-day work is due at the end of that day.
    expect(reading.courseName).toBe('ENG-11');
    expect([reading.dueDate.getDate(), reading.dueDate.getHours(), reading.dueDate.getMinutes()]).toEqual([23, 23, 59]);
  });

  test('feed links are accepted, including Canvas ones without "ical"', () => {
    expect(schoologyCalendar.isValidCalendarUrl('https://district.instructure.com/feeds/calendars/user_AbC123xyz.ics')).toBe(true);
    expect(schoologyCalendar.isValidCalendarUrl('webcal://canvas.district.org/feeds/calendars/user_AbC123.ics')).toBe(true);
    expect(schoologyCalendar.isValidCalendarUrl('https://district.instructure.com/courses/1')).toBe(false);
  });
});

describe('cors-proxy feed URL rules', () => {
  test('client and server agree on the feed paths', () => {
    expect(Object.fromEntries(Object.entries(FEED_PATHS).map(([k, v]) => [k, v.source])))
      .toEqual(Object.fromEntries(Object.entries(SERVER_PATHS).map(([k, v]) => [k, v.source])));
  });

  test('only https feed paths on named hosts', () => {
    expect(feedKind('https://canvas.district.org/feeds/calendars/user_AbC123.ics')).toBe('canvas');
    expect(feedKind('https://school.district196.org/calendar/feed/ical/123/abcdef/ical.ics')).toBe('schoology');
    for (const bad of [
      'http://canvas.district.org/feeds/calendars/user_A.ics',
      'https://10.0.0.5/feeds/calendars/user_A.ics',
      'https://[::1]/feeds/calendars/user_A.ics',
      'https://localhost/feeds/calendars/user_A.ics',
      'https://canvas.district.org:8443/feeds/calendars/user_A.ics',
      'https://canvas.district.org/admin/feeds/calendars/user_A.ics',
      'https://canvas.district.org/feeds/calendars/user_A.ics/../../secret',
    ]) expect(feedKind(bad)).toBeNull();
  });

  test('hosts resolving anywhere private are refused', async () => {
    expect(['127.0.0.1', '10.1.2.3', '172.20.0.1', '192.168.1.1', '169.254.169.254', '100.64.0.1', '::1', 'fd00::1', '::ffff:10.0.0.1'].every(isPrivateAddress)).toBe(true);
    expect(['8.8.8.8', '151.101.1.1', '2606:4700::1111'].some(isPrivateAddress)).toBe(false);
    const lookup = (map) => async (h) => map[h];
    expect(await resolvesPublic('ok.example', lookup({ 'ok.example': [{ address: '93.184.216.34' }] }))).toBe(true);
    expect(await resolvesPublic('sneaky.example', lookup({ 'sneaky.example': [{ address: '93.184.216.34' }, { address: '10.0.0.1' }] }))).toBe(false);
  });
});
