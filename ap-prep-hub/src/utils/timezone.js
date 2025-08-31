/**
 * Timezone utility functions for Apex Scholar
 * Provides consistent timezone handling with Central Time as default
 */

// Store for user's timezone preference (will be set from Settings)
let userTimezonePreference = null;

/**
 * Set the user's timezone preference (called from Settings page)
 * @param {string} timezone - The timezone identifier (e.g., 'America/Chicago')
 */
export const setUserTimezonePreference = (timezone) => {
  userTimezonePreference = timezone;
  console.log(`🌍 User timezone preference set to: ${timezone}`);
};

/**
 * Get the user's timezone with Central Time as fallback
 * @returns {string} The timezone identifier (e.g., 'America/Chicago')
 */
export const getUserTimezone = () => {
  // First check if user has set a preference
  if (userTimezonePreference) {
    return userTimezonePreference;
  }
  
  try {
    // Try to get the user's timezone from their browser
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (userTimezone) {
      console.log(`🌍 Detected user timezone: ${userTimezone}`);
      return userTimezone;
    }
  } catch (error) {
    console.warn('Could not detect user timezone:', error);
  }
  
  // Default to Central Time if detection fails
  console.log('🌍 Using default timezone: America/Chicago (Central Time)');
  return 'America/Chicago';
};

/**
 * Get the user's timezone abbreviation (e.g., CDT, CST)
 * @returns {string} The timezone abbreviation
 */
export const getUserTimezoneAbbreviation = () => {
  const timezone = getUserTimezone();
  
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    
    const parts = formatter.formatToParts(now);
    const timeZonePart = parts.find(part => part.type === 'timeZoneName');
    
    return timeZonePart ? timeZonePart.value : 'CT';
  } catch (error) {
    console.warn('Could not get timezone abbreviation:', error);
    return 'CT'; // Central Time fallback
  }
};

/**
 * Format a date in the user's timezone (or Central Time as default)
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDateInUserTimezone = (date, options = {}) => {
  const timezone = getUserTimezone();
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDateInUserTimezone:', date);
    return '';
  }
  
  const defaultOptions = {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  try {
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
  } catch (error) {
    console.warn('Error formatting date in timezone:', error);
    return dateObj.toLocaleDateString();
  }
};

/**
 * Format a time in the user's timezone (or Central Time as default)
 * @param {Date|string|number} date - The date/time to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted time string
 */
export const formatTimeInUserTimezone = (date, options = {}) => {
  const timezone = getUserTimezone();
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatTimeInUserTimezone:', date);
    return '';
  }
  
  const defaultOptions = {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  try {
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
  } catch (error) {
    console.warn('Error formatting time in timezone:', error);
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
};

/**
 * Format a full date and time in the user's timezone (or Central Time as default)
 * @param {Date|string|number} date - The date/time to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date and time string
 */
export const formatDateTimeInUserTimezone = (date, options = {}) => {
  const timezone = getUserTimezone();
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDateTimeInUserTimezone:', date);
    return '';
  }
  
  const defaultOptions = {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  try {
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
  } catch (error) {
    console.warn('Error formatting datetime in timezone:', error);
    return dateObj.toLocaleString();
  }
};

/**
 * Get the current time in the user's timezone (or Central Time as default)
 * @returns {Date} Current date/time in user's timezone
 */
export const getCurrentTimeInUserTimezone = () => {
  const timezone = getUserTimezone();
  
  try {
    // Get current time in user's timezone
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    
    // Get timezone offset for user's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'longOffset'
    });
    
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find(part => part.type === 'timeZoneName');
    
    if (offsetPart) {
      // Parse offset (e.g., "GMT-5" or "GMT+2")
      const offsetMatch = offsetPart.value.match(/GMT([+-])(\d+)/);
      if (offsetMatch) {
        const sign = offsetMatch[1] === '+' ? 1 : -1;
        const hours = parseInt(offsetMatch[2]);
        const offset = sign * hours * 60; // Convert to minutes
        
        return new Date(utc + (offset * 60000));
      }
    }
  } catch (error) {
    console.warn('Error getting time in user timezone:', error);
  }
  
  // Fallback to local time
  return new Date();
};

/**
 * Convert a time string to the user's timezone
 * @param {string} timeString - Time in format "HH:MM" or "HH:MM AM/PM"
 * @param {Date} date - Optional date to use (defaults to today)
 * @returns {Date} Date object in user's timezone
 */
export const parseTimeInUserTimezone = (timeString, date = new Date()) => {
  try {
    // Parse time string
    let hours, minutes;
    
    if (timeString.includes('AM') || timeString.includes('PM')) {
      // 12-hour format
      const [time, period] = timeString.split(' ');
      const [h, m] = time.split(':').map(Number);
      
      hours = h === 12 ? 0 : h;
      if (period === 'PM' && h !== 12) hours += 12;
      minutes = m || 0;
    } else {
      // 24-hour format
      const [h, m] = timeString.split(':').map(Number);
      hours = h;
      minutes = m || 0;
    }
    
    // Create date in user's timezone
    const targetDate = new Date(date);
    targetDate.setHours(hours, minutes, 0, 0);
    
    return targetDate;
  } catch (error) {
    console.warn('Error parsing time in user timezone:', error);
    return new Date(date);
  }
};

/**
 * Check if daylight saving time is currently active in the user's timezone
 * @returns {boolean} True if DST is active
 */
export const isDaylightSavingTime = () => {
  const timezone = getUserTimezone();
  
  try {
    const now = new Date();
    const january = new Date(now.getFullYear(), 0, 1);
    const july = new Date(now.getFullYear(), 6, 1);
    
    const janOffset = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'longOffset'
    }).formatToParts(january).find(part => part.type === 'timeZoneName')?.value;
    
    const julOffset = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'longOffset'
    }).formatToParts(july).find(part => part.type === 'timeZoneName')?.value;
    
    const currentOffset = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'longOffset'
    }).formatToParts(now).find(part => part.type === 'timeZoneName')?.value;
    
    // DST is active if current offset matches July offset (assuming Northern Hemisphere)
    return currentOffset === julOffset && janOffset !== julOffset;
  } catch (error) {
    console.warn('Error checking daylight saving time:', error);
    return false;
  }
};

/**
 * Get a user-friendly timezone display string
 * @returns {string} Display string like "Central Time (CDT)"
 */
export const getTimezoneDisplayString = () => {
  const timezone = getUserTimezone();
  const abbreviation = getUserTimezoneAbbreviation();
  
  // Map timezone identifiers to friendly names
  const timezoneNames = {
    'America/New_York': 'Eastern Time',
    'America/Chicago': 'Central Time',
    'America/Denver': 'Mountain Time',
    'America/Los_Angeles': 'Pacific Time',
    'America/Phoenix': 'Mountain Standard Time',
    'America/Anchorage': 'Alaska Time',
    'Pacific/Honolulu': 'Hawaii Time'
  };
  
  const friendlyName = timezoneNames[timezone] || timezone.replace('_', ' ').replace('/', ', ');
  
  return `${friendlyName} (${abbreviation})`;
};

// Export default timezone for use throughout the app
export const DEFAULT_TIMEZONE = 'America/Chicago';
export const DEFAULT_TIMEZONE_ABBREVIATION = 'CT';
