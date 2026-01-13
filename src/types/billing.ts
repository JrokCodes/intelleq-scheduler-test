// IntelleQ Medical Billing System - TypeScript Types
// Hawaii Payers: HMSA, UHA, Medicare (Noridian JE), HMAA

// ============================================
// INSURANCE CARRIERS
// ============================================

export interface InsuranceCarrier {
  id: string;
  name: string;
  payer_id: string;                       // EDI Payer ID
  payer_type: 'commercial' | 'medicare' | 'medicaid' | 'workers_comp';
  clearinghouse: 'availity' | 'direct' | 'hawaii_xchange';
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  eligibility_enabled: boolean;
  claims_enabled: boolean;
  is_active: boolean;
}

// Hawaii-specific payer constants
export const HAWAII_PAYERS = {
  HMSA: '34192',
  UHA: '99024',
  MEDICARE: '12502',
  HMAA: '99012',
  KAISER: '91051',
  ALOHACARE: '99914',
} as const;

// ============================================
// PATIENT INSURANCE
// ============================================

export interface PatientInsurance {
  id: string;
  patient_id: string;
  insurance_carrier_id: string;
  insurance_carrier?: InsuranceCarrier;   // Joined data
  subscriber_id: string;                  // Member ID on card
  group_number?: string;
  subscriber_first_name?: string;
  subscriber_last_name?: string;
  subscriber_dob?: string;
  relationship_to_subscriber: 'self' | 'spouse' | 'child' | 'other';
  coverage_type: 'primary' | 'secondary' | 'tertiary';
  effective_date?: string;
  termination_date?: string;

  // Eligibility info
  is_verified: boolean;
  last_verified_at?: string;
  copay_pcp?: number;
  copay_specialist?: number;
  deductible_amount?: number;
  deductible_met?: number;
  out_of_pocket_max?: number;
  out_of_pocket_met?: number;
  plan_type?: string;                     // 'HMO', 'PPO', 'POS'

  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// ELIGIBILITY
// ============================================

export interface EligibilityRequest {
  patient_id: string;
  patient_insurance_id: string;
  service_type_code?: string;             // '30' = general
  service_date?: string;
}

export interface EligibilityResponse {
  id: string;
  patient_id: string;
  patient_insurance_id: string;
  check_date: string;

  // Status
  is_eligible: boolean;
  coverage_active: boolean;
  coverage_begin_date?: string;
  coverage_end_date?: string;

  // Benefits
  copay?: number;
  deductible?: number;
  deductible_remaining?: number;
  out_of_pocket_max?: number;
  out_of_pocket_remaining?: number;
  coinsurance_percent?: number;
  plan_type?: string;

  // Raw response
  response_271?: string;

  // Error info
  error_code?: string;
  error_message?: string;

  created_at: string;
}

export interface EligibilityCheckResult {
  success: boolean;
  eligibility?: EligibilityResponse;
  error?: string;
}

// ============================================
// CPT CODES
// ============================================

export interface CPTCode {
  id: number;
  code: string;
  short_description: string;
  long_description?: string;
  category: string;
  default_fee: number;
  is_active: boolean;
}

// ============================================
// ICD-10 DIAGNOSIS CODES
// ============================================

export interface ICD10Code {
  id: number;
  code: string;
  description: string;
  category: string;
  is_billable: boolean;
  is_active: boolean;
}

// ============================================
// CLAIMS
// ============================================

export type ClaimStatus =
  | 'draft'           // Just created, not complete
  | 'ready'           // Ready to submit
  | 'submitted'       // Sent to clearinghouse
  | 'accepted'        // Accepted by payer
  | 'rejected'        // Rejected by payer (fixable)
  | 'paid'            // Payment received
  | 'denied'          // Denied by payer
  | 'appealed';       // Under appeal

export interface Claim {
  id: string;
  claim_number: string;                   // CLM-YYYYMMDD-XXXX

  // References
  appointment_id?: string;
  patient_id: string;
  patient_insurance_id?: string;
  provider_id: string;

  // Patient info (denormalized)
  patient_name: string;
  patient_dob: string;
  patient_address?: string;
  patient_phone?: string;

