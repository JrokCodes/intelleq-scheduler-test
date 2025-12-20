import { Appointment } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface AppointmentCardProps {
  appointment: Appointment;
  slotHeight: number;
  onClick?: (appointment: Appointment) => void;
  isGhost?: boolean;
  isDraggable?: boolean;
}

export const AppointmentCard = ({ appointment, slotHeight, onClick, isGhost = false, isDraggable = true }: AppointmentCardProps) => {
  const heightInSlots = appointment.duration_minutes / 15;
  const height = heightInSlots * slotHeight;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: appointment.id,
    data: {
      type: 'appointment',
      appointment,
    },
    disabled: !isDraggable,
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : 10,
  } : undefined;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent slot click from firing
    if (onClick && !isDragging) {
      onClick(appointment);
    }
  };

  // Ghost card for DragOverlay
  if (isGhost) {
    return (
      <div
        className={cn(
          "rounded-md p-1.5",
          "border border-white/40 shadow-2xl",
          "opacity-90"
        )}
        style={{
          backgroundColor: appointment.color,
          height: `${height}px`,
          width: '120px',
        }}
      >
        <div className="relative h-full overflow-hidden">
          <div className="text-white font-semibold text-xs truncate">
            {appointment.patient_name}
          </div>
          <div className="text-white/80 text-xs truncate">
            {appointment.appointment_type}
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            style={{
              ...style,
              backgroundColor: appointment.color,
              height: `${height}px`,
            }}
            {...listeners}
            {...attributes}
            onClick={handleClick}
            className={cn(
              "absolute left-0.5 right-0.5 rounded-md p-1.5 cursor-grab",
              "transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:z-20",
              "border border-white/20",
              isDragging && "opacity-50 cursor-grabbing"
            )}
          >
            <div className="relative h-full overflow-hidden">
              <div className="text-white font-semibold text-xs truncate">
                {appointment.patient_name}
              </div>
              <div className="text-white/80 text-xs truncate">
                {appointment.appointment_type}
              </div>
              {appointment.booked_by_ai && (
                <div className="absolute bottom-0 right-0 text-xs" title="Booked by AI">🤖</div>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1">
            <div className="font-semibold">{appointment.patient_name}</div>
            <div className="text-sm text-muted-foreground">DOB: {appointment.patient_dob}</div>
            <div className="text-sm">{appointment.appointment_type}</div>
            {appointment.reason && (
              <div className="text-sm text-muted-foreground">Reason: {appointment.reason}</div>
            )}
            <div className="text-xs text-muted-foreground">{appointment.duration_minutes} minutes</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
