import { EventBlock } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';

const HAWAII_TZ = 'Pacific/Honolulu';

interface EventBlockCardProps {
  eventBlock: EventBlock;
  slotHeight: number;
  onClick?: (eventBlock: EventBlock) => void;
}

export const EventBlockCard = ({ eventBlock, slotHeight, onClick }: EventBlockCardProps) => {
  // Convert to Hawaii time for accurate duration calculation
  const startTimeHST = toZonedTime(new Date(eventBlock.start_time), HAWAII_TZ);
  const endTimeHST = toZonedTime(new Date(eventBlock.end_time), HAWAII_TZ);

  // Calculate duration in minutes
  const durationMinutes = (new Date(eventBlock.end_time).getTime() - new Date(eventBlock.start_time).getTime()) / (1000 * 60);
  const heightInSlots = durationMinutes / 15;
  const height = Math.max(heightInSlots * slotHeight, slotHeight); // Minimum 1 slot height

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(eventBlock);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "absolute left-0.5 right-0.5 rounded-md p-1.5 overflow-hidden",
        "bg-violet-500/30 border border-violet-400/50",
        "cursor-pointer hover:bg-violet-400/40 transition-colors",
        "event-block-stripes"
      )}
      style={{
        height: `${height}px`,
      }}
    >
      <div className="flex flex-col h-full">
        <div className="text-slate-200 font-medium text-xs truncate">
          {eventBlock.event_name}
        </div>
        {height >= slotHeight * 2 && (
          <div className="text-slate-400 text-[10px] mt-0.5">
            {format(startTimeHST, 'h:mm a')} - {format(endTimeHST, 'h:mm a')}
          </div>
        )}
      </div>
    </div>
  );
};
