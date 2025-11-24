import { TIME_SLOTS } from '@/lib/constants';

export const TimeColumn = () => {
  return (
    <div className="flex flex-col border-r border-border bg-card">
      {/* Header spacer to align with day headers */}
      <div className="h-16 border-b border-border flex items-center justify-center px-4">
        <span className="text-xs font-medium text-muted-foreground">Time</span>
      </div>
      
      {/* Time slots */}
      {TIME_SLOTS.map((slot, index) => (
        <div
          key={index}
          className="h-12 border-b border-slate-400 dark:border-slate-500 flex items-start justify-end pr-3 pt-1"
        >
          <span className="text-xs text-time-text font-medium">{slot.time}</span>
        </div>
      ))}
    </div>
  );
};
