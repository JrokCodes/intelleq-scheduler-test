import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Clock } from 'lucide-react';

interface SlotActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slotInfo: {
    provider: string;
    providerName: string;
    date: Date;
    time: string;
  } | null;
  onCreateAppointment: () => void;
  onCreateEventBlock: () => void;
}

export const SlotActionDialog = ({
  open,
  onOpenChange,
  slotInfo,
  onCreateAppointment,
  onCreateEventBlock,
}: SlotActionDialogProps) => {
  if (!slotInfo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">What would you like to do?</DialogTitle>
          <p className="text-sm text-muted-foreground text-center pt-2">
            {slotInfo.providerName} | {slotInfo.time}
            <br />
            {format(slotInfo.date, 'EEEE, MMM d, yyyy')}
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={() => {
              onOpenChange(false);
              onCreateAppointment();
            }}
          >
            <CalendarPlus className="h-5 w-5 mr-2" />
            Create Appointment
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => {
              onOpenChange(false);
              onCreateEventBlock();
            }}
          >
            <Clock className="h-5 w-5 mr-2" />
            Block Time
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
