/**
 * Billing API functions for IntelleQ Medical Billing System
 *
 * Uses Python backend with JWT authentication
 * Backend URL: https://api.intelleqn8n.net
 * Endpoints: /quinio-test/billing/* (uses test tables)
 *
 * Supports:
 * - Eligibility verification (270/271)
 * - Claim creation and submission (837P)
 * - Claim status tracking (276/277)
 * - Payment processing (835)
 */

import { API_BASE_URL } from './constants';
import { getAuthHeaders, logout } from './auth';
import type {
  Claim,
  ClaimStatus,
  ClaimsFilter,
  ClaimsSummary,
  CPTCode,
  ICD10Code,
  InsuranceCarrier,
  PatientInsurance,
  EligibilityRequest,
  EligibilityResponse,
  EligibilityCheckResult,
  CreateClaimRequest,
  CreateClaimResponse,
  SubmitClaimRequest,
  SubmitClaimResponse,
  BillingStats,
  BillingApiResponse,
  PaginatedResponse,
  ProviderBillingInfo,
  PracticeInfo,
  Payment,
  ClaimDenial,
} from '../types/billing';

// ============================================
// API HELPERS
// ============================================

/**
 * Handle API response - check for auth errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    logout();
    window.location.reload();
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get headers for API requests (includes auth token)
 */
function getHeaders(includeContentType = false): Record<string, string> {
  const headers: Record<string, string> = {
    ...getAuthHeaders()
  };

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

const BILLING_BASE = `${API_BASE_URL}/quinio-test/billing`;

// ============================================
// INSURANCE CARRIERS
// ============================================

/**
 * Get all active insurance carriers
 */
export async function getInsuranceCarriers(): Promise<InsuranceCarrier[]> {
  const response = await fetch(`${BILLING_BASE}/carriers`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<InsuranceCarrier[]>>(response);
  return data.data || [];
}

/**
 * Get insurance carrier by ID
 */
export async function getInsuranceCarrier(carrierId: string): Promise<InsuranceCarrier | null> {
  const response = await fetch(`${BILLING_BASE}/carriers/${carrierId}`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<InsuranceCarrier>>(response);
  return data.data || null;
}

// ============================================
// PATIENT INSURANCE
// ============================================

/**
 * Get insurance records for a patient
 */
export async function getPatientInsurance(patientId: string): Promise<PatientInsurance[]> {
  const response = await fetch(`${BILLING_BASE}/patients/${patientId}/insurance`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<PatientInsurance[]>>(response);
  return data.data || [];
}

/**
 * Add insurance to a patient
 */
export async function addPatientInsurance(
  patientId: string,
  insurance: Omit<PatientInsurance, 'id' | 'patient_id' | 'created_at' | 'updated_at'>
): Promise<PatientInsurance> {
  const response = await fetch(`${BILLING_BASE}/patients/${patientId}/insurance`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(insurance),
  });

  const data = await handleResponse<BillingApiResponse<PatientInsurance>>(response);
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to add patient insurance');
  }
  return data.data;
}

/**
 * Update patient insurance
 */
export async function updatePatientInsurance(
  insuranceId: string,
  updates: Partial<PatientInsurance>
): Promise<PatientInsurance> {
  const response = await fetch(`${BILLING_BASE}/insurance/${insuranceId}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(updates),
  });

  const data = await handleResponse<BillingApiResponse<PatientInsurance>>(response);
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to update patient insurance');
  }
  return data.data;
}

// ============================================
// ELIGIBILITY VERIFICATION
// ============================================

/**
 * Check patient eligibility with insurance payer
 * Sends EDI 270 and receives 271 response
 */
export async function checkEligibility(
  request: EligibilityRequest
): Promise<EligibilityCheckResult> {
  const response = await fetch(`${BILLING_BASE}/eligibility/check`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(request),
  });

  const data = await handleResponse<EligibilityCheckResult>(response);
  return data;
}

/**
 * Get eligibility check history for a patient
 */
export async function getEligibilityHistory(
  patientId: string,
  limit = 10
): Promise<EligibilityResponse[]> {
  const params = new URLSearchParams({ limit: limit.toString() });
  const response = await fetch(`${BILLING_BASE}/eligibility/history/${patientId}?${params}`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<EligibilityResponse[]>>(response);
  return data.data || [];
}

/**
 * Batch check eligibility for multiple patients
 * Useful for checking next day's appointments
 */
export async function batchCheckEligibility(
  patientIds: string[]
): Promise<Map<string, EligibilityCheckResult>> {
  const response = await fetch(`${BILLING_BASE}/eligibility/batch`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ patient_ids: patientIds }),
  });

  const data = await handleResponse<BillingApiResponse<Record<string, EligibilityCheckResult>>>(response);
  return new Map(Object.entries(data.data || {}));
}

// ============================================
// CPT & ICD-10 CODES
// ============================================

/**
 * Search CPT codes
 */
export async function searchCPTCodes(
  query: string,
  category?: string
): Promise<CPTCode[]> {
  const params = new URLSearchParams({ query });
  if (category) params.append('category', category);

  const response = await fetch(`${BILLING_BASE}/cpt-codes?${params}`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<CPTCode[]>>(response);
  return data.data || [];
}

/**
 * Get all CPT codes (for dropdown)
 */
export async function getAllCPTCodes(): Promise<CPTCode[]> {
  const response = await fetch(`${BILLING_BASE}/cpt-codes/all`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<CPTCode[]>>(response);
  return data.data || [];
}

/**
 * Search ICD-10 codes
 */
export async function searchICD10Codes(
  query: string,
  category?: string
): Promise<ICD10Code[]> {
  const params = new URLSearchParams({ query });
  if (category) params.append('category', category);

  const response = await fetch(`${BILLING_BASE}/icd10-codes?${params}`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<ICD10Code[]>>(response);
  return data.data || [];
}

/**
 * Get common ICD-10 codes for primary care
 */
export async function getCommonICD10Codes(): Promise<ICD10Code[]> {
  const response = await fetch(`${BILLING_BASE}/icd10-codes/common`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<ICD10Code[]>>(response);
  return data.data || [];
}

// ============================================
// CLAIMS
// ============================================

/**
 * Get claims with filters
 */
export async function getClaims(filters?: ClaimsFilter): Promise<ClaimsSummary> {
  const params = new URLSearchParams();

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      filters.status.forEach(s => params.append('status', s));
    } else {
      params.append('status', filters.status);
    }
  }
  if (filters?.payer_id) params.append('payer_id', filters.payer_id);
  if (filters?.provider_id) params.append('provider_id', filters.provider_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.patient_id) params.append('patient_id', filters.patient_id);
  if (filters?.search) params.append('search', filters.search);

  const response = await fetch(`${BILLING_BASE}/claims?${params}`, {
    headers: getHeaders(),
  });

  return handleResponse<ClaimsSummary>(response);
}

/**
 * Get a single claim by ID
 */
export async function getClaim(claimId: string): Promise<Claim> {
  const response = await fetch(`${BILLING_BASE}/claims/${claimId}`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<Claim>>(response);
  if (!data.data) {
    throw new Error('Claim not found');
  }
  return data.data;
}

/**
 * Get claim by appointment ID
 */
export async function getClaimByAppointment(appointmentId: string): Promise<Claim | null> {
  const response = await fetch(`${BILLING_BASE}/claims/by-appointment/${appointmentId}`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<Claim | null>>(response);
  return data.data || null;
}

/**
 * Create a new claim
 */
export async function createClaim(request: CreateClaimRequest): Promise<CreateClaimResponse> {
  const response = await fetch(`${BILLING_BASE}/claims`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(request),
  });

  return handleResponse<CreateClaimResponse>(response);
}

/**
 * Update a claim (draft or ready status only)
 */
export async function updateClaim(
  claimId: string,
  updates: Partial<CreateClaimRequest>
): Promise<Claim> {
  const response = await fetch(`${BILLING_BASE}/claims/${claimId}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(updates),
  });

  const data = await handleResponse<BillingApiResponse<Claim>>(response);
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to update claim');
  }
  return data.data;
}

