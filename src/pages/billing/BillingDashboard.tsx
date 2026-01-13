import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DollarSign,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  Send,
  Calendar,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { ClaimStatusBadge } from '@/components/billing/ClaimStatusBadge';
import { getClaims, getBillingStats, batchSubmitClaims } from '@/lib/billing-api';
import { isAuthenticated as checkAuth, verifyToken, logout } from '@/lib/auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { toast } from '@/hooks/use-toast';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import type { Claim, ClaimStatus, BillingStats, ClaimsFilter } from '@/types/billing';
import { AUTH_STORAGE_KEY, CLAIM_STATUS_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

const BillingDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('week');

  // Auth check
  useEffect(() => {
    const checkAuthentication = async () => {
      if (checkAuth()) {
        const isValid = await verifyToken();
        setIsAuthenticated(isValid);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    checkAuthentication();
  }, []);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsRefreshing(true);

      // Build filter
      const filter: ClaimsFilter = {};
      if (statusFilter !== 'all') {
        filter.status = statusFilter as ClaimStatus;
      }
      if (searchQuery) {
        filter.search = searchQuery;
      }
      if (dateRange !== 'all') {
        const now = new Date();
        if (dateRange === 'week') {
          filter.date_from = format(subDays(now, 7), 'yyyy-MM-dd');
        } else if (dateRange === 'month') {
          filter.date_from = format(startOfMonth(now), 'yyyy-MM-dd');
          filter.date_to = format(endOfMonth(now), 'yyyy-MM-dd');
        }
      }

      const [claimsResult, statsResult] = await Promise.all([
        getClaims(filter),
        getBillingStats(),
      ]);

      if (claimsResult.success && claimsResult.data) {
        setClaims(claimsResult.data.claims || []);
      }
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('Failed to load billing data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load billing data.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [isAuthenticated, statusFilter, searchQuery, dateRange]);

  // Load data on auth change or filter change
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
  };

  const handleSelectClaim = (claimId: string, checked: boolean) => {
    const newSelected = new Set(selectedClaims);
    if (checked) {
      newSelected.add(claimId);
    } else {
      newSelected.delete(claimId);
    }
    setSelectedClaims(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const readyClaims = claims
        .filter((c) => c.status === 'ready')
        .map((c) => c.id);
      setSelectedClaims(new Set(readyClaims));
    } else {
      setSelectedClaims(new Set());
    }
  };

  const handleBatchSubmit = async () => {
    if (selectedClaims.size === 0) return;

    setIsSubmitting(true);
    try {
      const result = await batchSubmitClaims(Array.from(selectedClaims));
      if (result.success) {
        toast({
          title: 'Claims Submitted',
          description: `${result.submitted_count} claims submitted successfully.`,
        });
        setSelectedClaims(new Set());
        loadData();
      } else {
        toast({
          title: 'Submission Failed',
          description: result.error || 'Failed to submit claims.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit claims.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'MM/dd/yy');
    } catch {
      return dateStr;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Login
  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const readyClaimsCount = claims.filter((c) => c.status === 'ready').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Calendar
            </Button>
            <h1 className="text-xl font-bold text-foreground">IntelleQ Billing</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')}
              />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Charges</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.total_charges)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.total_claims || 0} total claims
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats?.total_paid)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.claims_paid || 0} paid claims
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(stats?.total_outstanding)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.claims_submitted || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">First-Pass Rate</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.first_pass_rate?.toFixed(1) || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.claims_denied || 0} denied
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>Claims Queue</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search claims..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-[200px]"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.entries(CLAIM_STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Date Range */}
                <Select
                  value={dateRange}
                  onValueChange={(v) => setDateRange(v as any)}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last 7 days</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>

                {/* Batch Submit */}
                {selectedClaims.size > 0 && (
                  <Button
                    onClick={handleBatchSubmit}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Submit ({selectedClaims.size})
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {claims.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No claims found</p>
                <p className="text-sm">
                  Claims will appear here once appointments are billed.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={
                            readyClaimsCount > 0 &&
                            selectedClaims.size === readyClaimsCount
                          }
                          onCheckedChange={handleSelectAll}
                          disabled={readyClaimsCount === 0}
                        />
                      </TableHead>
                      <TableHead>Claim #</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Payer</TableHead>
                      <TableHead>Service Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedClaims.has(claim.id)}
                            onCheckedChange={(checked) =>
                              handleSelectClaim(claim.id, checked as boolean)
                            }
                            disabled={claim.status !== 'ready'}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {claim.claim_number}
                        </TableCell>
                        <TableCell>{claim.patient_name}</TableCell>
                        <TableCell>
                          {claim.insurance_carrier?.name || 'Self-Pay'}
                        </TableCell>
                        <TableCell>{formatDate(claim.service_date)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(claim.total_charge)}
                        </TableCell>
                        <TableCell>
                          <ClaimStatusBadge status={claim.status} size="sm" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/billing/claims/${claim.id}`)
                            }
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats by Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {Object.entries(CLAIM_STATUS_CONFIG).map(([status, config]) => {
            const count = claims.filter((c) => c.status === status).length;
            return (
              <Card
                key={status}
                className={cn(
                  'cursor-pointer hover:bg-muted/50 transition-colors',
                  statusFilter === status && 'ring-2 ring-primary'
                )}
                onClick={() =>
                  setStatusFilter(statusFilter === status ? 'all' : status)
                }
              >
                <CardContent className="p-3 text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground">
                    {config.label}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default BillingDashboard;
