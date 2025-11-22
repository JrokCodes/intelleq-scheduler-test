import { EventBlock } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface EventBlockCardProps {
  eventBlock: EventBlock;
  slotHeight: number;
}

export const EventBlockCard = ({ eventBlock, slotHeight }: EventBlockCardProps) => {
  const startTime = new Date(eventBlock.start_time);
  const endTime = new Date(eventBlock.end_time);
  const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  const heightInSlots = durationMinutes / 15;
  const height = heightInSlots * slotHeight;

  return (
    <div
      className={cn(
        "absolute left-0.5 right-0.5 rounded-md p-1.5",
        "bg-muted/50 border border-border",
        "event-block-stripes"
      )}
      style={{
        height: `${height}px`,
      }}
    >
      <div className="text-muted-foreground font-medium text-xs truncate">
        {eventBlock.event_name}
      </div>
    </div>
  );
};
