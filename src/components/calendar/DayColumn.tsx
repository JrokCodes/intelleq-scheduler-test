import { format } from 'date-fns';
import { PROVIDERS, TIME_SLOTS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface DayColumnProps {
  date: Date;
  dayName: string;
}

export const DayColumn = ({ date, dayName }: DayColumnProps) => {
  const dateStr = format(date, 'M/d');

  return (
    <div className="flex flex-col border-r border-border min-w-[160px]">
      {/* Day Header */}
      <div className="h-16 border-b border-border bg-card">
        <div className="text-center py-2">
          <div className="text-sm font-semibold text-foreground">{dayName}</div>
          <div className="text-xs text-muted-foreground">{dateStr}</div>
        </div>
        {/* Provider sub-headers */}
        <div className="flex border-t border-cell-border">
          {PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              className="flex-1 text-center py-1 border-r border-cell-border last:border-r-0"
            >
              <span className="text-xs text-muted-foreground">{provider.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Time slots grid */}
      <div className="flex flex-col">
        {TIME_SLOTS.map((slot, slotIndex) => (
          <div key={slotIndex} className="flex h-12 border-b border-cell-border">
            {PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                className={cn(
                  "flex-1 border-r border-cell-border last:border-r-0 transition-colors",
                  slot.isLunchTime
                    ? "lunch-stripes cursor-not-allowed"
                    : "hover:bg-hover-cell cursor-pointer"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
