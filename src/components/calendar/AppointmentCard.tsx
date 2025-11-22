import { Appointment } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  appointment: Appointment;
  slotHeight: number;
}

export const AppointmentCard = ({ appointment, slotHeight }: AppointmentCardProps) => {
  const heightInSlots = appointment.duration_minutes / 15;
  const height = heightInSlots * slotHeight;

  return (
    <div
      className={cn(
        "absolute left-0.5 right-0.5 rounded-md p-1.5 cursor-pointer",
        "transition-all duration-200 hover:scale-[1.02] hover:shadow-lg",
        "border border-white/20"
      )}
      style={{
        backgroundColor: appointment.color,
        height: `${height}px`,
      }}
    >
      <div className="relative h-full overflow-hidden">
        {appointment.booked_by === 'ai' && (
          <div className="absolute top-0 right-0 text-xs">🤖</div>
        )}
        <div className="text-white font-semibold text-xs truncate">
          {appointment.patient_name}
        </div>
        <div className="text-white/80 text-xs truncate">
          {appointment.appointment_type}
        </div>
      </div>
    </div>
  );
};
