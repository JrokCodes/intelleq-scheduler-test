// Time slots from 7:00 AM to 5:00 PM in 15-minute increments (41 slots)
export const TIME_SLOTS = Array.from({ length: 41 }, (_, i) => {
  const totalMinutes = 7 * 60 + i * 15; // Start at 7:00 AM
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  const ampm = hours >= 12 ? 'PM' : 'AM';

  return {
    time: `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`,
    hour24: hours,
    minute: minutes,
    isLunchTime: hours === 12 && minutes < 60, // 12:00 PM - 1:00 PM
  };
});

export const PROVIDERS = [
  { id: 'cherie', name: 'Cherie', fullName: 'Ng, Cherie - PA' },
  { id: 'anna_lia', name: 'Anna-Lia', fullName: 'Quinio, Anna-Lia - MD' },
] as const;

// Weekdays only (Monday-Friday)
export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
] as const;

// Authentication
export const API_BASE_URL = 'https://api.intelleqn8n.net';
export const AUTH_TOKEN_KEY = 'quinio_auth_token';
export const STAFF_NAME_KEY = 'quinio_staff_name';
export const AUTH_STORAGE_KEY = AUTH_TOKEN_KEY; // Alias for backward compatibility
export const AUTH_PRACTICE = 'quinio';

// Quinio Staff Members
export const QUINIO_STAFF = [
  'Grayce',
  'Cherie',
  'Dr. Q',
  'Nicole',
  'Kristianne',
  'Rixon',
] as const;

export type QuinioStaffMember = typeof QUINIO_STAFF[number];
