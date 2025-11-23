import { useState, useEffect, useCallback } from 'react';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { LoginForm } from '@/components/auth/LoginForm';
import { Header } from '@/components/layout/Header';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { BookingModal } from '@/components/booking/BookingModal';
import { AUTH_STORAGE_KEY } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { fetchAppointments } from '@/lib/api';
import { Appointment, EventBlock, Holiday } from '@/types/calendar';
import { RefreshCw } from 'lucide-react';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [eventBlocks, setEventBlocks] = useState<EventBlock[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    provider: string;
    providerName: string;
    date: Date;
    time: string;
  } | null>(null);
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

  // Check auth on mount
  useEffect(() => {
    const isAuth = localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    setIsAuthenticated(isAuth);
  }, []);

  // Fetch appointments function
  const loadAppointments = useCallback(async (showToast = false) => {
    if (!isAuthenticated) return;
    
    try {
      setIsRefreshing(true);
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      const startDate = format(currentWeekStart, 'yyyy-MM-dd');
      const endDate = format(weekEnd, 'yyyy-MM-dd');
      
      console.log('📅 [Calendar] Loading appointments for week:', {
        weekStart: format(currentWeekStart, 'yyyy-MM-dd'),
        weekEnd: format(weekEnd, 'yyyy-MM-dd'),
        startDate,
        endDate
      });
      
      const apiUrl = `https://intelleqn8n.net/webhook/lovable-appointments?start_date=${startDate}&end_date=${endDate}`;
      
      setDebugInfo(prev => ({
        ...prev,
        lastApiUrl: apiUrl,
        dateRange: `${startDate} to ${endDate}`
      }));
      
      const data = await fetchAppointments(startDate, endDate);
      
      console.log('📊 [Calendar] Received data:', {
        success: data.success,
        appointments: data.appointments,
        appointmentsCount: data.appointments?.length || 0,
        eventBlocks: data.event_blocks,
        holidays: data.holidays
      });
      
      // Check if we have appointments data (API may not return 'success' field)
      if (data.appointments) {
        setAppointments(data.appointments);
        setEventBlocks(data.event_blocks || []);
        setHolidays(data.holidays || []);
        setLastUpdated(new Date());
        
        setDebugInfo(prev => ({
          ...prev,
          lastApiStatus: '✅ Success',
          appointmentsCount: data.appointments?.length || 0
        }));
        
        console.log('✅ [Calendar] State updated:', {
          appointmentsSet: data.appointments?.length || 0,
          eventBlocksSet: data.event_blocks?.length || 0,
          holidaysSet: data.holidays?.length || 0
        });
        
        // Log sample appointments for debugging
        if (data.appointments && data.appointments.length > 0) {
          console.log('📋 [Calendar] Sample appointments:');
          data.appointments.slice(0, 3).forEach(apt => {
            console.log({
              patient: apt.patient_name,
              provider: apt.provider,
              start_time: apt.start_time,
              duration: apt.duration_minutes
            });
          });
        }
        
        if (showToast) {
          toast({
            title: "Calendar refreshed",
            description: "Latest appointment data loaded successfully.",
          });
        }
      }
    } catch (error) {
      console.error('❌ [Calendar] Failed to fetch appointments:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
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

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleRefresh = () => {
    loadAppointments(true);
  };

  const handleSlotClick = (slotInfo: { provider: string; providerName: string; date: Date; time: string }) => {
    setSelectedSlot(slotInfo);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    loadAppointments();
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
          
          {/* Debug Panel - Only in development */}
          {import.meta.env.DEV && (
            <div className="absolute top-20 left-8 bg-card border border-border rounded-md p-3 shadow-lg z-10 text-xs space-y-1 max-w-md">
              <div className="font-semibold text-primary mb-2">🔧 Debug Panel</div>
              <div className="text-muted-foreground">
                <strong>Date Range:</strong> {debugInfo.dateRange || 'Not set'}
              </div>
              <div className="text-muted-foreground">
                <strong>API Status:</strong> {debugInfo.lastApiStatus}
              </div>
              <div className="text-muted-foreground">
                <strong>Appointments:</strong> {debugInfo.appointmentsCount}
              </div>
              <div className="text-muted-foreground break-all">
                <strong>Last URL:</strong> {debugInfo.lastApiUrl || 'N/A'}
              </div>
              <div className="text-muted-foreground">
                <strong>Calendar Week:</strong> {format(currentWeekStart, 'MMM dd')} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), 'MMM dd, yyyy')}
              </div>
            </div>
          )}
          
        <CalendarGrid
          weekStart={currentWeekStart}
          appointments={appointments}
          eventBlocks={eventBlocks}
          holidays={holidays}
          isLoading={isLoading}
          onSlotClick={handleSlotClick}
        />

        <BookingModal
          open={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          slotInfo={selectedSlot}
          onBookingSuccess={handleBookingSuccess}
        />
        </div>
      </main>
    </div>
  );
};

export default Index;
