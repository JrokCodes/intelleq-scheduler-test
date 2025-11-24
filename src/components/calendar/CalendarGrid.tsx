import { addDays, format, isToday } from 'date-fns';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { TimeColumn } from './TimeColumn';
import { DayColumn } from './DayColumn';
import { Appointment, EventBlock, Holiday } from '@/types/calendar';
import { Skeleton } from '@/components/ui/skeleton';

interface CalendarGridProps {
  weekStart: Date;
  appointments: Appointment[];
  eventBlocks: EventBlock[];
  holidays: Holiday[];
  isLoading: boolean;
  onSlotClick: (slotInfo: { provider: string; providerName: string; date: Date; time: string }) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  onEventBlockClick?: (eventBlock: EventBlock) => void;
}

export const CalendarGrid = ({
  weekStart,
  appointments,
  eventBlocks,
  holidays,
  isLoading,
  onSlotClick,
  onAppointmentClick,
  onEventBlockClick
}: CalendarGridProps) => {
  // Only show weekdays (Monday-Friday = 5 days)
  const days = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const hasAnyData = appointments.length > 0 || eventBlocks.length > 0;

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto animate-fade-in">
        <div className="flex w-full">
          <TimeColumn />
          {days.map((day) => (
            <div key={day.toISOString()} className="flex-1 flex flex-col border-r border-border last:border-r-0">
              <div className="h-16 border-b border-border bg-card p-3">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="p-4 space-y-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hasAnyData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground animate-fade-in">
          <div className="text-4xl mb-4">📅</div>
          <div className="text-lg font-medium">No appointments scheduled</div>
          <div className="text-sm">for this week</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto animate-fade-in">
      <div className="flex w-full h-full">
        {/* Time column */}
        <TimeColumn />

        {/* Day columns - flex-1 to fill remaining space equally */}
        {days.map((day, index) => (
          <DayColumn
            key={day.toISOString()}
            date={day}
            dayName={DAYS_OF_WEEK[index]}
            appointments={appointments}
            eventBlocks={eventBlocks}
            holidays={holidays}
            onSlotClick={onSlotClick}
            onAppointmentClick={onAppointmentClick}
            onEventBlockClick={onEventBlockClick}
            isToday={isToday(day)}
          />
        ))}
      </div>
    </div>
  );
};
