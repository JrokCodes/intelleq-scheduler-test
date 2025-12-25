import { useState, useEffect, useCallback } from 'react';
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks } from 'date-fns';
import { LoginForm } from '@/components/auth/LoginForm';
import { Header } from '@/components/layout/Header';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { BookingModal } from '@/components/booking/BookingModal';
import { AppointmentDetailModal } from '@/components/calendar/AppointmentDetailModal';
import { EventBlockModal } from '@/components/eventblock/EventBlockModal';
import { EventBlockDetailModal } from '@/components/calendar/EventBlockDetailModal';
import { SlotActionDialog } from '@/components/calendar/SlotActionDialog';
import { isAuthenticated as checkAuth, verifyToken, logout } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { fetchAppointments } from '@/lib/api';
import { Appointment, EventBlock, Holiday, BookingInProgress } from '@/types/calendar';
import { RefreshCw } from 'lucide-react';

// Convert time from "9:30 AM" format to "09:30" format for EventBlockModal
const convertTo24Hour = (time12h: string): string => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = modifier === 'AM' ? '00' : '12';
  } else if (modifier === 'PM') {
    hours = String(parseInt(hours, 10) + 12);
  }

  return `${hours.padStart(2, '0')}:${minutes}`;
};

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [eventBlocks, setEventBlocks] = useState<EventBlock[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [bookingInProgress, setBookingInProgress] = useState<BookingInProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    provider: string;
    providerName: string;
    date: Date;
    time: string;
  } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [eventBlockModalOpen, setEventBlockModalOpen] = useState(false);
  const [selectedEventBlock, setSelectedEventBlock] = useState<EventBlock | null>(null);
  const [eventBlockDetailModalOpen, setEventBlockDetailModalOpen] = useState(false);
  const [slotActionDialogOpen, setSlotActionDialogOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [debugInfo, setDebugInfo] = useState<{
    lastApiStatus: string;
    lastApiUrl: string;
    appointmentsCount: number;
    dateRange: string;
  }>({
    lastApiStatus: 'Not yet called',
    lastApiUrl: '',
    appointmentsCount: 0,
    dateRange: ''
  });
  const { toast } = useToast();

  // Check auth on mount - verify token is still valid
  useEffect(() => {
    const checkAuthentication = async () => {
      if (checkAuth()) {
        const isValid = await verifyToken();
        setIsAuthenticated(isValid);
      } else {
        setIsAuthenticated(false);
      }
    };
    checkAuthentication();
  }, []);

  // Fetch appointments function
  const loadAppointments = useCallback(async (showToast = false) => {
    if (!isAuthenticated) return;
    
    try {
      setIsRefreshing(true);
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      const startDate = format(currentWeekStart, 'yyyy-MM-dd');
      const endDate = format(weekEnd, 'yyyy-MM-dd');
      
      const apiUrl = `https://api.intelleqn8n.net/quinio/appointments?start_date=${startDate}&end_date=${endDate}`;
      
      setDebugInfo(prev => ({
        ...prev,
        lastApiUrl: apiUrl,
        dateRange: `${startDate} to ${endDate}`
      }));
      
      const data = await fetchAppointments(startDate, endDate);
      
      // Check if we have appointments data (API may not return 'success' field)
      if (data.appointments) {
        setAppointments(data.appointments);
        setEventBlocks(data.event_blocks || []);
        setHolidays(data.holidays || []);
        setBookingInProgress(data.booking_in_progress || []);
        setLastUpdated(new Date());
        
        setDebugInfo(prev => ({
          ...prev,
          lastApiStatus: '✅ Success',
          appointmentsCount: data.appointments?.length || 0
        }));
        
        if (showToast) {
          toast({
            title: "Calendar refreshed",
            description: "Latest appointment data loaded successfully.",
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      
      setDebugInfo(prev => ({
        ...prev,
        lastApiStatus: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
      
      toast({
        title: "Failed to load appointments",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [currentWeekStart, isAuthenticated, toast]);

  // Initial load and week change
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      loadAppointments();
    }
  }, [currentWeekStart, isAuthenticated, loadAppointments]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      loadAppointments();
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, loadAppointments]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentWeekStart(prev => subWeeks(prev, 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentWeekStart(prev => addWeeks(prev, 1));
          break;
        case 't':
        case 'T':
          e.preventDefault();
          setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          loadAppointments(true);
          break;
        case 'Escape':
          e.preventDefault();
          setBookingModalOpen(false);
          setDetailModalOpen(false);
          setEventBlockModalOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loadAppointments]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
  };

  const handleRefresh = () => {
    loadAppointments(true);
  };

  const handleSlotClick = (slotInfo: { provider: string; providerName: string; date: Date; time: string }) => {
    setSelectedSlot(slotInfo);
    setSlotActionDialogOpen(true);
  };

  const handleCreateAppointmentFromSlot = () => {
    setBookingModalOpen(true);
  };

  const handleCreateEventBlockFromSlot = () => {
    setEventBlockModalOpen(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailModalOpen(true);
  };

  const handleBookingSuccess = () => {
    loadAppointments();
  };

  const handleDeleteSuccess = () => {
    loadAppointments();
  };

  const handleEventBlockSuccess = () => {
    loadAppointments();
  };

  const handleJumpToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const handleEventBlockClick = (eventBlock: EventBlock) => {
    setSelectedEventBlock(eventBlock);
    setEventBlockDetailModalOpen(true);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        currentWeekStart={currentWeekStart}
        onWeekChange={setCurrentWeekStart}
        onLogout={handleLogout}
        onRefresh={handleRefresh}
        onJumpToToday={handleJumpToToday}
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
      />
      <main className="flex-1 p-6 overflow-hidden">
        <div className="h-full bg-card rounded-lg border border-border overflow-hidden flex flex-col">
          {/* Refresh indicator */}
          {isRefreshing && (
            <div className="absolute top-20 right-8 bg-card border border-border rounded-md px-3 py-2 shadow-lg z-10 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Refreshing...</span>
            </div>
          )}
          
        <CalendarGrid
          weekStart={currentWeekStart}
          appointments={appointments}
          eventBlocks={eventBlocks}
          holidays={holidays}
          bookingInProgress={bookingInProgress}
          isLoading={isLoading}
          onSlotClick={handleSlotClick}
          onAppointmentClick={handleAppointmentClick}
          onEventBlockClick={handleEventBlockClick}
          onRescheduleSuccess={handleBookingSuccess}
        />

        <BookingModal
          open={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          slotInfo={selectedSlot}
          onBookingSuccess={handleBookingSuccess}
        />

        <AppointmentDetailModal
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          appointment={selectedAppointment}
          appointments={appointments}
          onDeleteSuccess={handleDeleteSuccess}
          onUpdateSuccess={handleBookingSuccess}
        />

        <EventBlockModal
          open={eventBlockModalOpen}
          onClose={() => setEventBlockModalOpen(false)}
          onSuccess={handleEventBlockSuccess}
          defaultDate={selectedSlot?.date || currentWeekStart}
          defaultProvider={selectedSlot?.provider}
          defaultTime={selectedSlot?.time ? convertTo24Hour(selectedSlot.time) : undefined}
        />

        <EventBlockDetailModal
          open={eventBlockDetailModalOpen}
          onClose={() => setEventBlockDetailModalOpen(false)}
          eventBlock={selectedEventBlock}
          onDeleteSuccess={handleDeleteSuccess}
        />

        <SlotActionDialog
          open={slotActionDialogOpen}
          onOpenChange={setSlotActionDialogOpen}
          slotInfo={selectedSlot}
          onCreateAppointment={handleCreateAppointmentFromSlot}
          onCreateEventBlock={handleCreateEventBlockFromSlot}
        />
        </div>
      </main>
    </div>
  );
};

export default Index;
