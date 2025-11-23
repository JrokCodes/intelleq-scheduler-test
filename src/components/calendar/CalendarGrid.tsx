import { addDays, format } from 'date-fns';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { TimeColumn } from './TimeColumn';
import { DayColumn } from './DayColumn';
import { Appointment, EventBlock, Holiday } from '@/types/calendar';

interface CalendarGridProps {
  weekStart: Date;
  appointments: Appointment[];
  eventBlocks: EventBlock[];
  holidays: Holiday[];
  isLoading: boolean;
  onSlotClick: (slotInfo: { provider: string; providerName: string; date: Date; time: string }) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
}

export const CalendarGrid = ({
  weekStart,
  appointments,
  eventBlocks,
  holidays,
  isLoading,
  onSlotClick,
  onAppointmentClick
}: CalendarGridProps) => {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  console.log('📊 [CalendarGrid] Rendering with:', {
    weekStart: format(weekStart, 'yyyy-MM-dd'),
    appointmentsCount: appointments.length,
    eventBlocksCount: eventBlocks.length,
    holidaysCount: holidays.length
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="inline-flex min-w-full">
        {/* Time column */}
        <TimeColumn />
        
        {/* Day columns */}
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
          />
        ))}
      </div>
    </div>
  );
};
