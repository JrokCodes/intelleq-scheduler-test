import { Appointment } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AppointmentCardProps {
  appointment: Appointment;
  slotHeight: number;
  onClick?: (appointment: Appointment) => void;
}

export const AppointmentCard = ({ appointment, slotHeight, onClick }: AppointmentCardProps) => {
  const heightInSlots = appointment.duration_minutes / 15;
  const height = heightInSlots * slotHeight;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent slot click from firing
    if (onClick) {
      onClick(appointment);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div
            onClick={handleClick}
            className={cn(
              "absolute left-0.5 right-0.5 rounded-md p-1.5 cursor-pointer",
              "transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:z-20",
              "border border-white/20"
            )}
            style={{
              backgroundColor: appointment.color,
              height: `${height}px`,
            }}
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
