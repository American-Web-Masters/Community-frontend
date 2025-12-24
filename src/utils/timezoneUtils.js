import { DateTime } from 'luxon';

/**
 * Timezone utility functions for handling event datetime conversions
 */

/**
 * Get the user's local timezone
 * @returns {string} User's timezone (e.g., 'America/New_York')
 */
export const getUserTimeZone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Convert local datetime to UTC for server storage
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:mm format
 * @param {string} timezone - User's timezone (optional, will detect if not provided)
 * @returns {object} Object with utcDate, utcTime, and full ISO string
 */
export const convertLocalToUTC = (date, time, timezone = null) => {
  const userTz = timezone || getUserTimeZone();
  
  try {
    // Create datetime in user's timezone
    const localDateTime = DateTime.fromISO(`${date}T${time}`, { zone: userTz });
    
    // Convert to UTC
    const utcDateTime = localDateTime.toUTC();
    
    return {
      utcDate: utcDateTime.toFormat('yyyy-MM-dd'),
      utcTime: utcDateTime.toFormat('HH:mm:ss'),
      utcISO: utcDateTime.toISO(),
      // Also include the full ISO string for sending as eventDateTime
      eventDateTime: utcDateTime.toISO()
    };
  } catch (error) {
    console.error('Error converting local to UTC:', error);
    return { 
      utcDate: date, 
      utcTime: time, 
      utcISO: null,
      eventDateTime: null 
    };
  }
};

/**
 * Convert UTC datetime from server to local timezone for display
 * @param {string} date - UTC date in YYYY-MM-DD format OR ISO datetime string
 * @param {string} time - UTC time in HH:mm format (optional if date is ISO string)
 * @param {string} timezone - User's timezone (optional, will detect if not provided)
 * @returns {object} Object with localDate and localTime
 */
export const convertUTCToLocal = (date, time = null, timezone = null) => {
  const userTz = timezone || getUserTimeZone();
  
  try {
    let utcDateTime;
    
    // Handle ISO datetime string (e.g., "2025-12-25T00:00:00.000+00:00")
    if (date.includes('T') && !time) {
      utcDateTime = DateTime.fromISO(date).toUTC();
    }
    // Handle separate date and time strings
    else if (time) {
      utcDateTime = DateTime.fromISO(`${date}T${time}`, { zone: 'utc' });
    }
    // Handle just date string
    else {
      utcDateTime = DateTime.fromISO(`${date}T00:00`, { zone: 'utc' });
    }
    
    const localDateTime = utcDateTime.setZone(userTz);
    
    return {
      localDate: localDateTime.toFormat('yyyy-MM-dd'),
      localTime: localDateTime.toFormat('HH:mm'),
      localISO: localDateTime.toISO()
    };
  } catch (error) {
    console.error('Error converting UTC to local:', error);
    return { localDate: date, localTime: time || '00:00', localISO: null };
  }
};

/**
 * Format date for display in user's locale
 * @param {string} date - Date in YYYY-MM-DD format OR ISO datetime string
 * @param {string} time - Time in HH:mm format (optional if date is ISO string)
 * @param {string} timezone - Timezone for the datetime (optional)
 * @returns {string} Formatted date string
 */
