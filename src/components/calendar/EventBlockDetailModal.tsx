import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Clock, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { EventBlock } from '@/types/calendar';
import { PROVIDERS } from '@/lib/constants';
import { deleteEventBlock } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const HAWAII_TZ = 'Pacific/Honolulu';

interface EventBlockDetailModalProps {
  open: boolean;
  onClose: () => void;
  eventBlock: EventBlock | null;
  onDeleteSuccess: () => void;
}

export const EventBlockDetailModal = ({ open, onClose, eventBlock, onDeleteSuccess }: EventBlockDetailModalProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!eventBlock) return null;

  const startTimeHST = toZonedTime(new Date(eventBlock.start_time), HAWAII_TZ);
  const endTimeHST = toZonedTime(new Date(eventBlock.end_time), HAWAII_TZ);
  const durationMinutes = Math.round((new Date(eventBlock.end_time).getTime() - new Date(eventBlock.start_time).getTime()) / (1000 * 60));

  const provider = PROVIDERS.find(p => p.id === eventBlock.provider);
  const providerDisplay = provider ? `${provider.fullName}` : eventBlock.provider;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteEventBlock(eventBlock.id);
      toast({
        title: 'Time Block Deleted',
        description: `${eventBlock.event_name} has been removed from the calendar.`,
      });
      setShowDeleteConfirm(false);
      onClose();
      onDeleteSuccess();
    } catch (error: any) {
      toast({
        title: 'Failed to Delete',
        description: error.message || 'Could not delete the time block. Please try again.',
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
            <DialogTitle>Time Block Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Event Name */}
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="p-2 bg-muted rounded-md">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">
                  {eventBlock.event_name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(startTimeHST, 'EEEE, MMMM d, yyyy')}
                </div>
                <div className="text-sm text-primary">
                  {format(startTimeHST, 'h:mm a')} - {format(endTimeHST, 'h:mm a')} ({durationMinutes} min)
                </div>
              </div>
            </div>

            {/* Provider */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <User className="h-4 w-4" />
                  Provider
                </div>
                <div className="font-medium text-foreground">{providerDisplay}</div>
              </div>
            </div>

            {/* Notes */}
            {eventBlock.notes && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                  Notes
                </div>
                <div className="text-sm text-foreground bg-muted/30 rounded-md p-3">
                  {eventBlock.notes}
                </div>
              </div>
            )}
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
              Delete Block
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Block?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the{' '}
              <strong>{eventBlock.event_name}</strong> block on{' '}
              <strong>{format(startTimeHST, 'MMM d, yyyy')}</strong> at{' '}
              <strong>{format(startTimeHST, 'h:mm a')}</strong>?
              <br /><br />
              This will also remove it from Google Calendar. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Keep Block
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete Block'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
