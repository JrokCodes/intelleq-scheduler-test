import { useState, useEffect } from 'react';
import { startOfWeek } from 'date-fns';
import { LoginForm } from '@/components/auth/LoginForm';
import { Header } from '@/components/layout/Header';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { AUTH_STORAGE_KEY } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const { toast } = useToast();

  // Check auth on mount
  useEffect(() => {
    const isAuth = localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    setIsAuthenticated(isAuth);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleRefresh = () => {
    toast({
      title: "Calendar refreshed",
      description: "Loading latest appointment data...",
    });
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
          <CalendarGrid weekStart={currentWeekStart} />
        </div>
      </main>
    </div>
  );
};

export default Index;