export const formatLocalDate = (date, time = '00:00', timezone = null) => {
  const userTz = timezone || getUserTimeZone();
  
  if (!date) {
    return 'No Date';
  }
  
  try {
    let dateTime;
    
    // Handle ISO datetime string
    if (date.includes('T')) {
      dateTime = DateTime.fromISO(date).setZone(userTz);
    }
    // Handle date-only string
    else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      dateTime = DateTime.fromISO(`${date}T${time}`, { zone: userTz });
    }
    // Handle other formats
    else {
      dateTime = DateTime.fromISO(date).setZone(userTz);
    }
    
    if (!dateTime.isValid) {
      console.error('Invalid datetime created:', dateTime.invalidExplanation);
      return 'Invalid Date';
    }
    
    return dateTime.toLocaleString({
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * Format time for display in user's locale (12-hour format)
 * @param {string} time - Time in HH:mm format OR ISO datetime string
 * @param {string} date - Date in YYYY-MM-DD format (optional)
 * @param {string} timezone - Timezone for the datetime (optional)
 * @returns {string} Formatted time string in 12-hour format
 */
export const formatLocalTime = (time, date = null, timezone = null) => {
  const userTz = timezone || getUserTimeZone();
  
  if (!time) {
    return 'No Time';
  }
  
  try {
    let dateTime;
    
    // Handle ISO datetime string
    if (time.includes('T')) {
      dateTime = DateTime.fromISO(time).setZone(userTz);
    }
    // Handle time-only string
    else if (time.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
      const useDate = date || DateTime.now().toFormat('yyyy-MM-dd');
      dateTime = DateTime.fromISO(`${useDate}T${time}`, { zone: userTz });
    }
    // Handle other formats
    else {
      dateTime = DateTime.fromISO(time).setZone(userTz);
    }
    
    if (!dateTime.isValid) {
      console.error('Invalid datetime created:', dateTime.invalidExplanation);
      return 'Invalid Time';
    }
    
    // Return 12-hour format with AM/PM
    return dateTime.toLocaleString({
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Time formatting error:', error);
    return 'Invalid Time';
  }
};

/**
 * Check if a datetime is in the past
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:mm format
 * @param {string} timezone - Timezone for the datetime (optional)
 * @returns {boolean} True if the datetime is in the past
 */
export const isDateTimeInPast = (date, time, timezone = null) => {
  const userTz = timezone || getUserTimeZone();
  
  try {
    const dateTime = DateTime.fromISO(`${date}T${time}`, { zone: userTz });
    return dateTime < DateTime.now().setZone(userTz);
  } catch (error) {
    console.error('Error checking if datetime is in past:', error);
    return false;
  }
};

/**
 * Get minimum date for form inputs (today in user's timezone)
 * @param {string} timezone - User's timezone (optional)
 * @returns {string} Date in YYYY-MM-DD format
 */
export const getMinDate = (timezone = null) => {
  const userTz = timezone || getUserTimeZone();
  
  try {
    const now = DateTime.now().setZone(userTz);
    return now.toFormat('yyyy-MM-dd');
  } catch (error) {
    console.error('Error getting min date:', error);
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * Parse backend datetime response and convert to local timezone
 * Handles both ISO strings and separate date/time fields
 * @param {object} eventData - Event data from backend
 * @param {string} timezone - User's timezone (optional)
 * @returns {object} Event data with local datetime fields
 */
export const parseBackendDateTime = (eventData, timezone = null) => {
  const userTz = timezone || getUserTimeZone();
  
  try {
    // Handle MongoDB date format with $date wrapper
    let eventDateTime = null;
    
    // Check for MongoDB date format in eventDate field
    if (eventData.eventDate) {
      let mongoDate;
      let timeString = eventData.eventTime || '00:00:00';
      
      // Handle different formats of eventDate
      if (typeof eventData.eventDate === 'object' && eventData.eventDate.$date) {
        mongoDate = eventData.eventDate.$date;
      } else if (typeof eventData.eventDate === 'string') {
        mongoDate = eventData.eventDate;
      }
      
      if (mongoDate) {
        // Extract just the date part from MongoDB date
        const datePart = mongoDate.split('T')[0]; // Gets 'YYYY-MM-DD'
        
        // Ensure time has seconds
        const timeWithSeconds = timeString.includes(':') && timeString.split(':').length === 3 
          ? timeString 
          : timeString + ':00';
        
        // Construct the complete UTC datetime string
        const utcDateTimeString = `${datePart}T${timeWithSeconds}.000Z`;
        eventDateTime = utcDateTimeString;
      }
    }
    // Check for direct ISO datetime field
    else if (eventData.eventDateTime || eventData.datetime || eventData.date) {
      eventDateTime = eventData.eventDateTime || eventData.datetime || eventData.date;
      
      // Handle MongoDB date format
      if (typeof eventDateTime === 'object' && eventDateTime.$date) {
        eventDateTime = eventDateTime.$date;
      }
    }
    // Check for createdAt field as fallback
    else if (eventData.createdAt) {
      let createdAt = eventData.createdAt;
      if (typeof createdAt === 'object' && createdAt.$date) {
        createdAt = createdAt.$date;
      }
      eventDateTime = createdAt;
    }
    
    if (eventDateTime) {
      // Handle ISO datetime string
      const utcDateTime = DateTime.fromISO(eventDateTime);
      
      if (!utcDateTime.isValid) {
        console.error('Invalid UTC datetime created:', utcDateTime.invalidExplanation);
        return eventData;
      }
      
      const localDateTime = utcDateTime.setZone(userTz);
      
      return {
        ...eventData,
        localEventDate: localDateTime.toFormat('yyyy-MM-dd'),
        localEventTime: localDateTime.toFormat('HH:mm'),
        originalDateTime: eventDateTime,
        // For editing, provide separate fields in local time
        eventDate: localDateTime.toFormat('yyyy-MM-dd'),
        eventTime: localDateTime.toFormat('HH:mm')
      };
    }
    // If eventData has separate eventDate and eventTime fields (legacy format)
    else if (eventData.eventDate && eventData.eventTime) {
      const localDateTime = convertUTCToLocal(eventData.eventDate, eventData.eventTime, userTz);
      return {
        ...eventData,
        localEventDate: localDateTime.localDate,
        localEventTime: localDateTime.localTime,
        originalEventDate: eventData.eventDate,
        originalEventTime: eventData.eventTime
      };
    }
    
    return eventData;
  } catch (error) {
    console.error('Error parsing backend datetime:', error);
    return eventData;
  }
};
