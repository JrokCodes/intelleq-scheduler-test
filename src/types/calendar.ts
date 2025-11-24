export interface Appointment {
  id: string;
  provider: 'anna_lia' | 'cherie';
  patient_name: string;
  patient_dob: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  appointment_type: string;
  reason: string;
  booked_by?: string;
  booked_by_ai?: boolean;
  color: string;
}

export interface EventBlock {
  id: string;
  provider: 'anna_lia' | 'cherie';
  event_name: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface Holiday {
  name: string;
  date: string;
}

export interface ApiResponse {
  success: boolean;
  appointments: Appointment[];
  event_blocks: EventBlock[];
  holidays: Holiday[];
}
