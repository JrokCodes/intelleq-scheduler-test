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
}

const SLOT_HEIGHT = 48; // Height of each 15-minute slot in pixels
const HAWAII_TZ = 'Pacific/Honolulu';

export const DayColumn = ({ date, dayName, appointments, eventBlocks, holidays, onSlotClick }: DayColumnProps) => {
  const dateStr = format(date, 'M/d');
  
  // Check if this day is a holiday
  const holiday = holidays.find(h => {
    const holidayDate = new Date(h.date + 'T00:00:00');
    return isSameDay(holidayDate, date);
  });

  // Filter appointments and events for this day and convert to Hawaii time
  const dayAppointments = useMemo(() => {
    const filtered = appointments.filter(apt => {
      const aptStartUTC = new Date(apt.start_time);
      const aptStartHST = toZonedTime(aptStartUTC, HAWAII_TZ);
      const match = isSameDay(aptStartHST, date);
      
      console.log('🔍 [DayColumn] Checking appointment:', {
        patientName: apt.patient_name,
        startTimeUTC: apt.start_time,
        startTimeHST: format(aptStartHST, 'yyyy-MM-dd HH:mm:ss'),
        columnDate: format(date, 'yyyy-MM-dd'),
        matches: match
      });
      
      return match;
    });
    
    console.log(`📅 [DayColumn] ${format(date, 'yyyy-MM-dd')} - Found ${filtered.length} appointments`);
    return filtered;
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
    
    console.log('📍 [DayColumn] Position for time:', {
      timeUTC: timeStr,
      timeHST: format(timeHST, 'HH:mm'),
      hours,
      minutes,
      totalMinutesFromStart,
      slotIndex,
      position
    });
    
    return position;
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

              // Check if this slot has an appointment or event
              const slotDateTime = new Date(date);
              const [hours, minutes] = slot.time.split(':').map(Number);
              slotDateTime.setHours(hours, minutes, 0, 0);
              
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
                    "flex-1 border-r border-cell-border last:border-r-0 transition-colors relative",
                    slot.isLunchTime
                      ? "lunch-stripes cursor-not-allowed"
                      : isClickable
                      ? "hover:bg-hover-cell cursor-pointer"
                      : "cursor-default"
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
