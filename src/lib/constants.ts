// Time slots from 7:00 AM to 5:00 PM in 15-minute increments
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
  { id: 'anna-lia', name: 'Anna-Lia', fullName: 'Quinio, Anna-Lia - MD' },
] as const;

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const AUTH_PASSWORD = 'intelleq2025';
export const AUTH_STORAGE_KEY = 'intelleq_auth';