/**
 * Delete a claim (draft status only)
 */
export async function deleteClaim(claimId: string): Promise<void> {
  const response = await fetch(`${BILLING_BASE}/claims/${claimId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<void>>(response);
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete claim');
  }
}

/**
 * Submit a claim to clearinghouse
 * Generates EDI 837P and sends to Availity
 */
export async function submitClaim(claimId: string): Promise<SubmitClaimResponse> {
  const response = await fetch(`${BILLING_BASE}/claims/${claimId}/submit`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({}),
  });

  return handleResponse<SubmitClaimResponse>(response);
}

/**
 * Batch submit multiple claims
 */
export async function batchSubmitClaims(claimIds: string[]): Promise<{
  submitted: string[];
  failed: { id: string; error: string }[];
}> {
  const response = await fetch(`${BILLING_BASE}/claims/batch-submit`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ claim_ids: claimIds }),
  });

  return handleResponse(response);
}

/**
 * Check claim status with payer (276/277)
 */
export async function checkClaimStatus(claimId: string): Promise<{
  status: ClaimStatus;
  payer_status?: string;
  message?: string;
}> {
  const response = await fetch(`${BILLING_BASE}/claims/${claimId}/status`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({}),
  });

  return handleResponse(response);
}

/**
 * Void a submitted claim
 */
export async function voidClaim(claimId: string, reason: string): Promise<void> {
  const response = await fetch(`${BILLING_BASE}/claims/${claimId}/void`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ reason }),
  });

  const data = await handleResponse<BillingApiResponse<void>>(response);
  if (!data.success) {
    throw new Error(data.error || 'Failed to void claim');
  }
}

// ============================================
// CLAIM FROM APPOINTMENT (AUTO-GENERATION)
// ============================================

/**
 * Generate a draft claim from an appointment
 * Auto-maps appointment type to CPT code
 */
export async function createClaimFromAppointment(
  appointmentId: string,
  options?: {
    auto_submit?: boolean;
    additional_cpt_codes?: string[];
    diagnosis_codes?: string[];
  }
): Promise<CreateClaimResponse> {
  const response = await fetch(`${BILLING_BASE}/claims/from-appointment/${appointmentId}`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(options || {}),
  });

  return handleResponse<CreateClaimResponse>(response);
}

// ============================================
// DENIALS
// ============================================

/**
 * Get denials for a claim
 */
export async function getClaimDenials(claimId: string): Promise<ClaimDenial[]> {
  const response = await fetch(`${BILLING_BASE}/claims/${claimId}/denials`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<ClaimDenial[]>>(response);
  return data.data || [];
}

/**
 * Create denial record
 */
export async function createDenial(
  claimId: string,
  denial: Omit<ClaimDenial, 'id' | 'claim_id' | 'created_at' | 'updated_at'>
): Promise<ClaimDenial> {
  const response = await fetch(`${BILLING_BASE}/claims/${claimId}/denials`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(denial),
  });

  const data = await handleResponse<BillingApiResponse<ClaimDenial>>(response);
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to create denial record');
  }
  return data.data;
}

/**
 * Update denial (e.g., mark resolved)
 */
export async function updateDenial(
  denialId: string,
  updates: Partial<ClaimDenial>
): Promise<ClaimDenial> {
  const response = await fetch(`${BILLING_BASE}/denials/${denialId}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(updates),
  });

  const data = await handleResponse<BillingApiResponse<ClaimDenial>>(response);
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to update denial');
  }
  return data.data;
}

