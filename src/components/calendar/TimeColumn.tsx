import { TIME_SLOTS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface TimeColumnProps {
  hoveredSlotIndex: number | null;
}

export const TimeColumn = ({ hoveredSlotIndex }: TimeColumnProps) => {
  return (
    <div className="flex flex-col border-r-[3px] border-slate-300 bg-card">
      {/* Header spacer to align with day headers */}
      <div className="h-16 border-b border-border flex items-center justify-center px-4">
        <span className="text-xs font-medium text-muted-foreground">Time</span>
      </div>

      {/* Time slots */}
      {TIME_SLOTS.map((slot, index) => (
        <div
          key={index}
          className={cn(
            "h-12 flex items-start justify-end pr-3 pt-1 transition-colors",
            slot.minute === 0
              ? "border-b-2 border-slate-400" // Hour marker - bold
              : "border-b border-slate-600 dark:border-slate-500", // 15-min interval - subtle
            // Row highlight when hovered
            hoveredSlotIndex === index && "bg-white/[0.08]"
          )}
        >
          <span className={cn(
            "text-xs font-medium",
            slot.minute === 0 ? "text-slate-300" : "text-time-text",
            // Brighten text when row is hovered
            hoveredSlotIndex === index && "text-slate-200"
          )}>{slot.time}</span>
        </div>
      ))}
    </div>
  );
};
