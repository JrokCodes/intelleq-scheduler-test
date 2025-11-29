import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, LogOut, RefreshCw, Clock, HelpCircle } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { AUTH_STORAGE_KEY } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { DatePickerModal } from '@/components/calendar/DatePickerModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [helpOpen, setHelpOpen] = useState(false);
  
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
            size="icon"
            onClick={() => setHelpOpen(true)}
            className="h-9 w-9 border-border hover:bg-accent"
            title="Help & Quick Reference"
          >
            <HelpCircle className="h-4 w-4" />
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

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-2xl max-sm:max-w-full max-sm:h-full max-sm:max-h-full">
          <DialogHeader>
            <DialogTitle>IntelleQ Calendar - Quick Guide</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 text-sm">
            {/* Daily Workflow */}
            <div>
              <h3 className="font-semibold mb-2">Daily Workflow</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Morning: Check Akamai for today</li>
                <li>During day: Use IntelleQ for future</li>
              </ul>
            </div>

            {/* Quick Reference */}
            <div>
              <h3 className="font-semibold mb-2">Quick Reference</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border px-3 py-2 text-left">Scenario</th>
                      <th className="border border-border px-3 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border px-3 py-2">Same-day NEW booking</td>
                      <td className="border border-border px-3 py-2">Akamai only</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-3 py-2">Same-day RESCHEDULE</td>
                      <td className="border border-border px-3 py-2">Delete IntelleQ → Add Akamai</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-3 py-2">Future booking</td>
                      <td className="border border-border px-3 py-2">IntelleQ Calendar</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-3 py-2">Cancel future appt</td>
                      <td className="border border-border px-3 py-2">Delete from IntelleQ</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-3 py-2">Red pulsing slot</td>
                      <td className="border border-border px-3 py-2">AI booking - wait 30 sec</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-3 py-2">Robot badge</td>
                      <td className="border border-border px-3 py-2">AI-booked (treat same)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Rules */}
            <div>
              <h3 className="font-semibold mb-2">Key Rules</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>IntelleQ = future only</li>
                <li>Akamai = today + billing</li>
                <li>Red pulsing = don't click</li>
                <li>Check both to avoid double-booking</li>
              </ol>
            </div>

            {/* Login Info */}
            <div className="pt-4 border-t border-border text-muted-foreground">
              <p className="text-xs">Login: intelleq2025</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};