  // Insurance info (joined)
  insurance_carrier?: InsuranceCarrier;

  // Claim details
  service_date: string;
  place_of_service: string;               // '11' = office
  total_charge: number;

  // Status
  status: ClaimStatus;
  submitted_at?: string;
  accepted_at?: string;
  paid_at?: string;

  // EDI data
  clearinghouse_tracking_id?: string;
  payer_claim_number?: string;

  // Payment info
  allowed_amount?: number;
  paid_amount?: number;
  patient_responsibility?: number;
  adjustment_amount?: number;

  // Denial info
  denial_reason_code?: string;
  denial_reason?: string;
  appeal_deadline?: string;

  // Nested data
  lines: ClaimLine[];
  diagnoses: ClaimDiagnosis[];

  // Audit
  created_by?: string;
  submitted_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ClaimLine {
  id: string;
  claim_id: string;
  line_number: number;

  // Service details
  service_date?: string;
  cpt_code: string;
  cpt_description?: string;
  modifier1?: string;
  modifier2?: string;
  modifier3?: string;
  modifier4?: string;

  // Diagnosis pointers (1-12)
  diagnosis_pointer1?: number;
  diagnosis_pointer2?: number;
  diagnosis_pointer3?: number;
  diagnosis_pointer4?: number;

  // Charges
  units: number;
  charge_amount: number;

  // Payment (from 835)
  allowed_amount?: number;
  paid_amount?: number;
  adjustment_amount?: number;
  patient_responsibility?: number;

  created_at: string;
}

export interface ClaimDiagnosis {
  id: string;
  claim_id: string;
  sequence_number: number;                // 1-12
  icd10_code: string;
  diagnosis_description?: string;
  is_primary: boolean;

  created_at: string;
}

// ============================================
// CLAIM CREATION
// ============================================

export interface CreateClaimRequest {
  appointment_id?: string;
  patient_id: string;
  patient_insurance_id?: string;
  provider_id: string;
  service_date: string;
  lines: CreateClaimLineRequest[];
  diagnoses: CreateClaimDiagnosisRequest[];
}

export interface CreateClaimLineRequest {
  cpt_code: string;
  modifier1?: string;
  modifier2?: string;
  units?: number;
  charge_amount: number;
  diagnosis_pointers?: number[];          // Array of sequence numbers [1, 2]
}

export interface CreateClaimDiagnosisRequest {
  icd10_code: string;
  is_primary?: boolean;
}

export interface CreateClaimResponse {
  success: boolean;
  claim?: Claim;
  error?: string;
}

// ============================================
// CLAIM SUBMISSION
// ============================================

export interface SubmitClaimRequest {
  claim_id: string;
}

export interface SubmitClaimResponse {
  success: boolean;
  tracking_id?: string;
  error?: string;
}

// ============================================
// DENIALS
// ============================================

export interface ClaimDenial {
  id: string;
  claim_id: string;
  denial_date: string;
  carc_code?: string;                     // Claim Adjustment Reason Code
  rarc_code?: string;                     // Remittance Advice Remark Code
  denial_reason: string;
  denial_amount: number;

  follow_up_action?: 'appeal' | 'resubmit' | 'write_off' | 'patient_bill';
  follow_up_date?: string;
  appeal_letter?: string;
  appeal_submitted_at?: string;

  resolved: boolean;
  resolved_at?: string;
  resolution_notes?: string;

  created_at: string;
  updated_at: string;
}

// ============================================
// PAYMENTS
// ============================================

export interface Payment {
  id: string;
  claim_id: string;
  payment_date: string;
  payment_amount: number;
  payment_method: 'eft' | 'check' | 'credit_card' | 'cash';
  payment_source: 'insurance' | 'patient' | 'other';
  check_number?: string;
  eft_trace_number?: string;
  payer_reference?: string;
  posted_at?: string;
  posted_by?: string;
  notes?: string;

  // Line-level adjustments
  adjustments?: PaymentAdjustment[];

