import { Phone } from 'lucide-react';
import { BookingInProgress } from '@/types/calendar';

interface BookingInProgressSlotProps {
  booking: BookingInProgress;
  slotHeight: number;
}

export const BookingInProgressSlot = ({ booking, slotHeight }: BookingInProgressSlotProps) => {
  const heightInPixels = (booking.duration_minutes / 15) * slotHeight;

  return (
    <div
      style={{ height: `${heightInPixels}px` }}
      className="absolute inset-x-1 bg-red-500/70 border-2 border-red-600 rounded-md flex flex-col items-center justify-center gap-1 cursor-not-allowed z-15 animate-pulse"
    >
      <Phone className="h-3 w-3 text-white animate-bounce" />
      <span className="text-xs font-medium text-white">Booking in progress</span>
    </div>
  );
};
