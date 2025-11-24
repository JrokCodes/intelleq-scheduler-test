import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { EventBlock } from '@/types/calendar';
import { PROVIDERS } from '@/lib/constants';

const HAWAII_TZ = 'Pacific/Honolulu';

interface EventBlockDetailModalProps {
  open: boolean;
  onClose: () => void;
  eventBlock: EventBlock | null;
}

export const EventBlockDetailModal = ({ open, onClose, eventBlock }: EventBlockDetailModalProps) => {
  if (!eventBlock) return null;

  const startTimeHST = toZonedTime(new Date(eventBlock.start_time), HAWAII_TZ);
  const endTimeHST = toZonedTime(new Date(eventBlock.end_time), HAWAII_TZ);
  const durationMinutes = Math.round((endTimeHST.getTime() - startTimeHST.getTime()) / (1000 * 60));

  const provider = PROVIDERS.find(p => p.id === eventBlock.provider);
  const providerDisplay = provider ? `${provider.fullName}` : eventBlock.provider;

  return (
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

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
