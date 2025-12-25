/**
 * API functions for Quinio Staff Calendar - TEST ENVIRONMENT
 *
 * Uses Python backend with JWT authentication
 * Backend URL: https://api.intelleqn8n.net
 * Endpoints: /quinio-test/* (uses test tables)
 */

import { API_BASE_URL } from './constants';
import { getAuthHeaders, logout } from './auth';

/**
 * Handle API response - check for auth errors
 */
async function handleResponse(response: Response) {
  if (response.status === 401) {
    // Token expired or invalid - logout and redirect
    logout();
    window.location.reload();
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${response.status}`);
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

export async function fetchAppointments(startDate: string, endDate: string) {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });

  const response = await fetch(`${API_BASE_URL}/quinio-test/appointments?${params}`, {
    headers: getHeaders(),
  });

  return handleResponse(response);
}

export async function searchPatients(query: string): Promise<any[]> {
  const params = new URLSearchParams({ query });

  const response = await fetch(`${API_BASE_URL}/quinio-test/patients?${params}`, {
    headers: getHeaders(),
  });

  const data = await handleResponse(response);
  return data.patients || [];
}

export async function addPatient(patientData: {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone?: string;
  email?: string;
  gender?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  primary_insurance: string;
  primary_subscriber_id?: string;
  secondary_insurance?: string;
  secondary_subscriber_id?: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/quinio-test/patients`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(patientData),
  });

  const data = await handleResponse(response);

  if (data.success === false) {
    throw new Error(data.error || 'Failed to add patient');
  }

  return data.patient;
}

export async function deleteAppointment(appointmentId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/quinio-test/appointments/${appointmentId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  return handleResponse(response);
}

export async function rescheduleAppointment(
  appointmentId: string,
  newStartTime: string,
  newProvider?: string
): Promise<any> {
  const body: Record<string, unknown> = { start_time: newStartTime };
  if (newProvider) body.provider = newProvider;

  const response = await fetch(`${API_BASE_URL}/quinio-test/appointments/${appointmentId}`, {
    method: 'PATCH',
    headers: getHeaders(true),
    body: JSON.stringify(body),
  });

  const data = await handleResponse(response);
  if (!data.success) {
    throw new Error(data.error || 'Failed to reschedule appointment');
  }
  return data;
}

export async function createAppointment(appointmentData: {
  provider: string;
  patient_id: number;
  patient_name: string;
  patient_dob: string;
  patient_phone: string;
  start_time: string;
  duration_minutes: number;
  appointment_type: string;
  reason: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/quinio-test/appointments`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(appointmentData),
  });

  const data = await handleResponse(response);

  if (!data.success) {
    throw new Error(data.error || 'Failed to create appointment');
  }

  return data.appointment;
}

export async function createEventBlock(eventBlockData: {
  provider: string;
  event_name: string;
  start_time: string;
  end_time: string;
  notes?: string;
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/quinio-test/event-blocks`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(eventBlockData),
  });

  const data = await handleResponse(response);

  if (!data.success) {
    throw new Error(data.error || 'Failed to create event block');
  }

  return data.event_block;
}

export async function deleteEventBlock(eventBlockId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/quinio-test/event-blocks/${eventBlockId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  return handleResponse(response);
}
