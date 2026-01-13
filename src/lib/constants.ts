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

// Authentication - TEST ENVIRONMENT
export const API_BASE_URL = 'https://api.intelleqn8n.net';
export const AUTH_TOKEN_KEY = 'quinio_test_auth_token';
export const STAFF_NAME_KEY = 'quinio_test_staff_name';
export const AUTH_STORAGE_KEY = AUTH_TOKEN_KEY; // Alias for backward compatibility
export const AUTH_PRACTICE = 'quinio_test';

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

// Appointment Types
export const APPOINTMENT_TYPES = [
  'Complete Physical Exam',
  'Follow-up',
  'Medicare Wellness Visit',
  'New Patient',
  'Office Visit',
  'Procedure',
  'Same Day',
  'Shots Only',
  'Video Visit',
  'Well Child Check',
] as const;

// Default durations for each appointment type (in minutes)
export const APPOINTMENT_TYPE_DURATIONS: Record<string, number> = {
  'Complete Physical Exam': 30,
  'Follow-up': 15,
  'Medicare Wellness Visit': 30,
  'New Patient': 30,
  'Office Visit': 15,
  'Procedure': 30,
  'Same Day': 15,
  'Shots Only': 15,
  'Video Visit': 15,
  'Well Child Check': 30,
};

// Duration options for appointment booking
export const DURATIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '60 minutes', value: 60 },
] as const;

// Hawaii timezone constant
export const HAWAII_TZ = 'Pacific/Honolulu';

// ============================================
// BILLING CONSTANTS
// ============================================

// Hawaii Payer IDs (EDI Payer Identifiers)
export const HAWAII_PAYER_IDS = {
  HMSA: '34192',
  UHA: '99024',
  MEDICARE: '12502',
  HMAA: '99012',
  KAISER: '91051',
  ALOHACARE: '99914',
  UNITED: '87726',
  AETNA: '60054',
  CIGNA: '62308',
  TRICARE: '99726',
} as const;

// Appointment Type to CPT Code Mapping
export const APPOINTMENT_TYPE_CPT_CODES: Record<string, { code: string; fee: number; description: string }> = {
  'Office Visit': { code: '99213', fee: 150.00, description: 'Office visit, established patient, low MDM' },
  'Follow-up': { code: '99213', fee: 150.00, description: 'Office visit, established patient, low MDM' },
  'New Patient': { code: '99203', fee: 200.00, description: 'Office visit, new patient, low MDM' },
  'Complete Physical Exam': { code: '99396', fee: 250.00, description: 'Preventive visit, established patient, 40-64' },
  'Medicare Wellness Visit': { code: 'G0439', fee: 125.00, description: 'Annual wellness visit, subsequent' },
  'Well Child Check': { code: '99392', fee: 200.00, description: 'Preventive visit, established patient, early childhood' },
  'Same Day': { code: '99213', fee: 150.00, description: 'Office visit, established patient, low MDM' },
  'Procedure': { code: '99213', fee: 150.00, description: 'Office visit, established patient, low MDM' },
  'Shots Only': { code: '90471', fee: 25.00, description: 'Immunization admin, 1st injection' },
  'Video Visit': { code: '99213', fee: 150.00, description: 'Office visit, established patient, low MDM' },
};

// Claim Status Configuration
export const CLAIM_STATUS_CONFIG = {
  draft: { label: 'Draft', color: '#EAB308', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  ready: { label: 'Ready to Submit', color: '#3B82F6', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  submitted: { label: 'Submitted', color: '#8B5CF6', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
  accepted: { label: 'Accepted', color: '#06B6D4', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800' },
  rejected: { label: 'Rejected', color: '#F97316', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
  paid: { label: 'Paid', color: '#22C55E', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  denied: { label: 'Denied', color: '#EF4444', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  appealed: { label: 'Under Appeal', color: '#F59E0B', bgColor: 'bg-amber-100', textColor: 'text-amber-800' },
} as const;

export type ClaimStatusKey = keyof typeof CLAIM_STATUS_CONFIG;

// Place of Service Codes (CMS-1500)
export const PLACE_OF_SERVICE_CODES = {
  '11': 'Office',
  '12': 'Home',
  '19': 'Off Campus-Outpatient Hospital',
  '20': 'Urgent Care Facility',
  '21': 'Inpatient Hospital',
  '22': 'On Campus-Outpatient Hospital',
  '23': 'Emergency Room - Hospital',
  '02': 'Telehealth Provided Other than Patient Home',
  '10': 'Telehealth Provided in Patient Home',
} as const;

// Common CPT Modifiers
export const CPT_MODIFIERS = {
  '25': { code: '25', description: 'Significant, separately identifiable E/M service' },
  '59': { code: '59', description: 'Distinct procedural service' },
  'GT': { code: 'GT', description: 'Via interactive audio and video telecommunications' },
  '95': { code: '95', description: 'Synchronous telemedicine service' },
  '76': { code: '76', description: 'Repeat procedure by same physician' },
  '77': { code: '77', description: 'Repeat procedure by another physician' },
  'XE': { code: 'XE', description: 'Separate encounter' },
  'XS': { code: 'XS', description: 'Separate structure' },
  'XP': { code: 'XP', description: 'Separate practitioner' },
  'XU': { code: 'XU', description: 'Unusual non-overlapping service' },
} as const;

// Billing Status for Appointments (Calendar Display)
export const BILLING_STATUS = {
  unbilled: { label: 'Unbilled', dotColor: 'bg-yellow-500' },
  claim_created: { label: 'Claim Created', dotColor: 'bg-blue-500' },
  submitted: { label: 'Submitted', dotColor: 'bg-purple-500' },
  paid: { label: 'Paid', dotColor: 'bg-green-500' },
  denied: { label: 'Denied', dotColor: 'bg-red-500' },
} as const;

// Provider NPI (Placeholder - update with actual values)
export const PROVIDER_BILLING_INFO = {
  anna_lia: {
    npi: '1234567891', // Placeholder
    taxonomy: '207Q00000X', // Family Medicine
    billingName: 'Quinio, Anna-Lia MD',
  },
  cherie: {
    npi: '1234567892', // Placeholder
    taxonomy: '363A00000X', // Physician Assistant
    billingName: 'Ng, Cherie PA-C',
  },
} as const;

// Practice Info (Placeholder - update with actual values)
export const PRACTICE_INFO = {
  name: 'Quinio Family Medicine',
  npi: '1234567890', // Placeholder
  taxId: '123456789', // Placeholder
  address: '98-211 Pali Momi Street, Suite 700',
  city: 'Aiea',
  state: 'HI',
  zip: '96701',
  phone: '808-487-5437',
  placeOfService: '11', // Office
} as const;
