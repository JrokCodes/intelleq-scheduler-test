import { format, isSameDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { PROVIDERS, TIME_SLOTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Appointment, EventBlock, Holiday, BookingInProgress } from '@/types/calendar';
import { AppointmentCard } from './AppointmentCard';
import { EventBlockCard } from './EventBlockCard';
import { BookingInProgressCard } from './BookingInProgressCard';
import { useMemo } from 'react';

interface DayColumnProps {
  date: Date;
  dayName: string;
  appointments: Appointment[];
  eventBlocks: EventBlock[];
  holidays: Holiday[];
  bookingInProgress: BookingInProgress[];
  onSlotClick: (slotInfo: { provider: string; providerName: string; date: Date; time: string }) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  onEventBlockClick?: (eventBlock: EventBlock) => void;
  isToday?: boolean;
  hoveredSlotIndex: number | null;
  onSlotHover: (index: number | null) => void;
}

const SLOT_HEIGHT = 48; // Height of each 15-minute slot in pixels
const HAWAII_TZ = 'Pacific/Honolulu';

export const DayColumn = ({ date, dayName, appointments, eventBlocks, holidays, bookingInProgress, onSlotClick, onAppointmentClick, onEventBlockClick, isToday = false, hoveredSlotIndex, onSlotHover }: DayColumnProps) => {
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

// Filter booking in progress for this day
  const dayBookingInProgress = useMemo(() => {
    const dateString = format(date, 'yyyy-MM-dd');
    return bookingInProgress.filter(block => block.block_date === dateString);
  }, [bookingInProgress, date]);

  // Helper to check if a slot time falls within a booking in progress range
  const isSlotBlockedByBooking = (slotHours: number, slotMinutes: number) => {
    const slotTotalMinutes = slotHours * 60 + slotMinutes;
    return dayBookingInProgress.some(block => {
      const [blockHours, blockMins] = block.block_time.split(':').map(Number);
      const blockStartMinutes = blockHours * 60 + blockMins;
      const blockEndMinutes = blockStartMinutes + block.duration_minutes;
      return slotTotalMinutes >= blockStartMinutes && slotTotalMinutes < blockEndMinutes;
    });
  };

  // Calculate position for booking in progress blocks
  const getPositionForBooking = (block: BookingInProgress) => {
    const [hours, minutes] = block.block_time.split(':').map(Number);
    // Calendar starts at 7:00 AM
    const totalMinutesFromStart = (hours - 7) * 60 + minutes;
    const slotIndex = totalMinutesFromStart / 15;
    return slotIndex * SLOT_HEIGHT;
  };

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
        "flex flex-col border-r-2 border-slate-500 min-w-[160px]",
        isToday && "bg-primary/15 border-l-2 border-l-primary"
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
          <div className="flex border-t border-slate-500 dark:border-slate-400">
            {PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                className="flex-1 text-center py-1 border-r border-slate-500 dark:border-slate-400 last:border-r-0"
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
      "flex-1 flex flex-col border-r-2 border-slate-500 last:border-r-0",
      isToday && "bg-primary/15 border-l-2 border-l-primary"
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
        <div className="flex border-t border-slate-500 dark:border-slate-400">
          {PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className="flex-1 text-center py-1 border-r border-slate-500 dark:border-slate-400 last:border-r-0"
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
                    <EventBlockCard eventBlock={event} slotHeight={SLOT_HEIGHT} onClick={onEventBlockClick} />
                  </div>
                );
              })}

            </div>
          );
        })}

        {/* Booking in progress overlays - full width to block both providers */}
        {dayBookingInProgress.map(block => {
          const topPosition = getPositionForBooking(block);

          return (
            <div
              key={block.id}
              style={{
                top: `${topPosition}px`,
                left: 0,
                right: 0
              }}
              className="absolute z-20"
            >
              <BookingInProgressCard booking={block} slotHeight={SLOT_HEIGHT} />
            </div>
          );
        })}

        {/* Time slot grid cells */}
        <div className="flex flex-col">
          {TIME_SLOTS.map((slot, slotIndex) => (
            <div
              key={slotIndex}
              onMouseEnter={() => onSlotHover(slotIndex)}
              className={cn(
                "flex h-12 transition-colors",
                !slot.isLunchTime && (
                  slot.minute === 0
                    ? "border-b-2 border-slate-400" // Hour marker - bold
                    : "border-b border-slate-600 dark:border-slate-500" // 15-min interval - subtle
                ),
                // Row highlight when hovered
                hoveredSlotIndex === slotIndex && "bg-white/[0.08]"
              )}
            >
              {PROVIDERS.map((provider, providerIndex) => {
                // Check if this slot has an appointment or event for click handling
                const providerAppointments = dayAppointments.filter(apt => apt.provider === provider.id);
                const providerEvents = dayEventBlocks.filter(event => event.provider === provider.id);

                // Parse the slot time correctly - handle "7:00 AM" format
                const timeParts = slot.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
                let slotHours = 0;
                let slotMinutes = 0;
                if (timeParts) {
                  slotHours = parseInt(timeParts[1]);
                  slotMinutes = parseInt(timeParts[2]);
                  const ampm = timeParts[3].toUpperCase();

                  if (ampm === 'PM' && slotHours !== 12) slotHours += 12;
                  if (ampm === 'AM' && slotHours === 12) slotHours = 0;
                }

                // Check appointments by comparing hours/minutes in Hawaii time
                const hasAppointment = providerAppointments.some(apt => {
                  const aptStartHST = toZonedTime(new Date(apt.start_time), HAWAII_TZ);
                  const aptEndHST = toZonedTime(new Date(apt.end_time), HAWAII_TZ);
                  const aptStartMinutes = aptStartHST.getHours() * 60 + aptStartHST.getMinutes();
                  const aptEndMinutes = aptEndHST.getHours() * 60 + aptEndHST.getMinutes();
                  const slotTotalMinutes = slotHours * 60 + slotMinutes;
                  return slotTotalMinutes >= aptStartMinutes && slotTotalMinutes < aptEndMinutes;
                });

                // Check event blocks by comparing hours/minutes in Hawaii time
                const hasEvent = providerEvents.some(event => {
                  const eventStartHST = toZonedTime(new Date(event.start_time), HAWAII_TZ);
                  const eventEndHST = toZonedTime(new Date(event.end_time), HAWAII_TZ);
                  const eventStartMinutes = eventStartHST.getHours() * 60 + eventStartHST.getMinutes();
                  const eventEndMinutes = eventEndHST.getHours() * 60 + eventEndHST.getMinutes();
                  const slotTotalMinutes = slotHours * 60 + slotMinutes;
                  return slotTotalMinutes >= eventStartMinutes && slotTotalMinutes < eventEndMinutes;
                });

                // Check if slot is blocked by booking in progress
                const hasBookingInProgress = isSlotBlockedByBooking(slotHours, slotMinutes);

                const isClickable = !slot.isLunchTime && !hasAppointment && !hasEvent && !hasBookingInProgress;

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
                      "flex-1 last:border-r-0 transition-colors",
                      !slot.isLunchTime && "border-r border-slate-500 dark:border-slate-400",
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
