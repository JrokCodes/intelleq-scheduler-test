import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  TrendingUp,
  Percent,
  RefreshCw,
  Search,
  Send,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import {
  ClaimStatusBadge,
  KPICard,
  ActionItemsPanel,
  RevenueTrendChart,
  ARAgingChart,
  PayerMixChart,
} from '@/components/billing';
import { getClaims, getBillingStats, batchSubmitClaims } from '@/lib/billing-api';
import { isAuthenticated as checkAuth, verifyToken } from '@/lib/auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { toast } from '@/hooks/use-toast';
import { format, subDays, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import type { Claim, ClaimStatus, BillingStats, ClaimsFilter } from '@/types/billing';
import { AUTH_STORAGE_KEY, CLAIM_STATUS_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

// Mock data for demonstration until backend is ready
const MOCK_STATS: BillingStats = {
  total_claims: 33,
  claims_draft: 2,
  claims_ready: 5,
  claims_submitted: 3,
  claims_accepted: 8,
  claims_rejected: 1,
  claims_paid: 12,
  claims_denied: 2,
  claims_appealed: 0,

  total_charges: 45230,
  total_paid: 38450,
  total_outstanding: 6780,

  first_pass_rate: 96.2,
  avg_days_to_payment: 18,
  ar_days: 12,

  charges_trend_percent: 12,
  collections_trend_percent: 8,
  outstanding_trend_percent: -5,
  ar_days_trend: -2,
  first_pass_trend: 1.2,

  revenue_trend: [
    { month: 'Aug', charges: 32000, collections: 28000 },
    { month: 'Sep', charges: 35000, collections: 31000 },
    { month: 'Oct', charges: 38000, collections: 34000 },
    { month: 'Nov', charges: 41000, collections: 36000 },
    { month: 'Dec', charges: 43000, collections: 37000 },
    { month: 'Jan', charges: 45230, collections: 38450 },
  ],

  ar_aging: {
    current: 15000,
    days_31_60: 8500,
    days_61_90: 3200,
    days_90_plus: 1080,
  },

  payer_mix: [
    { payer_name: 'HMSA', amount: 20350, percentage: 45 },
    { payer_name: 'Medicare', amount: 13570, percentage: 30 },
    { payer_name: 'UHA', amount: 6785, percentage: 15 },
    { payer_name: 'Other', amount: 4525, percentage: 10 },
  ],

  action_items: {
    claims_attention: 5,
    denials_to_work: 3,
    eligibility_failures: 2,
    payments_to_post: 2,
  },
};

const BillingDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [stats, setStats] = useState<BillingStats>(MOCK_STATS);
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
      // Use mock data on error
      setStats(MOCK_STATS);
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  const getDaysInStatus = (claim: Claim): number => {
    const statusDate = claim.submitted_at || claim.created_at;
    if (!statusDate) return 0;
    return differenceInDays(new Date(), new Date(statusDate));
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
        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KPICard
            title="Total Charges"
            value={formatCurrency(stats.total_charges)}
            subtitle={`${stats.total_claims} claims`}
            trend={stats.charges_trend_percent}
            trendLabel="vs last month"
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          />
          <KPICard
            title="Collections"
            value={formatCurrency(stats.total_paid)}
            subtitle={`${stats.claims_paid} paid`}
            trend={stats.collections_trend_percent}
            trendLabel="vs last month"
            icon={<TrendingUp className="h-4 w-4 text-green-500" />}
          />
          <KPICard
            title="Outstanding"
            value={formatCurrency(stats.total_outstanding)}
            subtitle={`${stats.claims_submitted + stats.claims_accepted} pending`}
            trend={stats.outstanding_trend_percent}
            trendLabel="vs last month"
            icon={<Clock className="h-4 w-4 text-yellow-500" />}
          />
          <KPICard
            title="AR Days"
            value={stats.ar_days}
            subtitle="avg days to collect"
            trend={stats.ar_days_trend}
            invertTrend={true}
            trendLabel="vs last month"
            icon={<Clock className="h-4 w-4 text-blue-500" />}
          />
          <KPICard
            title="First-Pass Rate"
            value={`${stats.first_pass_rate?.toFixed(1) || 0}%`}
            subtitle={`${stats.claims_denied} denied`}
            trend={stats.first_pass_trend}
            trendLabel="vs last month"
            icon={<Percent className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RevenueTrendChart data={stats.revenue_trend || []} />
          <PayerMixChart data={stats.payer_mix || []} />
        </div>

        {/* AR Aging + Action Items Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ARAgingChart data={stats.ar_aging || { current: 0, days_31_60: 0, days_61_90: 0, days_90_plus: 0 }} />
          <ActionItemsPanel
            data={stats.action_items || { claims_attention: 0, denials_to_work: 0, eligibility_failures: 0, payments_to_post: 0 }}
            onViewAll={() => {}}
          />
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
                      <TableHead className="text-center">Days</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((claim) => {
                      const daysInStatus = getDaysInStatus(claim);
                      return (
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
                          <TableCell className="text-center">
                            <span
                              className={cn(
                                'text-sm',
                                daysInStatus > 30 && 'text-red-500 font-medium',
                                daysInStatus > 14 && daysInStatus <= 30 && 'text-yellow-500',
                              )}
                            >
                              {daysInStatus}
                            </span>
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
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats by Status */}
        <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {Object.entries(CLAIM_STATUS_CONFIG).map(([status, config]) => {
            const count =
              status === 'draft' ? stats.claims_draft :
              status === 'ready' ? stats.claims_ready :
              status === 'submitted' ? stats.claims_submitted :
              status === 'accepted' ? stats.claims_accepted :
              status === 'rejected' ? stats.claims_rejected :
              status === 'paid' ? stats.claims_paid :
              status === 'denied' ? stats.claims_denied :
              status === 'appealed' ? stats.claims_appealed :
              claims.filter((c) => c.status === status).length;

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
