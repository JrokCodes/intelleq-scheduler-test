import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, LogOut, RefreshCw, Clock } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { AUTH_STORAGE_KEY } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { DatePickerModal } from '@/components/calendar/DatePickerModal';

interface HeaderProps {
  currentWeekStart: Date;
  onWeekChange: (date: Date) => void;
  onLogout: () => void;
  onRefresh: () => void;
  onBlockTime: () => void;
  onJumpToToday: () => void;
  lastUpdated: Date | null;
  isRefreshing: boolean;
}

export const Header = ({ currentWeekStart, onWeekChange, onLogout, onRefresh, onBlockTime, onJumpToToday, isRefreshing }: HeaderProps) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekRange = `${format(currentWeekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  const handlePreviousWeek = () => {
    onWeekChange(subWeeks(currentWeekStart, 1));
  };

  const handleNextWeek = () => {
    onWeekChange(addWeeks(currentWeekStart, 1));
  };

  const handleDateSelect = (date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    onWeekChange(weekStart);
    setDatePickerOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    onLogout();
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: App Name */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">IntelleQ Calendar</h1>
        </div>

        {/* Center: Week Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousWeek}
            className="h-9 w-9 border-border hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="min-w-[200px] text-center">
            <span className="text-sm font-medium text-foreground">{weekRange}</span>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextWeek}
            className="h-9 w-9 border-border hover:bg-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setDatePickerOpen(true)}
            className="h-9 w-9 border-border hover:bg-accent ml-2"
            title="Jump to date"
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>

        {/* Right: Actions & Logout */}
        <div className="flex-1 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onJumpToToday}
            className="border-border hover:bg-accent"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBlockTime}
            className="border-border hover:bg-accent"
          >
            <Clock className="h-4 w-4 mr-2" />
            Block Time
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border-border hover:bg-accent"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-border hover:bg-accent"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <DatePickerModal
        open={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        onDateSelect={handleDateSelect}
        title="Jump to Date"
        selectedDate={currentWeekStart}
      />
    </header>
  );
};
