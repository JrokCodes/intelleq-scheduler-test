import { useState } from 'react';
import { addDays, format, isToday } from 'date-fns';
import { DAYS_OF_WEEK } from '@/lib/constants';
import { TimeColumn } from './TimeColumn';
import { DayColumn } from './DayColumn';
import { Appointment, EventBlock, Holiday, BookingInProgress } from '@/types/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { DndContext, DragOverlay, closestCenter, DragStartEvent, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { AppointmentCard } from './AppointmentCard';
import { rescheduleAppointment } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface CalendarGridProps {
  weekStart: Date;
  appointments: Appointment[];
  eventBlocks: EventBlock[];
  holidays: Holiday[];
  bookingInProgress: BookingInProgress[];
  isLoading: boolean;
  onSlotClick: (slotInfo: { provider: string; providerName: string; date: Date; time: string }) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  onEventBlockClick?: (eventBlock: EventBlock) => void;
  onRescheduleSuccess?: () => void;
}

export const CalendarGrid = ({
  weekStart,
  appointments,
  eventBlocks,
  holidays,
  bookingInProgress,
  isLoading,
  onSlotClick,
  onAppointmentClick,
  onEventBlockClick,
  onRescheduleSuccess
}: CalendarGridProps) => {
  // Track which row is being hovered for cross-column highlight
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null);
  // Track active dragging appointment for DragOverlay
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);

  // Configure drag activation - requires 200ms hold or 8px movement to start drag
  // This allows normal clicks to work for viewing appointment details
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'appointment') {
      setActiveAppointment(active.data.current.appointment);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveAppointment(null);

    if (!over || !active.data.current?.appointment) return;

    const appointment = active.data.current.appointment as Appointment;
    const dropData = over.data.current;

    if (dropData?.type !== 'slot') return;

    // Build new start time in ISO format with Hawaii offset
    const dropDate = dropData.date as Date;
    const dropTime = dropData.time as string;
    const dropProvider = dropData.provider as string;

    // Parse time (format: "8:00 AM" or "1:30 PM")
    const timeParts = dropTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeParts) return;

    let hours = parseInt(timeParts[1]);
    const minutes = parseInt(timeParts[2]);
    const ampm = timeParts[3].toUpperCase();

    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    const newDateTime = new Date(dropDate);
    newDateTime.setHours(hours, minutes, 0, 0);

    // Format as ISO with Hawaii timezone offset (-10:00)
    const newStartTime = format(newDateTime, "yyyy-MM-dd'T'HH:mm:ss'-10:00'");

    // Check if provider changed
    const newProvider = dropProvider !== appointment.provider ? dropProvider : undefined;

    try {
      const result = await rescheduleAppointment(appointment.id, newStartTime, newProvider);

      if (result.success) {
        toast({
          title: 'Appointment Rescheduled',
          description: `${appointment.patient_name} moved to ${dropTime}`,
        });
        onRescheduleSuccess?.();
      } else {
        toast({
          title: 'Reschedule Failed',
          description: result.error || 'Could not reschedule appointment',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Reschedule Failed',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-auto animate-fade-in" onMouseLeave={() => setHoveredSlotIndex(null)}>
        <div className="flex w-full h-full">
          {/* Time column */}
          <TimeColumn hoveredSlotIndex={hoveredSlotIndex} />

          {/* Day columns - flex-1 to fill remaining space equally */}
          {days.map((day, index) => (
            <DayColumn
              key={day.toISOString()}
              date={day}
              dayName={DAYS_OF_WEEK[index]}
              appointments={appointments}
              eventBlocks={eventBlocks}
              holidays={holidays}
              bookingInProgress={bookingInProgress}
              onSlotClick={onSlotClick}
              onAppointmentClick={onAppointmentClick}
              onEventBlockClick={onEventBlockClick}
              isToday={isToday(day)}
              hoveredSlotIndex={hoveredSlotIndex}
              onSlotHover={setHoveredSlotIndex}
              draggedAppointmentDuration={activeAppointment?.duration_minutes}
            />
          ))}
        </div>
      </div>

      {/* Ghost preview during drag */}
      <DragOverlay>
        {activeAppointment && (
          <AppointmentCard
            appointment={activeAppointment}
            slotHeight={48}
            isGhost={true}
            isDraggable={false}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
};
