import { ApiResponse } from '@/types/calendar';

const API_BASE_URL = 'https://intelleqn8n.net/webhook';
const API_KEY = 'LovableStaffCalendar2025';

export async function fetchAppointments(
  startDate: string,
  endDate: string
): Promise<ApiResponse> {
  try {
    const url = `${API_BASE_URL}/lovable-appointments?start_date=${startDate}&end_date=${endDate}`;
    
    console.log('🔍 [API] Fetching appointments:', {
      url,
      startDate,
      endDate,
      timestamp: new Date().toISOString()
    });
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 [API] Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log('📄 [API] Raw response text:', responseText);
    
    let data: ApiResponse;
    try {
      data = JSON.parse(responseText);
      console.log('✅ [API] Parsed data:', {
        success: data.success,
        appointmentsCount: data.appointments?.length || 0,
        eventBlocksCount: data.event_blocks?.length || 0,
        holidaysCount: data.holidays?.length || 0
      });
    } catch (parseError) {
      console.error('❌ [API] JSON parse error:', parseError);
      console.error('Response text was:', responseText);
      throw new Error('Invalid JSON response from server');
    }
    
    return data;
  } catch (error) {
    console.error('❌ [API] Error fetching appointments:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

export async function searchPatients(query: string): Promise<any[]> {
  try {
    const url = `${API_BASE_URL}/lovable-search-patients?query=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.patients || [];
  } catch (error) {
    console.error('Error searching patients:', error);
    throw error;
  }
}

export async function addPatient(patientData: {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone?: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/lovable-add-patient`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      throw new Error(`Failed to add patient: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.patient;
  } catch (error) {
    console.error('Error adding patient:', error);
    throw error;
  }
}

export async function deleteAppointment(appointmentId: string): Promise<any> {
  try {
    const url = `${API_BASE_URL}/lovable-delete-appointment?id=${appointmentId}`;

    console.log('🗑️ [API] Deleting appointment:', { appointmentId, url });

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    console.log('🗑️ [API] Delete response:', { status: response.status, data });

    if (!response.ok || data.error) {
      throw new Error(data.error || 'Failed to delete appointment');
    }

    return data;
  } catch (error) {
    console.error('❌ [API] Error deleting appointment:', error);
    throw error;
  }
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
  try {
    const url = `${API_BASE_URL}/lovable-create-appointment`;

    console.log('📝 [API] Creating appointment:', {
      url,
      appointmentData,
      timestamp: new Date().toISOString()
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    console.log('📡 [API] Create appointment response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    // Get raw response text first to handle empty responses
    const responseText = await response.text();
    console.log('📄 [API] Create appointment raw response:', responseText || '(empty response)');

    // Check for empty response
    if (!responseText || responseText.trim() === '') {
      throw new Error(`API returned empty response (status: ${response.status}). The n8n workflow may not be configured correctly.`);
    }

    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ [API] Create appointment parsed data:', data);
    } catch (parseError) {
      console.error('❌ [API] JSON parse error:', parseError);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
    }

    if (!response.ok || !data.success) {
      throw new Error(data.error || `Failed to create appointment (status: ${response.status})`);
    }

    return data.appointment;
  } catch (error) {
    console.error('❌ [API] Error creating appointment:', error);
    throw error;
  }
}
