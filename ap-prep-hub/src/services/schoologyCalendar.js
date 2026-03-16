/**
 * Schoology Calendar Feed Service
 * Handles parsing and processing of Schoology iCal calendar feeds
 */

import { 
  getUserTimezone
} from '../utils/timezone';

// Console output intentionally minimized; rely on assignmentSync summary only.

class SchoologyCalendarService {
  constructor() {
    // Primary: our own Netlify serverless function (first-party, no CORS issues)
    // Fallback: public proxy in case the function is unavailable
    this.corsProxies = [
      '/.netlify/functions/cors-proxy?url=',
      'https://corsproxy.io/?',
    ];
    this.currentProxyIndex = 0;

    // In-memory cache to avoid redundant Netlify requests
    // { url: string, data: string, fetchedAt: number }
    this._cache = null;
    this._cacheTTL = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Parse iCal data to extract assignments
   */
  parseICalData(icalData) {
  const assignments = [];
  // RFC 5545: Unfold long lines (continuation lines start with space/tab)
  const unfoldedData = icalData.replace(/\r?\n[ \t]/g, '');
  const lines = unfoldedData.split('\n').map(line => line.trim());
    
    
    
    let currentEvent = null;
    let inEvent = false;
    let eventCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line === 'BEGIN:VEVENT') {
        inEvent = true;
        eventCount++;
        currentEvent = {
          id: `event_${eventCount}`,
          title: '',
          description: '',
          due: null,
          created: null,
          location: '',
          type: 'assignment',
          url: '',
          isAssignmentByUrl: null,
          startDate: null,
          endDate: null,
          rawStartDate: '',
          rawEndDate: ''
        };
        
      } else if (line === 'END:VEVENT' && inEvent) {
        if (currentEvent) {
          // Validate and clean up the event before processing
          if (!currentEvent.title || currentEvent.title.trim() === '' || currentEvent.title === 'undefined') {
            
            currentEvent.title = `Calendar Event ${eventCount} (${new Date().toISOString().split('T')[0]})`;
          }
          
          // Additional validation for undefined fields
          if (currentEvent.title === 'undefined' || currentEvent.title === null) {
            currentEvent.title = `Schoology Calendar Item ${eventCount}`;
          }
          
          
          
          // Only include events that are confirmed as assignments by URL pattern
          if (this.isAssignmentEvent(currentEvent)) {
            const processedAssignment = this.processAssignmentEvent(currentEvent);
            // Final validation of processed assignment
            if (processedAssignment && processedAssignment.title && processedAssignment.title.trim() !== '') {
              assignments.push(processedAssignment);
              
            } else {
              
            }
          } else {
            
          }
        }
        inEvent = false;
        currentEvent = null;
      } else if (inEvent && currentEvent) {
        // Debug: log each line being processed for events
        if (line.startsWith('DTSTART') || line.startsWith('DTEND') || line.startsWith('SUMMARY')) {
          // intentionally no per-line logging
        }
        this.parseEventProperty(line, currentEvent);
      }
    }

    
    return assignments;
  }

  /**
   * Parse individual event properties from iCal format
   */
  parseEventProperty(line, event) {
    if (line.startsWith('UID:')) {
      event.id = line.substring(4);
    } else if (line.startsWith('SUMMARY:')) {
      event.title = this.decodeICalValue(line.substring(8));
    } else if (line.startsWith('DESCRIPTION:')) {
      const description = this.decodeICalValue(line.substring(12));
      event.description = description;
      
      // Extract URL from description text (e.g., "- Link: http://school.district196.org/assignment/7863396025")
      const urlMatch = description.match(/Link:\s*(https?:\/\/[^\s]+)/i);
      if (urlMatch) {
        event.url = urlMatch[1];
        event.isAssignmentByUrl = this.isAssignmentUrl(event.url);
        
      }
    } else if (line.startsWith('URL:')) {
      // Also check the URL field directly (fallback)
      event.url = line.substring(4);
      event.isAssignmentByUrl = this.isAssignmentUrl(event.url);
      
    } else if (line.startsWith('DTSTART')) {
      // Handle DTSTART:, DTSTART;VALUE=DATE:, and DTSTART;TZID=...: formats
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const dateStr = line.substring(colonIndex + 1);
        event.rawStartDate = dateStr;

        // Extract TZID if present (e.g., DTSTART;TZID=America/Chicago:20260304T235900)
        const params = line.substring(0, colonIndex);
        const tzidMatch = params.match(/TZID=([^;:]+)/i);
        if (tzidMatch) {
          event.startTzid = tzidMatch[1];
        }

        const parsedDate = this.parseICalDate(dateStr, event.startTzid);

        if (parsedDate) {
          event.startDate = parsedDate;
          // Set initial due date to start date (will be overridden by end date if available)
          event.due = parsedDate;
        }
      }
    } else if (line.startsWith('DTEND')) {
      // Handle DTEND:, DTEND;VALUE=DATE:, and DTEND;TZID=...: formats
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const dateStr = line.substring(colonIndex + 1);
        event.rawEndDate = dateStr;

        // Extract TZID if present
        const params = line.substring(0, colonIndex);
        const tzidMatch = params.match(/TZID=([^;:]+)/i);
        if (tzidMatch) {
          event.endTzid = tzidMatch[1];
        }

        const parsedDate = this.parseICalDate(dateStr, event.endTzid);

        if (parsedDate) {
          event.endDate = parsedDate;
          // Use end date as the due date (this is typically when assignment is due)
          event.due = parsedDate;
        }
      }
    } else if (line.startsWith('DTSTAMP:')) {
      const dateStr = line.substring(8);
      event.created = this.parseICalDate(dateStr);
    } else if (line.startsWith('LOCATION:')) {
      event.location = this.decodeICalValue(line.substring(9));
      // Note: Not extracting course name since it's not available in Schoology calendar
    }
  }

  /**
   * Parse iCal date format to JavaScript Date
   * @param {string} dateStr - iCal date string (e.g., 20250825T140000Z, 20250825T140000, 20250825)
   * @param {string} [tzid] - Optional IANA timezone name (e.g., "America/Chicago")
   */
  parseICalDate(dateStr, tzid) {
    try {
      
      
      // Clean up the date string
      const cleanDateStr = dateStr.trim();
      
      if (!cleanDateStr) {
        console.warn('Empty date string provided');
        return null;
      }
      
      // Handle different iCal date formats with timezone awareness
      if (cleanDateStr.includes('T')) {
        // DateTime format: 20250825T140000Z or 20250825T140000
        if (cleanDateStr.endsWith('Z')) {
          // UTC time: 20250825T140000Z — TZID is irrelevant
          const isoStr = cleanDateStr.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z');
          const date = new Date(isoStr);
          if (!isNaN(date.getTime())) {
            return date;
          }
        } else {
          // Local/wall-clock time: 20250825T140000
          const match = cleanDateStr.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
          if (match) {
            const [, y, mo, d, h, mi, s] = match.map(Number);

            // If TZID is provided, interpret the wall-clock time in that timezone
            if (tzid) {
              try {
                const date = this._dateInTimezone(y, mo, d, h, mi, s, tzid);
                if (date && !isNaN(date.getTime())) {
                  return date;
                }
              } catch (tzError) {
                console.warn('TZID conversion failed, falling back to local time:', tzError);
              }
            }
            // No TZID or TZID conversion failed — interpret in browser's local timezone
            const isoStr = `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}T${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
            const date = new Date(isoStr);
            if (!isNaN(date.getTime())) {
              return date;
            }
          }
        }
      } else if (cleanDateStr.length === 8 && /^\d{8}$/.test(cleanDateStr)) {
        // Date only format: 20250825 - create in user's timezone
        const year = cleanDateStr.substring(0, 4);
        const month = cleanDateStr.substring(4, 6);
        const day = cleanDateStr.substring(6, 8);
        
        // Create date at start of day in local timezone
        try {
          // Create date properly without double timezone conversion
          // Use the Date constructor that takes year, month, day directly
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          
          if (!isNaN(date.getTime())) {
            
            return date;
          }
        } catch (timezoneError) {
          console.warn('Date parsing failed, using fallback:', timezoneError);
          // Fallback to ISO string parsing
          const date = new Date(`${year}-${month}-${day}T00:00:00`);
          if (!isNaN(date.getTime())) {
            
            return date;
          }
        }
      }
      
      // Try parsing as a regular date string as fallback
      const fallbackDate = new Date(cleanDateStr);
      if (!isNaN(fallbackDate.getTime())) {
  
        return fallbackDate;
      }
      
      console.warn('❌ Unable to parse date format:', cleanDateStr);
      return null;
    } catch (error) {
      console.warn('❌ Failed to parse iCal date:', dateStr, error);
      return null;
    }
  }

  /**
   * Convert wall-clock components in a specific IANA timezone to a JS Date (UTC).
   * Example: _dateInTimezone(2026, 3, 4, 23, 59, 0, 'America/Chicago')
   * → Date representing 2026-03-05T05:59:00Z (CST is UTC-6)
   */
  _dateInTimezone(year, month, day, hour, minute, second, timezone) {
    // Step 1: Create a UTC date with the target wall-clock components
    const utcEstimate = Date.UTC(year, month - 1, day, hour, minute, second);

    // Step 2: Format that UTC instant in the target timezone to see what wall-clock it maps to
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(new Date(utcEstimate));
    const get = (type) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);

    let tzHour = get('hour');
    if (tzHour === 24) tzHour = 0; // some locales use 24 for midnight

    const tzWall = Date.UTC(get('year'), get('month') - 1, get('day'), tzHour, get('minute'), get('second'));

    // Step 3: The difference tells us the timezone's UTC offset at that instant
    const offsetMs = utcEstimate - tzWall;

    // Step 4: Shift the estimate by the offset so the target timezone shows the desired wall-clock
    return new Date(utcEstimate + offsetMs);
  }

  /**
   * Calculate due date based on calendar date and time information
   * The due date is the date that shows up on the calendar, defaulting to 11:59 PM in user's timezone if no time specified
   */
  calculateDueDate(parsedDate, rawDateStr) {
    try {
      // Create a new date object to avoid mutating the original
  const dueDate = new Date(parsedDate);
      
      // If the raw date string includes time information, use it
      if (rawDateStr.includes('T')) {
  
        return dueDate;
      } else {
  // If it's a date-only event (no time specified), default to 11:59 PM local time
        dueDate.setHours(23, 59, 59, 999);
  
        return dueDate;
      }
    } catch (error) {
      console.warn('Failed to calculate due date:', error);
      // Fallback to end of the parsed date in user's timezone
  const fallback = new Date(parsedDate);
  fallback.setHours(23, 59, 59, 999);
  
      return fallback;
    }
  }

  /**
   * Determine if a URL points to an assignment or event based on URL pattern
   */
  isAssignmentUrl(url) {
    if (!url) return null;
    
    // Assignment URLs: http://school.district196.org/assignment/7863396025
    // Event URLs: http://school.district196.org/event/7863601655/profile
    
    const assignmentPattern = /\/assignment\/\d+/i;
    const eventPattern = /\/event\/\d+/i;
    
    if (assignmentPattern.test(url)) {
  
      return true;
    } else if (eventPattern.test(url)) {
  
      return false;
    } else {
  
      return null; // Unknown pattern
    }
  }

  /**
   * Decode iCal escaped values
   */
  decodeICalValue(value) {
    return value
      .replace(/\\n/g, '\n')
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\\\/g, '\\');
  }

  /**
   * Determine if an event is an assignment based SOLELY on URL pattern
   * This follows the user's requirement to base assignment detection solely on the link
   */
  isAssignmentEvent(event) {
  
  
    
    // ONLY use URL pattern to determine if it's an assignment
    // Assignment URLs: http://school.district196.org/assignment/7863396025
    // Event URLs: http://school.district196.org/event/7863601655/profile
    if (event.isAssignmentByUrl === true) {
  
      return true;
    } else if (event.isAssignmentByUrl === false) {
  
      return false;
    } else {
      // No URL found or unknown pattern - skip this event
  
      return false;
    }
  }

  /**
   * Process assignment event and extract relevant information
   */
  processAssignmentEvent(event) {
    // Ensure we have a valid title - if empty/undefined, create a default one
    let title = event.title;
    if (!title || title.trim() === '' || title === 'undefined' || title === null || title === 'null') {
      title = `Schoology Assignment ${event.id || Date.now()}`;

    } else {
      title = title.trim(); // Clean up any whitespace
    }

    // Determine the best due date based on available information
    let dueDate;
    let dueDateSource = 'unknown';

    // Priority order: 1) End date, 2) Start date, 3) fallback to today 11:59 PM
    if (event.endDate) {
      dueDate = new Date(event.endDate);
      dueDateSource = 'end date from calendar';

      const isDateOnly = event.rawEndDate && !event.rawEndDate.includes('T');

      if (isDateOnly) {
        // RFC 5545: date-only DTEND is exclusive — subtract 1 day, set to 11:59 PM
        dueDate.setDate(dueDate.getDate() - 1);
        dueDate.setHours(23, 59, 59, 999);
        dueDateSource = `end date (exclusive DTEND → 11:59 PM previous day, ${getUserTimezone()})`;
      } else {
        // Datetime DTEND — check for midnight and early-morning edge cases
        const endHour = dueDate.getHours();
        const endMin = dueDate.getMinutes();
        const endSec = dueDate.getSeconds();

        if (endHour === 0 && endMin === 0 && endSec === 0) {
          // Midnight datetime DTEND: treat as end-of-previous-day (11:59 PM)
          // This handles iCal entries like DTEND:20260305T000000 which mean
          // the event/assignment ends at the boundary of March 4 → March 5
          dueDate.setDate(dueDate.getDate() - 1);
          dueDate.setHours(23, 59, 59, 999);
          dueDateSource = `end date (midnight DTEND → 11:59 PM previous day, ${getUserTimezone()})`;
        } else if (endHour < 6 && event.startDate) {
          // Early morning DTEND (12:00 AM – 5:59 AM): likely a timezone artifact
          // or Schoology encoding "end of day" as just-past-midnight.
          // If DTSTART is late evening on the previous calendar day, use DTSTART
          // as the actual due time since it better represents the deadline.
          const startDate = new Date(event.startDate);
          const startHour = startDate.getHours();
          const startDay = startDate.toDateString();
          const endDay = dueDate.toDateString();

          if (startDay !== endDay && startHour >= 20) {
            // DTSTART is evening on the previous day — use it as the due time
            dueDate = new Date(startDate);
            dueDateSource = `start date (DTEND early AM ${endHour}:${String(endMin).padStart(2,'0')}, using late-PM DTSTART instead)`;
          } else if (startDay === endDay && startHour >= 20) {
            // Same calendar day but DTSTART is evening — use it
            dueDate = new Date(startDate);
            dueDateSource = `start date (DTEND early AM, using late-PM DTSTART instead)`;
          }
          // else: keep DTEND as-is (genuinely early-morning due time)
        }
        // else: normal datetime DTEND with a meaningful time — use as-is
      }
    } else if (event.startDate) {
      dueDate = new Date(event.startDate);
      dueDateSource = 'start date from calendar';

      // If it's midnight, set to 11:59 PM (date-only DTSTART or midnight marker)
      if (dueDate.getHours() === 0 && dueDate.getMinutes() === 0 && dueDate.getSeconds() === 0) {
        dueDate.setHours(23, 59, 59, 999);
        dueDateSource = `start date (midnight → 11:59 PM, ${getUserTimezone()})`;
      }
    } else {
      // Last resort: default to 11:59 PM today in user's timezone
      const userTimezone = getUserTimezone();
      dueDate = new Date();
      dueDate.setHours(23, 59, 59, 999);
      dueDateSource = `defaulted to 11:59 PM today in ${userTimezone} (no date found)`;
    }
    
    // Convert to timestamp (seconds, not milliseconds, to match Schoology format)
    const dueTimestamp = Math.floor(dueDate.getTime() / 1000);
    
    // Ensure the link is included in the description if it exists
    let description = event.description || '';
    if (event.url && !description.includes(event.url)) {
      // Add the link to the description if it's not already there
      if (description.trim()) {
        description += `\n- Link: ${event.url}`;
      } else {
        description = `- Link: ${event.url}`;
      }
    }
    
    const processedAssignment = {
      id: `ical_${event.id || Date.now()}`,
      title: title, // Use the validated title
      description: description,
      due: dueTimestamp, // Unix timestamp in seconds
      dueDate: dueDate, // Keep the Date object for easier handling in convertAssignmentToTask
      created: event.created ? Math.floor(event.created.getTime() / 1000) : Math.floor(Date.now() / 1000),
      courseName: '', // Left blank as subject doesn't show up in Schoology calendar
      courseCode: '', // Left blank as subject doesn't show up in Schoology calendar
      courseId: 'schoology', // Generic course ID for Schoology assignments
      location: event.location,
      url: event.url || '',
      type: 'assignment',
      source: 'calendar',
      dueDateSource: dueDateSource // For debugging
    };
    
  
  
  
  
    
    return processedAssignment;
  }

  /**
   * Fetch and parse Schoology calendar feed with multiple CORS proxy fallbacks
   */
  async fetchCalendarFeed(calendarUrl) {
    // Return cached data if still fresh (avoids redundant Netlify requests)
    if (
      this._cache &&
      this._cache.url === calendarUrl &&
      Date.now() - this._cache.fetchedAt < this._cacheTTL
    ) {
      return this.parseICalData(this._cache.data);
    }

    const maxRetries = this.corsProxies.length;
    let lastError = null;

  

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const currentProxy = this.corsProxies[this.currentProxyIndex];
        const proxyUrl = currentProxy + encodeURIComponent(calendarUrl);
        
  
  
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/calendar, application/calendar, text/plain, */*',
            'User-Agent': 'Apex Scholar Calendar Sync'
          },
          mode: 'cors',
          credentials: 'omit'
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const icalData = await response.text();
        
        if (!icalData || icalData.trim() === '') {
          throw new Error('Empty calendar data received');
        }

        // Cache the successful response
        this._cache = { url: calendarUrl, data: icalData, fetchedAt: Date.now() };

        // Validate that we received iCal data
        if (!icalData.includes('BEGIN:VCALENDAR')) {
          // Log what we actually got for diagnostics
          const preview = icalData.substring(0, 200).replace(/\s+/g, ' ');
          console.warn(`[Calendar] Proxy returned non-iCal content (first 200 chars): ${preview}`);
          throw new Error('Invalid iCal format: Missing VCALENDAR header');
        }

  
  
        return icalData;

      } catch (error) {
        console.warn(`❌ Proxy attempt ${attempt + 1} failed:`, error.message);
        lastError = error;
        
        // Try next proxy
        this.currentProxyIndex = (this.currentProxyIndex + 1) % this.corsProxies.length;
        
        // Add delay between attempts (except for last attempt)
        if (attempt < maxRetries - 1) {
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    console.error('💥 All CORS proxy attempts failed');
    throw new Error(`All CORS proxy attempts failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Parse assignments from calendar data 
   */
  async parseCalendarToAssignments(calendarUrl) {
    try {
    const icalData = await this.fetchCalendarFeed(calendarUrl);
      
    const assignments = this.parseICalData(icalData);
      
      return assignments;
    } catch (error) {
      console.error('❌ Error fetching calendar feed:', error);
      throw new Error(`Failed to fetch calendar: ${error.message}`);
    }
  }

  /**
   * Validate calendar URL format
   */
  isValidCalendarUrl(url) {
    try {
      const urlObj = new URL(url);
      return (
        (urlObj.protocol === 'webcal:' || urlObj.protocol === 'https:' || urlObj.protocol === 'http:') &&
        url.includes('ical') &&
        (url.includes('schoology') || url.includes('calendar'))
      );
    } catch {
      return false;
    }
  }

  /**
   * Convert webcal:// to https://
   */
  normalizeCalendarUrl(url) {
    if (url.startsWith('webcal://')) {
      return url.replace('webcal://', 'https://');
    }
    return url;
  }

  /**
   * Test date parsing functionality
   */
  testDateParsing() {
  
    
    const testDates = [
      '20250825T140000Z',     // UTC datetime
      '20250825T140000',      // Local datetime
      '20250825',             // Date only
      '20250930T235959',      // End of day
      '20250101T000000'       // Start of day
    ];
    
    testDates.forEach(dateStr => {
      this.parseICalDate(dateStr);
    });
  }
}

// Export singleton instance
export const schoologyCalendar = new SchoologyCalendarService();
export default schoologyCalendar;
