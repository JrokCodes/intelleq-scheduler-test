import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { X } from 'lucide-react';

interface DatePickerModalProps {
  open: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  title: string;
  selectedDate?: Date;
  minDate?: Date;
  maxDate?: Date;
}

export const DatePickerModal = ({
  open,
  onClose,
  onDateSelect,
  title,
  selectedDate,
  minDate,
  maxDate,
}: DatePickerModalProps) => {
  const [tempDate, setTempDate] = useState<Date | undefined>(selectedDate);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setTempDate(date);
      onDateSelect(date);
      onClose();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <Calendar
            mode="single"
            selected={tempDate}
            onSelect={handleSelect}
            disabled={
              minDate || maxDate
                ? (date) =>
                    (minDate && date < minDate) ||
                    (maxDate && date > maxDate) ||
                    false
                : undefined
            }
            captionLayout="dropdown-buttons"
            fromYear={minDate?.getFullYear() || 1900}
            toYear={maxDate?.getFullYear() || new Date().getFullYear() + 10}
            defaultMonth={tempDate || new Date()}
            className="pointer-events-auto"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