/**
 * Get all unresolved denials
 */
export async function getUnresolvedDenials(): Promise<ClaimDenial[]> {
  const response = await fetch(`${BILLING_BASE}/denials/unresolved`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<ClaimDenial[]>>(response);
  return data.data || [];
}

// ============================================
// PAYMENTS
// ============================================

/**
 * Get payments for a claim
 */
export async function getClaimPayments(claimId: string): Promise<Payment[]> {
  const response = await fetch(`${BILLING_BASE}/claims/${claimId}/payments`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<Payment[]>>(response);
  return data.data || [];
}

/**
 * Post a payment to a claim
 */
export async function postPayment(
  claimId: string,
  payment: Omit<Payment, 'id' | 'claim_id' | 'created_at'>
): Promise<Payment> {
  const response = await fetch(`${BILLING_BASE}/claims/${claimId}/payments`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payment),
  });

  const data = await handleResponse<BillingApiResponse<Payment>>(response);
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to post payment');
  }
  return data.data;
}

// ============================================
// BILLING STATS & REPORTS
// ============================================

/**
 * Get billing dashboard statistics
 */
export async function getBillingStats(
  dateFrom?: string,
  dateTo?: string
): Promise<BillingStats> {
  const params = new URLSearchParams();
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo) params.append('date_to', dateTo);

  const response = await fetch(`${BILLING_BASE}/stats?${params}`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<BillingStats>>(response);
  return data.data || {
    total_claims: 0,
    claims_draft: 0,
    claims_ready: 0,
    claims_submitted: 0,
    claims_paid: 0,
    claims_denied: 0,
    total_charges: 0,
    total_paid: 0,
    total_outstanding: 0,
    first_pass_rate: 0,
    avg_days_to_payment: 0,
  };
}

/**
 * Get claims aging report
 */
export async function getAgingReport(): Promise<{
  current: number;
  days_30: number;
  days_60: number;
  days_90: number;
  days_120_plus: number;
  claims: Claim[];
}> {
  const response = await fetch(`${BILLING_BASE}/reports/aging`, {
    headers: getHeaders(),
  });

  return handleResponse(response);
}

/**
 * Get payer performance report
 */
export async function getPayerPerformance(
  dateFrom?: string,
  dateTo?: string
): Promise<{
  payer_id: string;
  payer_name: string;
  claims_submitted: number;
  claims_paid: number;
  claims_denied: number;
  total_charged: number;
  total_paid: number;
  avg_days_to_payment: number;
  first_pass_rate: number;
}[]> {
  const params = new URLSearchParams();
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo) params.append('date_to', dateTo);

  const response = await fetch(`${BILLING_BASE}/reports/payer-performance?${params}`, {
    headers: getHeaders(),
  });

  return handleResponse(response);
}

// ============================================
// PROVIDER & PRACTICE INFO
// ============================================

/**
 * Get provider billing info
 */
export async function getProviderBillingInfo(
  providerId: string
): Promise<ProviderBillingInfo | null> {
  const response = await fetch(`${BILLING_BASE}/providers/${providerId}`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<ProviderBillingInfo>>(response);
  return data.data || null;
}

/**
 * Get all providers
 */
export async function getAllProviders(): Promise<ProviderBillingInfo[]> {
  const response = await fetch(`${BILLING_BASE}/providers`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<ProviderBillingInfo[]>>(response);
  return data.data || [];
}

/**
 * Get practice info
 */
export async function getPracticeInfo(): Promise<PracticeInfo | null> {
  const response = await fetch(`${BILLING_BASE}/practice`, {
    headers: getHeaders(),
  });

  const data = await handleResponse<BillingApiResponse<PracticeInfo>>(response);
  return data.data || null;
}
