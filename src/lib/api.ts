import { ApiResponse } from '@/types/calendar';

const API_BASE_URL = 'https://intelleqn8n.net/webhook';
const API_KEY = 'IntelleQ_Lvbl_2025_xK9mPqR3vT7wZ2nL';

export async function fetchAppointments(startDate: string, endDate: string) {
  const url = `${API_BASE_URL}/lovable-appointments?start_date=${startDate}&end_date=${endDate}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const responseText = await response.text();
  
  try {
    const data = JSON.parse(responseText);
    return data;
  } catch (parseError) {
    console.error('Failed to parse API response:', parseError);
    throw new Error('Failed to parse API response as JSON');
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
  email?: string;
  insurance: string;
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

    // Check if the API returned an error (e.g., duplicate patient)
    if (data.success === false) {
      throw new Error(data.error || 'Failed to add patient');
    }

    return data.patient;
  } catch (error) {
    console.error('Error adding patient:', error);
    throw error;
  }
}

export async function deleteAppointment(appointmentId: string): Promise<any> {
  const url = `${API_BASE_URL}/lovable-delete-appointment?id=${appointmentId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || 'Failed to delete appointment');
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
  const url = `${API_BASE_URL}/lovable-create-appointment`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointmentData),
  });

  const responseText = await response.text();

  if (!responseText || responseText.trim() === '') {
    throw new Error(`API returned empty response (status: ${response.status}). The n8n workflow may not be configured correctly.`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
  }

  if (!response.ok || !data.success) {
    throw new Error(data.error || `Failed to create appointment (status: ${response.status})`);
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
  const url = `${API_BASE_URL}/lovable-create-event-block`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventBlockData),
  });

  const responseText = await response.text();

  if (!responseText || responseText.trim() === '') {
    throw new Error(`API returned empty response (status: ${response.status}). The n8n workflow may not be configured correctly.`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
  }

  if (!response.ok || !data.success) {
    throw new Error(data.error || `Failed to create event block (status: ${response.status})`);
  }

  return data.event_block;
}

export async function deleteEventBlock(eventBlockId: string): Promise<any> {
  const url = `${API_BASE_URL}/lovable-delete-event-block?id=${eventBlockId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
  });

  const responseText = await response.text();

  if (!responseText || responseText.trim() === '') {
    throw new Error(`API returned empty response (status: ${response.status}).`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
  }

  if (!response.ok || data.error) {
    throw new Error(data.error || 'Failed to delete event block');
  }

  return data;
}
