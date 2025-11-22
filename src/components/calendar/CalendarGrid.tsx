import { addDays } from 'date-fns';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { TimeColumn } from './TimeColumn';
import { DayColumn } from './DayColumn';

interface CalendarGridProps {
  weekStart: Date;
}

export const CalendarGrid = ({ weekStart }: CalendarGridProps) => {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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
          />
        ))}
      </div>
    </div>
  );
};