  created_at: string;
}

export interface PaymentAdjustment {
  id: string;
  payment_id: string;
  claim_line_id: string;
  adjustment_group_code: 'CO' | 'PR' | 'OA' | 'PI' | 'CR';  // Contractual, Patient Resp, Other, Payer, Correction
  adjustment_reason_code: string;         // CARC code
  adjustment_amount: number;

  created_at: string;
}

// ============================================
// PROVIDER & PRACTICE INFO
// ============================================

export interface ProviderBillingInfo {
  id: string;
  provider_id: string;                    // 'anna_lia', 'cherie'
  provider_name: string;
  npi: string;
  tax_id?: string;
  taxonomy_code?: string;
  license_number?: string;
  billing_name: string;
  is_active: boolean;
}

export interface PracticeInfo {
  id: string;
  practice_name: string;
  practice_npi?: string;
  tax_id: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  place_of_service_code: string;
}

// ============================================
// BILLING DASHBOARD
// ============================================

export interface BillingStats {
  total_claims: number;
  claims_draft: number;
  claims_ready: number;
  claims_submitted: number;
  claims_paid: number;
  claims_denied: number;

  total_charges: number;
  total_paid: number;
  total_outstanding: number;

  first_pass_rate: number;                // Percentage
  avg_days_to_payment: number;
}

export interface ClaimsFilter {
  status?: ClaimStatus | ClaimStatus[];
  payer_id?: string;
  provider_id?: string;
  date_from?: string;
  date_to?: string;
  patient_id?: string;
  search?: string;                        // Search claim number, patient name
}

export interface ClaimsSummary {
  claims: Claim[];
  total_count: number;
  stats: BillingStats;
}

// ============================================
// API RESPONSES
// ============================================

export interface BillingApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================
// CPT CODE MAPPINGS (Appointment Type -> CPT)
// ============================================

export interface AppointmentTypeCPTMapping {
  appointment_type: string;
  default_cpt_code: string;
  default_fee: number;
}

export const APPOINTMENT_TYPE_CPT_MAPPINGS: AppointmentTypeCPTMapping[] = [
  { appointment_type: 'Office Visit', default_cpt_code: '99213', default_fee: 150.00 },
  { appointment_type: 'Follow-up', default_cpt_code: '99213', default_fee: 150.00 },
  { appointment_type: 'New Patient', default_cpt_code: '99203', default_fee: 200.00 },
  { appointment_type: 'Complete Physical Exam', default_cpt_code: '99396', default_fee: 250.00 },
  { appointment_type: 'Medicare Wellness Visit', default_cpt_code: 'G0439', default_fee: 125.00 },
  { appointment_type: 'Well Child Check', default_cpt_code: '99392', default_fee: 200.00 },
  { appointment_type: 'Same Day', default_cpt_code: '99213', default_fee: 150.00 },
  { appointment_type: 'Procedure', default_cpt_code: '99213', default_fee: 150.00 },
  { appointment_type: 'Shots Only', default_cpt_code: '90471', default_fee: 25.00 },
  { appointment_type: 'Video Visit', default_cpt_code: '99213', default_fee: 150.00 },
];

// Helper to get CPT code for appointment type
export function getCPTForAppointmentType(appointmentType: string): AppointmentTypeCPTMapping | undefined {
  return APPOINTMENT_TYPE_CPT_MAPPINGS.find(
    m => m.appointment_type.toLowerCase() === appointmentType.toLowerCase()
  );
}

// ============================================
// BILLING STATUS COLORS
// ============================================

export const CLAIM_STATUS_COLORS: Record<ClaimStatus, string> = {
  draft: '#EAB308',       // Yellow
  ready: '#3B82F6',       // Blue
  submitted: '#8B5CF6',   // Purple
  accepted: '#06B6D4',    // Cyan
  rejected: '#F97316',    // Orange
  paid: '#22C55E',        // Green
  denied: '#EF4444',      // Red
  appealed: '#F59E0B',    // Amber
};

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  draft: 'Draft',
  ready: 'Ready to Submit',
  submitted: 'Submitted',
  accepted: 'Accepted',
  rejected: 'Rejected',
  paid: 'Paid',
  denied: 'Denied',
  appealed: 'Under Appeal',
};
