import { useState } from 'react';
import { format } from 'date-fns';
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
import { Appointment } from '@/types/calendar';
import { deleteAppointment } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { PROVIDERS } from '@/lib/constants';

const HAWAII_TZ = 'Pacific/Honolulu';

interface AppointmentDetailModalProps {
  open: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onDeleteSuccess: () => void;
}

export const AppointmentDetailModal = ({
  open,
  onClose,
  appointment,
  onDeleteSuccess,
}: AppointmentDetailModalProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!appointment) return null;

  // Parse times in Hawaii timezone
  const startTime = toZonedTime(new Date(appointment.start_time), HAWAII_TZ);
  const endTime = toZonedTime(new Date(appointment.end_time), HAWAII_TZ);

  // Get provider display name
  const provider = PROVIDERS.find(p => p.id === appointment.provider);
  const providerName = provider?.fullName || appointment.provider;

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
        description: error.message || 'Could not cancel the appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{appointment.patient_name}</DialogTitle>
            <DialogDescription>
              Appointment Details
            </DialogDescription>
          </DialogHeader>

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
              <span className="font-medium">
                {appointment.booked_by === 'ai' ? (
                  <span className="flex items-center gap-1">
                    <span>AI Assistant</span>
                    <span>🤖</span>
                  </span>
                ) : (
                  'Staff'
                )}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Cancel Appointment
            </Button>
          </div>
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
            <AlertDialogCancel disabled={isDeleting}>
              Keep Appointment
            </AlertDialogCancel>
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
    </>
  );
};
