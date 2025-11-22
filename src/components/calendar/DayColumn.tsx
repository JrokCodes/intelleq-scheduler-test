import { format, isSameDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { PROVIDERS, TIME_SLOTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Appointment, EventBlock, Holiday } from '@/types/calendar';
import { AppointmentCard } from './AppointmentCard';
import { EventBlockCard } from './EventBlockCard';
import { useMemo } from 'react';

interface DayColumnProps {
  date: Date;
  dayName: string;
  appointments: Appointment[];
  eventBlocks: EventBlock[];
  holidays: Holiday[];
}

const SLOT_HEIGHT = 48; // Height of each 15-minute slot in pixels
const HAWAII_TZ = 'Pacific/Honolulu';

export const DayColumn = ({ date, dayName, appointments, eventBlocks, holidays }: DayColumnProps) => {
  const dateStr = format(date, 'M/d');
  
  // Check if this day is a holiday
  const holiday = holidays.find(h => {
    const holidayDate = new Date(h.date + 'T00:00:00');
    return isSameDay(holidayDate, date);
  });

  // Filter appointments and events for this day and convert to Hawaii time
  const dayAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const aptStartHST = toZonedTime(new Date(apt.start_time), HAWAII_TZ);
      return isSameDay(aptStartHST, date);
    });
  }, [appointments, date]);

  const dayEventBlocks = useMemo(() => {
    return eventBlocks.filter(event => {
      const eventStartHST = toZonedTime(new Date(event.start_time), HAWAII_TZ);
      return isSameDay(eventStartHST, date);
    });
  }, [eventBlocks, date]);

  // Calculate position for appointments and events
  const getPositionForTime = (timeStr: string) => {
    const time = toZonedTime(new Date(timeStr), HAWAII_TZ);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    
    // Calendar starts at 7:00 AM
    const totalMinutesFromStart = (hours - 7) * 60 + minutes;
    const slotIndex = totalMinutesFromStart / 15;
    
    return slotIndex * SLOT_HEIGHT;
  };

  if (holiday) {
    return (
      <div className="flex flex-col border-r border-border min-w-[160px]">
        {/* Day Header */}
        <div className="h-16 border-b border-border bg-card">
          <div className="text-center py-2">
            <div className="text-sm font-semibold text-foreground">{dayName}</div>
            <div className="text-xs text-muted-foreground">{dateStr}</div>
          </div>
          {/* Provider sub-headers */}
          <div className="flex border-t border-cell-border">
            {PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                className="flex-1 text-center py-1 border-r border-cell-border last:border-r-0"
              >
                <span className="text-xs text-muted-foreground">{provider.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Holiday overlay */}
        <div className="flex-1 flex items-center justify-center holiday-stripes cursor-not-allowed relative">
          <div className="text-center z-10 bg-card/80 px-4 py-2 rounded-md border border-border">
            <div className="text-sm font-semibold text-muted-foreground">{holiday.name}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col border-r border-border min-w-[160px]">
      {/* Day Header */}
      <div className="h-16 border-b border-border bg-card">
        <div className="text-center py-2">
          <div className="text-sm font-semibold text-foreground">{dayName}</div>
          <div className="text-xs text-muted-foreground">{dateStr}</div>
        </div>
        {/* Provider sub-headers */}
        <div className="flex border-t border-cell-border">
          {PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className="flex-1 text-center py-1 border-r border-cell-border last:border-r-0"
            >
              <span className="text-xs text-muted-foreground">{provider.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Time slots grid */}
      <div className="flex flex-col">
        {TIME_SLOTS.map((slot, slotIndex) => (
          <div key={slotIndex} className="flex h-12 border-b border-cell-border">
            {PROVIDERS.map((provider) => {
              // Find appointments and events for this provider and time slot
              const providerAppointments = dayAppointments.filter(
                apt => apt.provider === provider.id
              );
              const providerEvents = dayEventBlocks.filter(
                event => event.provider === provider.id
              );

              return (
                <div
                  key={provider.id}
                  className={cn(
                    "flex-1 border-r border-cell-border last:border-r-0 transition-colors relative",
                    slot.isLunchTime
                      ? "lunch-stripes cursor-not-allowed"
                      : "hover:bg-hover-cell cursor-pointer"
                  )}
                >
                  {/* Render appointments for this provider at this time */}
                  {slotIndex === 0 && providerAppointments.map(apt => {
                    const topPosition = getPositionForTime(apt.start_time);
                    return (
                      <div
                        key={apt.id}
                        style={{ top: `${topPosition}px` }}
                        className="absolute w-full"
                      >
                        <AppointmentCard appointment={apt} slotHeight={SLOT_HEIGHT} />
                      </div>
                    );
                  })}
                  
                  {/* Render event blocks for this provider at this time */}
                  {slotIndex === 0 && providerEvents.map(event => {
                    const topPosition = getPositionForTime(event.start_time);
                    return (
                      <div
                        key={event.id}
                        style={{ top: `${topPosition}px` }}
                        className="absolute w-full"
                      >
                        <EventBlockCard eventBlock={event} slotHeight={SLOT_HEIGHT} />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
