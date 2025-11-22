import { ApiResponse } from '@/types/calendar';

const API_BASE_URL = 'https://intelleqn8n.net/webhook';
const API_KEY = 'LovableStaffCalendar2025';

export async function fetchAppointments(
  startDate: string,
  endDate: string
): Promise<ApiResponse> {
  try {
    const url = `${API_BASE_URL}/lovable-appointments?start_date=${startDate}&end_date=${endDate}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
}
