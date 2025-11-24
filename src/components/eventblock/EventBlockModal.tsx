import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { createEventBlock } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PROVIDERS } from '@/lib/constants';

const EVENT_TYPES = [
  'Lunch',
  'Meeting',
  'Training',
  'Personal',
  'Administrative',
  'Surgery (out of office)',
  'Conference',
  'Other',
];

// Generate time options from 7:00 AM to 5:00 PM in 15-minute increments
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 7; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 17 && minute > 0) break; // Stop at 5:00 PM
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const label = `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
      const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push({ value, label });
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

interface EventBlockModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultDate?: Date;
}

export const EventBlockModal = ({ open, onClose, onSuccess, defaultDate }: EventBlockModalProps) => {
  const [provider, setProvider] = useState('');
  const [eventType, setEventType] = useState('');
  const [customEventName, setCustomEventName] = useState('');
  const [date, setDate] = useState<Date | undefined>(defaultDate || new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const eventName = eventType === 'Other' ? customEventName : eventType;

    if (!provider || !eventName || !date || !startTime || !endTime) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Validate end time is after start time
    if (startTime >= endTime) {
      toast({
        title: 'Validation Error',
        description: 'End time must be after start time',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const startTimeISO = `${dateStr}T${startTime}:00-10:00`;
      const endTimeISO = `${dateStr}T${endTime}:00-10:00`;

      await createEventBlock({
        provider,
        event_name: eventName,
        start_time: startTimeISO,
        end_time: endTimeISO,
        notes: notes.trim() || undefined,
      });

      toast({
        title: 'Success',
        description: 'Time block created successfully',
      });

      handleClose();
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Failed to Create Block',
        description: error.message || 'Failed to create time block',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setProvider('');
    setEventType('');
    setCustomEventName('');
    setDate(defaultDate || new Date());
    setStartTime('');
    setEndTime('');
    setNotes('');
    onClose();
  };

  const isFormValid = provider && (eventType === 'Other' ? customEventName : eventType) && date && startTime && endTime && startTime < endTime;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Block Time</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create a time block for a provider
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Provider */}
            <div className="space-y-2">
              <Label htmlFor="provider">Provider *</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider..." />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Name *</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type..." />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Event Name (if Other selected) */}
            {eventType === 'Other' && (
              <div className="space-y-2">
                <Label htmlFor="customEventName">Custom Event Name *</Label>
                <Input
                  id="customEventName"
                  value={customEventName}
                  onChange={(e) => setCustomEventName(e.target.value)}
                  placeholder="Enter event name"
                />
              </div>
            )}

            {/* Date */}
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      setDate(d);
                      setDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="End time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Validation hint */}
            {startTime && endTime && startTime >= endTime && (
              <p className="text-sm text-destructive">
                End time must be after start time
              </p>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Block'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
