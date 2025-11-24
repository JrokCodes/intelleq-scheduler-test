import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PatientSearch } from './PatientSearch';
import { AddPatientModal } from './AddPatientModal';
import { createAppointment } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const APPOINTMENT_TYPES = [
  'Complete Physical Exam',
  'Follow-up',
  'Medicare Wellness Visit',
  'New Patient',
  'Office Visit',
  'Procedure',
  'Same Day',
  'Shots Only',
  'Well Child Check',
];

// Default durations for each appointment type (in minutes)
const APPOINTMENT_TYPE_DURATIONS: Record<string, number> = {
  'Complete Physical Exam': 30,
  'Follow-up': 15,
  'Medicare Wellness Visit': 30,
  'New Patient': 30,
  'Office Visit': 15,
  'Procedure': 30,
  'Same Day': 15,
  'Shots Only': 15,
  'Well Child Check': 30,
};

const DURATIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '60 minutes', value: 60 },
];

const HAWAII_TZ = 'Pacific/Honolulu';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  slotInfo: {
    provider: string;
    providerName: string;
    date: Date;
    time: string;
  } | null;
  onBookingSuccess: () => void;
}

export const BookingModal = ({ open, onClose, slotInfo, onBookingSuccess }: BookingModalProps) => {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [appointmentType, setAppointmentType] = useState('');
  const [duration, setDuration] = useState(30);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);

  // Auto-open Add Patient modal when "New Patient" type is selected and no patient chosen
  useEffect(() => {
    if (appointmentType === 'New Patient' && !selectedPatient) {
      setShowAddPatient(true);
    }
  }, [appointmentType, selectedPatient]);

  // Auto-fill duration when appointment type is selected
  useEffect(() => {
    if (appointmentType && APPOINTMENT_TYPE_DURATIONS[appointmentType]) {
      setDuration(APPOINTMENT_TYPE_DURATIONS[appointmentType]);
    }
  }, [appointmentType]);

  // Check if form has any data entered
  const hasFormData = () => {
    return selectedPatient !== null || appointmentType !== '' || reason.trim() !== '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient || !appointmentType || !slotInfo) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Parse the time from slotInfo (format: "8:00 AM" or "1:30 PM")
      const timeParts = slotInfo.time.match(/(\d+):(\d+)\s*(AM|PM)/i);

      if (!timeParts) {
        throw new Error(`Invalid time format: "${slotInfo.time}"`);
      }

      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const ampm = timeParts[3].toUpperCase();

      // Convert to 24-hour format
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      const slotDateTime = new Date(slotInfo.date);
      slotDateTime.setHours(hours, minutes, 0, 0);

      // Convert to ISO string with Hawaii timezone offset
      const startTimeISO = format(slotDateTime, "yyyy-MM-dd'T'HH:mm:ss'-10:00'");

      await createAppointment({
        provider: slotInfo.provider,
        patient_id: selectedPatient.patient_id,
        patient_name: `${selectedPatient.last_name}, ${selectedPatient.first_name}`,
        patient_dob: selectedPatient.date_of_birth,
        patient_phone: selectedPatient.phone || '',
        start_time: startTimeISO,
        duration_minutes: duration,
        appointment_type: appointmentType,
        reason: reason.trim() || '',
      });

      toast({
        title: 'Success',
        description: 'Appointment booked successfully',
      });

      // Clear form state before closing (no confirmation needed after success)
      setSelectedPatient(null);
      setAppointmentType('');
      setDuration(30);
      setReason('');

      onClose(); // Close without going through handleClose
      onBookingSuccess();
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to book appointment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Check if user has entered data
    if (hasFormData()) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmed) {
        return; // Don't close if user cancels
      }
    }

    // Clear form and close
    setSelectedPatient(null);
    setAppointmentType('');
    setDuration(30);
    setReason('');
    onClose();
  };

  // Handle dialog open change (ESC key, click outside)
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // User trying to close dialog
      handleClose();
    }
  };

  const handlePatientAdded = (patient: any) => {
    setSelectedPatient(patient);
    setShowAddPatient(false);
  };

  const isFormValid = selectedPatient && appointmentType;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => {
          // Prevent closing when clicking outside if form has data
          if (hasFormData()) {
            e.preventDefault();
          }
        }}>
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            {slotInfo && (
              <p className="text-sm text-muted-foreground">
                {slotInfo.providerName} - {format(slotInfo.date, 'MMM dd, yyyy')} at {slotInfo.time}
              </p>
            )}
          </DialogHeader>
          <form onSubmit={handleSubmit} onKeyDown={(e) => {
            // Prevent Enter key from submitting form unless user is on submit button
            if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
              e.preventDefault();
            }
          }}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Patient *</Label>
                <PatientSearch
                  onSelectPatient={setSelectedPatient}
                  onAddNewPatient={() => setShowAddPatient(true)}
                  selectedPatient={selectedPatient}
                  onClearSelection={() => setSelectedPatient(null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointmentType">Appointment Type *</Label>
                <Select value={appointmentType} onValueChange={setAppointmentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Select value={duration.toString()} onValueChange={(val) => setDuration(Number(val))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value.toString()}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for visit (optional)"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => {
                // Cancel button - confirm if form has data, otherwise just close
                if (hasFormData()) {
                  const confirmed = window.confirm(
                    'Are you sure you want to cancel? Your entered information will be lost.'
                  );
                  if (confirmed) {
                    setSelectedPatient(null);
                    setAppointmentType('');
                    setDuration(30);
                    setReason('');
                    onClose();
                  }
                } else {
                  onClose();
                }
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isFormValid || isSubmitting}>
                {isSubmitting ? 'Booking...' : 'Book Appointment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AddPatientModal
        open={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        onPatientAdded={handlePatientAdded}
      />
    </>
  );
};
