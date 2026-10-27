/**
 * Date utility functions for CampusConnect
 *
 * The campus operates on Indian Standard Time (Asia/Kolkata, UTC+05:30).
 * All calendar-relative rules (such as Lost & Found occurrence dates)
 * are evaluated against this campus timezone.
 */

export const CAMPUS_TIMEZONE = 'Asia/Kolkata';

/**
 * Returns the calendar date string (YYYY-MM-DD) for a given Date or timestamp
 * in the campus timezone (Asia/Kolkata).
 *
 * @param {Date|string|number} [dateInput=new Date()]
 * @returns {string} Formatted as YYYY-MM-DD
 */
export const getCampusDateString = (dateInput = new Date()) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date provided to getCampusDateString');
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: CAMPUS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === 'year').value;
  const month = parts.find((p) => p.type === 'month').value;
  const day = parts.find((p) => p.type === 'day').value;

  return `${year}-${month}-${day}`;
};

/**
 * Checks if a given date is strictly in the future relative to the campus timezone (Asia/Kolkata).
 *
 * - For date-only strings ('YYYY-MM-DD'), compares directly against today's calendar date in Asia/Kolkata.
 * - For full Date objects or timestamps, converts to Asia/Kolkata calendar date and compares.
 * - Accepts an optional refDate (defaults to new Date()) for deterministic testing across timezone boundaries.
 *
 * @param {Date|string|number} dateInput - The date to check
 * @param {Date} [refDate=new Date()] - Reference "now" date
 * @returns {boolean} true if date is strictly in the future in Asia/Kolkata, false otherwise
 */
export const isFutureDate = (dateInput, refDate = new Date()) => {
  if (!dateInput && dateInput !== 0) return false;

  const todayCampus = getCampusDateString(refDate);

  // If input is a date-only string (YYYY-MM-DD), compare directly
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    const trimmed = dateInput.trim();
    const parsed = new Date(trimmed);
    if (isNaN(parsed.getTime())) return false;
    return trimmed > todayCampus;
  }

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return false;

  const inputCampus = getCampusDateString(date);
  return inputCampus > todayCampus;
};
