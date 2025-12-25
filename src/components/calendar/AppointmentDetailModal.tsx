import { useState, useEffect } from 'react';
import { format, parse, isValid, isSameDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Appointment } from '@/types/calendar';
import { deleteAppointment, updateAppointment } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { PROVIDERS, APPOINTMENT_TYPES, APPOINTMENT_TYPE_DURATIONS, DURATIONS, HAWAII_TZ } from '@/lib/constants';
import { PatientSearch } from '@/components/booking/PatientSearch';
import { AddPatientModal } from '@/components/booking/AddPatientModal';
import { Pencil, AlertCircle } from 'lucide-react';

interface Patient {
  patient_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone?: string;
}

interface AppointmentDetailModalProps {
  open: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  appointments: Appointment[];
  onDeleteSuccess: () => void;
  onUpdateSuccess: () => void;
}

export const AppointmentDetailModal = ({
  open,
  onClose,
  appointment,
  appointments,
  onDeleteSuccess,
  onUpdateSuccess,
}: AppointmentDetailModalProps) => {
  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);

  // Form state
  const [editedPatient, setEditedPatient] = useState<Patient | null>(null);
  const [editedDate, setEditedDate] = useState('');
  const [editedTime, setEditedTime] = useState('');
  const [editedProvider, setEditedProvider] = useState('');
  const [editedAppointmentType, setEditedAppointmentType] = useState('');
  const [editedDuration, setEditedDuration] = useState(30);
  const [editedReason, setEditedReason] = useState('');

  // Validation state
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [conflictError, setConflictError] = useState('');

  // Reset form when modal opens with new appointment
  useEffect(() => {
    if (appointment && open) {
      const startTime = toZonedTime(new Date(appointment.start_time), HAWAII_TZ);

      // Parse patient from appointment
      const nameParts = appointment.patient_name.split(', ');
      setEditedPatient({
        patient_id: 0, // Will be populated if patient changes
        first_name: nameParts[1] || '',
        last_name: nameParts[0] || '',
        date_of_birth: appointment.patient_dob,
      });

      setEditedDate(format(startTime, 'MM/dd/yyyy'));
      setEditedTime(format(startTime, 'h:mm a'));
      setEditedProvider(appointment.provider);
      setEditedAppointmentType(appointment.appointment_type);
      setEditedDuration(appointment.duration_minutes);
      setEditedReason(appointment.reason || '');

      // Clear validation errors
      setDateError('');
      setTimeError('');
      setConflictError('');
      setIsEditMode(false);
    }
  }, [appointment, open]);

  if (!appointment) return null;

  // Parse times in Hawaii timezone for view mode
  const startTime = toZonedTime(new Date(appointment.start_time), HAWAII_TZ);
  const endTime = toZonedTime(new Date(appointment.end_time), HAWAII_TZ);

  // Get provider display name
  const provider = PROVIDERS.find(p => p.id === appointment.provider);
  const providerName = provider?.fullName || appointment.provider;

  // Determine booked by display text
  const getBookedByDisplay = () => {
    const bookedBy = appointment.booked_by?.toLowerCase();
    if (bookedBy === 'ai' || bookedBy === 'leilani' || bookedBy === 'retell') {
      return (
        <span className="flex items-center gap-1">
          <span>AI Assistant</span>
          <span>🤖</span>
        </span>
      );
    }
    if (bookedBy === 'staff' || !appointment.booked_by) {
      return 'Staff';
    }
    return appointment.booked_by;
  };

  // Date validation and formatting
  const handleDateChange = (value: string) => {
    // Auto-format as user types
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    if (cleaned.length >= 5) cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5, 9);
    setEditedDate(cleaned);
    setDateError('');
    setConflictError('');
  };

  const validateDate = (): { valid: boolean; date?: Date } => {
    const match = editedDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) {
      setDateError('Use format MM/DD/YYYY');
      return { valid: false };
    }

    const [, month, day, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    if (!isValid(date) || date.getMonth() !== parseInt(month) - 1) {
      setDateError('Invalid date');
      return { valid: false };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      setDateError('Cannot schedule in the past');
      return { valid: false };
    }

    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      setDateError('Weekends not available');
      return { valid: false };
    }

    return { valid: true, date };
  };

  // Time validation
  const handleTimeChange = (value: string) => {
    setEditedTime(value.toUpperCase());
    setTimeError('');
    setConflictError('');
  };

  const validateTime = (): { valid: boolean; hours?: number; minutes?: number } => {
    const match = editedTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) {
      setTimeError('Use format H:MM AM/PM');
      return { valid: false };
    }

    let [, hoursStr, minutesStr, ampm] = match;
    let hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);

    if (hours < 1 || hours > 12) {
      setTimeError('Hour must be 1-12');
      return { valid: false };
    }

    if (![0, 15, 30, 45].includes(minutes)) {
      setTimeError('Minutes must be 00, 15, 30, or 45');
      return { valid: false };
    }

    // Convert to 24-hour
    if (ampm.toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;

    if (hours < 7 || hours >= 17) {
      setTimeError('Outside business hours (7 AM - 5 PM)');
      return { valid: false };
    }

    return { valid: true, hours, minutes };
  };

  // Conflict detection
  const checkConflicts = (date: Date, hours: number, minutes: number): boolean => {
    const newStartMinutes = hours * 60 + minutes;
    const newEndMinutes = newStartMinutes + editedDuration;

    for (const apt of appointments) {
      // Skip current appointment
      if (apt.id === appointment.id) continue;
      // Skip different providers
      if (apt.provider !== editedProvider) continue;

      // Check same date
      const aptStart = toZonedTime(new Date(apt.start_time), HAWAII_TZ);
      if (!isSameDay(aptStart, date)) continue;

      const aptEnd = toZonedTime(new Date(apt.end_time), HAWAII_TZ);
      const aptStartMinutes = aptStart.getHours() * 60 + aptStart.getMinutes();
      const aptEndMinutes = aptEnd.getHours() * 60 + aptEnd.getMinutes();

      // Check overlap
      if (newStartMinutes < aptEndMinutes && newEndMinutes > aptStartMinutes) {
        setConflictError(`Time conflicts with appointment for ${apt.patient_name}`);
        return true;
      }
    }

    return false;
  };

  // Handle appointment type change (auto-fill duration)
  const handleAppointmentTypeChange = (value: string) => {
    setEditedAppointmentType(value);
    if (APPOINTMENT_TYPE_DURATIONS[value]) {
      setEditedDuration(APPOINTMENT_TYPE_DURATIONS[value]);
    }
  };

  // Handle save
  const handleSave = async () => {
    // Clear previous errors
    setDateError('');
    setTimeError('');
    setConflictError('');

    // Validate patient
    if (!editedPatient) {
      toast({ title: 'Error', description: 'Please select a patient', variant: 'destructive' });
      return;
    }

    // Validate date
    const dateResult = validateDate();
    if (!dateResult.valid || !dateResult.date) return;

    // Validate time
    const timeResult = validateTime();
    if (!timeResult.valid || timeResult.hours === undefined) return;

    // Check conflicts
    if (checkConflicts(dateResult.date, timeResult.hours, timeResult.minutes)) return;

    // Build start_time ISO string
    const newDateTime = new Date(dateResult.date);
    newDateTime.setHours(timeResult.hours, timeResult.minutes, 0, 0);
    const startTimeISO = format(newDateTime, "yyyy-MM-dd'T'HH:mm:ss'-10:00'");

    setIsSaving(true);
    try {
      await updateAppointment(appointment.id, {
        patient_id: editedPatient.patient_id || undefined,
        patient_name: `${editedPatient.last_name}, ${editedPatient.first_name}`,
        patient_dob: editedPatient.date_of_birth,
        patient_phone: editedPatient.phone || '',
        start_time: startTimeISO,
        duration_minutes: editedDuration,
        appointment_type: editedAppointmentType,
        reason: editedReason,
        provider: editedProvider,
      });

      toast({
        title: 'Appointment Updated',
        description: 'Changes saved successfully',
      });

      setIsEditMode(false);
      onUpdateSuccess();
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Could not update appointment',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reset form to original values
    const st = toZonedTime(new Date(appointment.start_time), HAWAII_TZ);
    const nameParts = appointment.patient_name.split(', ');
    setEditedPatient({
      patient_id: 0,
      first_name: nameParts[1] || '',
      last_name: nameParts[0] || '',
      date_of_birth: appointment.patient_dob,
    });
    setEditedDate(format(st, 'MM/dd/yyyy'));
    setEditedTime(format(st, 'h:mm a'));
    setEditedProvider(appointment.provider);
    setEditedAppointmentType(appointment.appointment_type);
    setEditedDuration(appointment.duration_minutes);
    setEditedReason(appointment.reason || '');
    setDateError('');
    setTimeError('');
    setConflictError('');
    setIsEditMode(false);
  };

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAppointment(appointment.id);
      toast({
        title: 'Appointment Cancelled',
        description: `Appointment for ${appointment.patient_name} has been cancelled.`,
      });
      setShowDeleteConfirm(false);
      onClose();
      onDeleteSuccess();
    } catch (error: any) {
      toast({
        title: 'Failed to Cancel',
        description: error.message || 'Could not cancel the appointment.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle patient added from modal
  const handlePatientAdded = (patient: any) => {
    setEditedPatient({
      patient_id: patient.patient_id || patient.id,
      first_name: patient.first_name,
      last_name: patient.last_name,
      date_of_birth: patient.date_of_birth,
      phone: patient.phone,
    });
    setShowAddPatient(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(newOpen) => {
        if (!newOpen && isEditMode) {
          handleCancelEdit();
        }
        onClose();
      }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEditMode ? 'Edit Appointment' : appointment.patient_name}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Modify appointment details' : 'Appointment Details'}
            </DialogDescription>
          </DialogHeader>

          {!isEditMode ? (
            // VIEW MODE
            <>
              <div className="space-y-4 py-4">
                {/* Date & Time */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl">📅</div>
                  <div>
                    <div className="font-medium">
                      {format(startTime, 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')} ({appointment.duration_minutes} min)
                    </div>
                  </div>
                </div>

                {/* Patient Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Date of Birth</div>
                    <div className="font-medium">{appointment.patient_dob}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Provider</div>
                    <div className="font-medium">{providerName}</div>
                  </div>
                </div>

                {/* Appointment Type */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: appointment.color }}
                  />
                  <div>
                    <div className="font-medium">{appointment.appointment_type}</div>
                    {appointment.reason && (
                      <div className="text-sm text-muted-foreground">{appointment.reason}</div>
                    )}
                  </div>
                </div>

                {/* Booked By */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Booked by:</span>
                  <span className="font-medium">{getBookedByDisplay()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button variant="secondary" onClick={() => setIsEditMode(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                  Cancel Appointment
                </Button>
              </div>
            </>
          ) : (
            // EDIT MODE
            <div className="space-y-4 py-4">
              {/* Patient */}
              <div className="space-y-2">
                <Label>Patient</Label>
                <PatientSearch
                  onSelectPatient={(p) => setEditedPatient({
                    patient_id: p.patient_id,
                    first_name: p.first_name,
                    last_name: p.last_name,
                    date_of_birth: p.date_of_birth,
                    phone: p.phone,
                  })}
                  onAddNewPatient={() => setShowAddPatient(true)}
                  selectedPatient={editedPatient}
                  onClearSelection={() => setEditedPatient(null)}
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    value={editedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    placeholder="MM/DD/YYYY"
                    maxLength={10}
                    className={dateError ? 'border-destructive' : ''}
                  />
                  {dateError && <p className="text-xs text-destructive">{dateError}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    value={editedTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    placeholder="9:30 AM"
                    className={timeError ? 'border-destructive' : ''}
                  />
                  {timeError && <p className="text-xs text-destructive">{timeError}</p>}
                </div>
              </div>

              {/* Provider */}
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={editedProvider} onValueChange={setEditedProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Appointment Type */}
              <div className="space-y-2">
                <Label>Appointment Type</Label>
                <Select value={editedAppointmentType} onValueChange={handleAppointmentTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={editedDuration.toString()} onValueChange={(v) => setEditedDuration(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value.toString()}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label>Reason</Label>
                <Input
                  value={editedReason}
                  onChange={(e) => setEditedReason(e.target.value)}
                  placeholder="Reason for visit (optional)"
                />
              </div>

              {/* Conflict Error */}
              {conflictError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{conflictError}</AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the appointment for{' '}
              <strong>{appointment.patient_name}</strong> on{' '}
              <strong>{format(startTime, 'MMM d, yyyy')}</strong> at{' '}
              <strong>{format(startTime, 'h:mm a')}</strong>?
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Cancelling...' : 'Yes, Cancel Appointment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Patient Modal */}
      <AddPatientModal
        open={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        onPatientAdded={handlePatientAdded}
      />
    </>
  );
};
