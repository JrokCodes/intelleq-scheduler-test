import { Phone } from 'lucide-react';
import { BookingInProgress } from '@/types/calendar';

interface BookingInProgressCardProps {
  booking: BookingInProgress;
  slotHeight: number;
}

export const BookingInProgressCard = ({ booking, slotHeight }: BookingInProgressCardProps) => {
  const heightInSlots = booking.duration_minutes / 15;
  const height = heightInSlots * slotHeight;

  return (
    <div
      className="mx-1 rounded-md overflow-hidden cursor-not-allowed select-none relative"
      style={{ height: `${height}px` }}
      title="AI is currently booking this slot"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-red-500/70 animate-pulse" />

      {/* Border */}
      <div className="absolute inset-0 border-2 border-red-600 rounded-md" />

      {/* Content */}
      <div className="relative h-full flex items-center justify-center gap-2 px-2">
        <Phone className="w-4 h-4 text-white animate-bounce" />
        <span className="text-white text-xs font-medium whitespace-nowrap">
          Booking in progress
        </span>
      </div>
    </div>
  );
};
