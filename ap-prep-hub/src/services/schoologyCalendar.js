/**
 * Schoology Calendar Feed Service
 * Handles parsing and processing of Schoology iCal calendar feeds
 */

import { 
  getUserTimezone, 
  formatDateTimeInUserTimezone
} from '../utils/timezone';

class SchoologyCalendarService {
  constructor() {
    // Use a more reliable CORS proxy that supports localhost development
    this.corsProxies = [
      'https://corsproxy.io/?',
      'https://cors-anywhere.herokuapp.com/',
      'https://api.allorigins.win/raw?url=',
      'https://proxy.cors.sh/'
    ];
    this.currentProxyIndex = 0;
  }

  /**
   * Parse iCal data to extract assignments
   */
  parseICalData(icalData) {
    const assignments = [];
    const lines = icalData.split('\n').map(line => line.trim());
    
    console.log(`📄 Parsing iCal data with ${lines.length} lines`);
    
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
        console.log(`📅 Starting event ${eventCount}`);
      } else if (line === 'END:VEVENT' && inEvent) {
        if (currentEvent) {
          // Validate and clean up the event before processing
          if (!currentEvent.title || currentEvent.title.trim() === '' || currentEvent.title === 'undefined') {
            console.log(`⚠️ Event ${eventCount} has no title, creating default title`);
            currentEvent.title = `Calendar Event ${eventCount} (${new Date().toISOString().split('T')[0]})`;
          }
          
          // Additional validation for undefined fields
          if (currentEvent.title === 'undefined' || currentEvent.title === null) {
            currentEvent.title = `Schoology Calendar Item ${eventCount}`;
          }
          
          console.log(`🔍 Processing event: "${currentEvent.title}"`);
          
          // Only include events that are confirmed as assignments by URL pattern
          if (this.isAssignmentEvent(currentEvent)) {
            const processedAssignment = this.processAssignmentEvent(currentEvent);
            // Final validation of processed assignment
            if (processedAssignment && processedAssignment.title && processedAssignment.title.trim() !== '') {
              assignments.push(processedAssignment);
              console.log(`✅ Added assignment: "${processedAssignment.title}"`);
            } else {
              console.log(`❌ Skipping invalid assignment with missing title`);
            }
          } else {
            console.log(`⏭️ Skipping non-assignment event: "${currentEvent.title}"`);
          }
        }
        inEvent = false;
        currentEvent = null;
      } else if (inEvent && currentEvent) {
        // Debug: log each line being processed for events
        if (line.startsWith('DTSTART') || line.startsWith('DTEND') || line.startsWith('SUMMARY')) {
          console.log(`📝 Processing line in event ${eventCount}: ${line}`);
        }
        this.parseEventProperty(line, currentEvent);
      }
    }

    console.log(`📊 Parsed ${eventCount} total events, found ${assignments.length} assignments`);
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
        console.log(`🔗 Extracted URL from description: ${event.url} - isAssignment: ${event.isAssignmentByUrl}`);
      }
    } else if (line.startsWith('URL:')) {
      // Also check the URL field directly (fallback)
      event.url = line.substring(4);
      event.isAssignmentByUrl = this.isAssignmentUrl(event.url);
      console.log(`🔗 Found URL field: ${event.url} - isAssignment: ${event.isAssignmentByUrl}`);
    } else if (line.startsWith('DTSTART')) {
      // Handle both DTSTART: and DTSTART;VALUE=DATE: formats
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const dateStr = line.substring(colonIndex + 1);
        event.rawStartDate = dateStr;
        const parsedDate = this.parseICalDate(dateStr);
        console.log(`📅 DTSTART parsed: ${dateStr} → ${parsedDate ? parsedDate.toLocaleString() : 'null'}`);
        if (parsedDate) {
          event.startDate = parsedDate;
          // Set initial due date to start date (will be overridden by end date if available)
          event.due = parsedDate;
        }
      }
    } else if (line.startsWith('DTEND')) {
      // Handle both DTEND: and DTEND;VALUE=DATE: formats
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const dateStr = line.substring(colonIndex + 1);
        event.rawEndDate = dateStr;
        const parsedDate = this.parseICalDate(dateStr);
        console.log(`📅 DTEND parsed: ${dateStr} → ${parsedDate ? parsedDate.toLocaleString() : 'null'}`);
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
   */
  parseICalDate(dateStr) {
    try {
      console.log(`📅 Parsing date string: "${dateStr}"`);
      
      // Clean up the date string
      const cleanDateStr = dateStr.trim();
      
      if (!cleanDateStr) {
        console.warn('Empty date string provided');
        return null;
      }
      
      // Handle different iCal date formats with timezone awareness
      if (cleanDateStr.includes('T')) {
        // DateTime format: 20250825T140000Z or 20250825T140000
        let isoStr;
        if (cleanDateStr.endsWith('Z')) {
          // UTC time: 20250825T140000Z
          isoStr = cleanDateStr.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z');
        } else {
          // Local time: 20250825T140000 - interpret in user's timezone
          isoStr = cleanDateStr.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6');
        }
        
        const date = new Date(isoStr);
        if (!isNaN(date.getTime())) {
          console.log(`✅ Parsed datetime: ${cleanDateStr} → ${formatDateTimeInUserTimezone(date)}`);
          return date;
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
            console.log(`✅ Parsed date in local timezone (avoiding double conversion): ${cleanDateStr} → ${formatDateTimeInUserTimezone(date)}`);
            return date;
          }
        } catch (timezoneError) {
          console.warn('Date parsing failed, using fallback:', timezoneError);
          // Fallback to ISO string parsing
          const date = new Date(`${year}-${month}-${day}T00:00:00`);
          if (!isNaN(date.getTime())) {
            console.log(`✅ Parsed date (ISO fallback): ${cleanDateStr} → ${formatDateTimeInUserTimezone(date)}`);
            return date;
          }
        }
      }
      
      // Try parsing as a regular date string as fallback
      const fallbackDate = new Date(cleanDateStr);
      if (!isNaN(fallbackDate.getTime())) {
        console.log(`✅ Parsed fallback: ${cleanDateStr} → ${formatDateTimeInUserTimezone(fallbackDate)}`);
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
   * Calculate due date based on calendar date and time information
   * The due date is the date that shows up on the calendar, defaulting to 11:59 PM in user's timezone if no time specified
   */
  calculateDueDate(parsedDate, rawDateStr) {
    try {
      // Create a new date object to avoid mutating the original
      const dueDate = new Date(parsedDate);
      const userTimezone = getUserTimezone();
      
      // If the raw date string includes time information, use it
      if (rawDateStr.includes('T')) {
        console.log(`⏰ Using specific time from calendar: ${formatDateTimeInUserTimezone(dueDate)} (${userTimezone})`);
        return dueDate;
      } else {
        // If it's a date-only event (no time specified), default to 11:59 PM in user's timezone
        dueDate.setHours(23, 59, 59, 999);
        console.log(`🌙 No time specified, defaulting to 11:59 PM in ${userTimezone}: ${formatDateTimeInUserTimezone(dueDate)}`);
        return dueDate;
      }
    } catch (error) {
      console.warn('Failed to calculate due date:', error);
      // Fallback to end of the parsed date in user's timezone
      const fallback = new Date(parsedDate);
      fallback.setHours(23, 59, 59, 999);
      const userTimezone = getUserTimezone();
      console.log(`⚠️ Using fallback due date in ${userTimezone}: ${formatDateTimeInUserTimezone(fallback)}`);
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
      console.log(`📝 URL pattern indicates ASSIGNMENT: ${url}`);
      return true;
    } else if (eventPattern.test(url)) {
      console.log(`📅 URL pattern indicates EVENT: ${url}`);
      return false;
    } else {
      console.log(`❓ Unknown URL pattern: ${url}`);
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
    console.log(`🔍 Checking event: "${event.title}"`);
    console.log(`🔗 URL: ${event.url || 'No URL found'}`);
    
    // ONLY use URL pattern to determine if it's an assignment
    // Assignment URLs: http://school.district196.org/assignment/7863396025
    // Event URLs: http://school.district196.org/event/7863601655/profile
    if (event.isAssignmentByUrl === true) {
      console.log(`✅ ASSIGNMENT confirmed by URL pattern: "${event.title}"`);
      return true;
    } else if (event.isAssignmentByUrl === false) {
      console.log(`❌ EVENT (non-assignment) confirmed by URL pattern: "${event.title}"`);
      return false;
    } else {
      // No URL found or unknown pattern - skip this event
      console.log(`❓ No assignment URL found or unknown pattern, skipping: "${event.title}"`);
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
      console.log(`⚠️ No valid title found, using default: "${title}"`);
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
      
      // If it's a date-only event (midnight), set to 11:59 PM in user's timezone
      if (dueDate.getHours() === 0 && dueDate.getMinutes() === 0 && dueDate.getSeconds() === 0) {
        dueDate.setHours(23, 59, 59, 999);
        dueDateSource = `end date from calendar (time set to 11:59 PM ${getUserTimezone()})`;
      }
    } else if (event.startDate) {
      dueDate = new Date(event.startDate);
      dueDateSource = 'start date from calendar';
      
      // If it's a date-only event (midnight), set to 11:59 PM in user's timezone
      if (dueDate.getHours() === 0 && dueDate.getMinutes() === 0 && dueDate.getSeconds() === 0) {
        dueDate.setHours(23, 59, 59, 999);
        dueDateSource = `start date from calendar (time set to 11:59 PM ${getUserTimezone()})`;
      }
    } else {
      // Last resort: default to 11:59 PM today in user's timezone
      const userTimezone = getUserTimezone();
      dueDate = new Date();
      dueDate.setHours(23, 59, 59, 999);
      dueDateSource = `defaulted to 11:59 PM today in ${userTimezone} (no date found)`;
      console.log(`⚠️ No date found for "${event.title}", using 11:59 PM today in ${userTimezone}`);
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
    
    console.log(`✅ Processed assignment: "${title}"`);
    console.log(`   Due: ${formatDateTimeInUserTimezone(dueDate)} (${dueDateSource})`);
    console.log(`   Due Timestamp: ${dueTimestamp}`);
    console.log(`   Description Length: ${description.length} chars`);
    console.log('---');
    
    return processedAssignment;
  }

  /**
   * Fetch and parse Schoology calendar feed with multiple CORS proxy fallbacks
   */
  async fetchCalendarFeed(calendarUrl) {
    const maxRetries = this.corsProxies.length;
    let lastError = null;

    console.log('🗓️ Fetching Schoology calendar feed:', calendarUrl);

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const currentProxy = this.corsProxies[this.currentProxyIndex];
        const proxyUrl = currentProxy + encodeURIComponent(calendarUrl);
        
        console.log(`🔗 Attempt ${attempt + 1}/${maxRetries} using proxy: ${currentProxy}`);
        console.log('🔗 Full proxy URL:', proxyUrl);
        
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

        // Validate that we received iCal data
        if (!icalData.includes('BEGIN:VCALENDAR')) {
          throw new Error('Invalid iCal format: Missing VCALENDAR header');
        }

        console.log('✅ Successfully fetched calendar data');
        console.log(`📊 Calendar data length: ${icalData.length} characters`);
        return icalData;

      } catch (error) {
        console.warn(`❌ Proxy attempt ${attempt + 1} failed:`, error.message);
        lastError = error;
        
        // Try next proxy
        this.currentProxyIndex = (this.currentProxyIndex + 1) % this.corsProxies.length;
        
        // Add delay between attempts (except for last attempt)
        if (attempt < maxRetries - 1) {
          console.log('⏳ Waiting 1 second before trying next proxy...');
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
      console.log('📄 Calendar data fetched, length:', icalData.length);
      console.log('📄 First 500 chars:', icalData.substring(0, 500));
      
      const assignments = this.parseICalData(icalData);
      console.log(`✅ Parsed ${assignments.length} assignments from calendar`);
      
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
    console.log('🧪 Testing iCal date parsing:');
    
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
