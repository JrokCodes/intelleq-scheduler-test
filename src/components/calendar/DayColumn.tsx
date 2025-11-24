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
  onSlotClick: (slotInfo: { provider: string; providerName: string; date: Date; time: string }) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  isToday?: boolean;
}

const SLOT_HEIGHT = 48; // Height of each 15-minute slot in pixels
const HAWAII_TZ = 'Pacific/Honolulu';

export const DayColumn = ({ date, dayName, appointments, eventBlocks, holidays, onSlotClick, onAppointmentClick, isToday = false }: DayColumnProps) => {
  const dateStr = format(date, 'M/d');
  
  // Check if this day is a holiday
  const holiday = holidays.find(h => {
    const holidayDate = new Date(h.date + 'T00:00:00');
    return isSameDay(holidayDate, date);
  });

  // Filter appointments and events for this day and convert to Hawaii time
  const dayAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const aptStartUTC = new Date(apt.start_time);
      const aptStartHST = toZonedTime(aptStartUTC, HAWAII_TZ);
      return isSameDay(aptStartHST, date);
    });
  }, [appointments, date]);

  const dayEventBlocks = useMemo(() => {
    return eventBlocks.filter(event => {
      const eventStartUTC = new Date(event.start_time);
      const eventStartHST = toZonedTime(eventStartUTC, HAWAII_TZ);
      return isSameDay(eventStartHST, date);
    });
  }, [eventBlocks, date]);

  // Calculate position for appointments and events
  const getPositionForTime = (timeStr: string) => {
    const timeUTC = new Date(timeStr);
    const timeHST = toZonedTime(timeUTC, HAWAII_TZ);
    const hours = timeHST.getHours();
    const minutes = timeHST.getMinutes();
    
    // Calendar starts at 7:00 AM
    const totalMinutesFromStart = (hours - 7) * 60 + minutes;
    const slotIndex = totalMinutesFromStart / 15;
    const position = slotIndex * SLOT_HEIGHT;
    
    return position;
  };

  if (holiday) {
    return (
      <div className={cn(
        "flex flex-col border-r border-border min-w-[160px]",
        isToday && "bg-primary/5 border-l-2 border-l-primary"
      )}>
        {/* Day Header */}
        <div className={cn(
          "h-16 border-b border-border bg-card",
          isToday && "bg-primary/10"
        )}>
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
    <div className={cn(
      "flex flex-col border-r border-border min-w-[160px]",
      isToday && "bg-primary/5 border-l-2 border-l-primary"
    )}>
      {/* Day Header */}
      <div className={cn(
        "h-16 border-b border-border bg-card",
        isToday && "bg-primary/10"
      )}>
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

      {/* Time slots grid - relative container for absolute positioning of appointments */}
      <div className="relative">
        {/* Appointment and Event overlays - positioned absolutely relative to this container */}
        {PROVIDERS.map((provider, providerIndex) => {
          const providerAppointments = dayAppointments.filter(apt => apt.provider === provider.id);
          const providerEvents = dayEventBlocks.filter(event => event.provider === provider.id);

          return (
            <div key={provider.id}>
              {/* Appointments for this provider */}
              {providerAppointments.map(apt => {
                const topPosition = getPositionForTime(apt.start_time);
                // Each provider column is 50% width (2 providers)
                const leftPosition = providerIndex * 50;

                return (
                  <div
                    key={apt.id}
                    style={{
                      top: `${topPosition}px`,
                      left: `${leftPosition}%`,
                      width: '50%'
                    }}
                    className="absolute z-10"
                  >
                    <AppointmentCard appointment={apt} slotHeight={SLOT_HEIGHT} onClick={onAppointmentClick} />
                  </div>
                );
              })}

              {/* Event blocks for this provider */}
              {providerEvents.map(event => {
                const topPosition = getPositionForTime(event.start_time);
                const leftPosition = providerIndex * 50;

                return (
                  <div
                    key={event.id}
                    style={{
                      top: `${topPosition}px`,
                      left: `${leftPosition}%`,
                      width: '50%'
                    }}
                    className="absolute z-10"
                  >
                    <EventBlockCard eventBlock={event} slotHeight={SLOT_HEIGHT} />
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Time slot grid cells */}
        <div className="flex flex-col">
          {TIME_SLOTS.map((slot, slotIndex) => (
            <div key={slotIndex} className="flex h-12 border-b border-cell-border">
              {PROVIDERS.map((provider) => {
                // Check if this slot has an appointment or event for click handling
                const providerAppointments = dayAppointments.filter(apt => apt.provider === provider.id);
                const providerEvents = dayEventBlocks.filter(event => event.provider === provider.id);

                // Parse the slot time correctly - handle "7:00 AM" format
                const slotDateTime = new Date(date);
                const timeParts = slot.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
                if (timeParts) {
                  let hours = parseInt(timeParts[1]);
                  const minutes = parseInt(timeParts[2]);
                  const ampm = timeParts[3].toUpperCase();

                  if (ampm === 'PM' && hours !== 12) hours += 12;
                  if (ampm === 'AM' && hours === 12) hours = 0;

                  slotDateTime.setHours(hours, minutes, 0, 0);
                }

                const hasAppointment = providerAppointments.some(apt => {
                  const aptStart = toZonedTime(new Date(apt.start_time), HAWAII_TZ);
                  const aptEnd = toZonedTime(new Date(apt.end_time), HAWAII_TZ);
                  return slotDateTime >= aptStart && slotDateTime < aptEnd;
                });

                const hasEvent = providerEvents.some(event => {
                  const eventStart = toZonedTime(new Date(event.start_time), HAWAII_TZ);
                  const eventEnd = toZonedTime(new Date(event.end_time), HAWAII_TZ);
                  return slotDateTime >= eventStart && slotDateTime < eventEnd;
                });

                const isClickable = !slot.isLunchTime && !hasAppointment && !hasEvent;

                const handleSlotClick = () => {
                  if (isClickable) {
                    onSlotClick({
                      provider: provider.id,
                      providerName: provider.name,
                      date: date,
                      time: slot.time,
                    });
                  }
                };

                return (
                  <div
                    key={provider.id}
                    onClick={handleSlotClick}
                    className={cn(
                      "flex-1 border-r border-cell-border last:border-r-0 transition-colors",
                      slot.isLunchTime
                        ? "lunch-stripes cursor-not-allowed"
                        : isClickable
                        ? "hover:bg-hover-cell cursor-pointer"
                        : "cursor-default"
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
