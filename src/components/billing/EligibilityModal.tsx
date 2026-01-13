import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { checkEligibility } from '@/lib/billing-api';
import type { EligibilityResponse, PatientInsurance } from '@/types/billing';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EligibilityModalProps {
  open: boolean;
  onClose: () => void;
  patient: {
    patient_id: string;
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    primary_insurance?: string;
    primary_subscriber_id?: string;
  };
  patientInsurance?: PatientInsurance;
  onEligibilityChecked?: (result: EligibilityResponse) => void;
  onCreateClaim?: () => void;
}

export function EligibilityModal({
  open,
  onClose,
  patient,
  patientInsurance,
  onEligibilityChecked,
  onCreateClaim,
}: EligibilityModalProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckEligibility = async () => {
    if (!patientInsurance?.id) {
      toast({
        title: 'Insurance Required',
        description: 'Patient must have insurance on file to verify eligibility.',
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const result = await checkEligibility({
        patient_id: patient.patient_id,
        patient_insurance_id: patientInsurance.id,
      });

      if (result.success && result.eligibility) {
        setEligibilityResult(result.eligibility);
        onEligibilityChecked?.(result.eligibility);
        toast({
          title: 'Eligibility Verified',
          description: result.eligibility.is_eligible
            ? 'Patient coverage is active.'
            : 'Patient coverage could not be verified.',
        });
      } else {
        setError(result.error || 'Failed to verify eligibility');
        toast({
          title: 'Verification Failed',
          description: result.error || 'Unable to verify insurance eligibility.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Insurance Verification</DialogTitle>
          <DialogDescription>
            Verify patient insurance eligibility and coverage details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Patient Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Patient</h4>
            <div className="space-y-1">
              <p className="font-semibold">
                {patient.last_name}, {patient.first_name}
              </p>
              {patient.date_of_birth && (
                <p className="text-sm text-muted-foreground">
                  DOB: {formatDate(patient.date_of_birth)}
                </p>
              )}
            </div>
          </div>

          {/* Insurance Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Insurance</h4>
            {patientInsurance ? (
              <div className="space-y-1">
                <p className="font-semibold">
                  {patientInsurance.insurance_carrier?.name || patient.primary_insurance || 'Unknown'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Member ID: {patientInsurance.subscriber_id || patient.primary_subscriber_id || 'N/A'}
                </p>
                {patientInsurance.group_number && (
                  <p className="text-sm text-muted-foreground">
                    Group: {patientInsurance.group_number}
                  </p>
                )}
              </div>
            ) : patient.primary_insurance ? (
              <div className="space-y-1">
                <p className="font-semibold">{patient.primary_insurance}</p>
                <p className="text-sm text-muted-foreground">
                  Member ID: {patient.primary_subscriber_id || 'N/A'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No insurance on file
              </p>
            )}
          </div>

          {/* Loading State */}
          {isChecking && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Verifying coverage...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isChecking && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Verification Failed</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Eligibility Result */}
          {eligibilityResult && !isChecking && (
            <div className="space-y-4">
              {/* Status */}
              <div
                className={cn(
                  'flex items-center gap-3 p-4 rounded-lg border',
                  eligibilityResult.is_eligible
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                )}
              >
                {eligibilityResult.is_eligible ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <p
                    className={cn(
                      'font-semibold',
                      eligibilityResult.is_eligible ? 'text-green-800' : 'text-red-800'
                    )}
                  >
                    {eligibilityResult.is_eligible ? 'Coverage Active' : 'Coverage Issue'}
                  </p>
                  {eligibilityResult.coverage_begin_date && (
                    <p className="text-sm text-muted-foreground">
                      Effective: {formatDate(eligibilityResult.coverage_begin_date)}
                      {eligibilityResult.coverage_end_date &&
                        ` - ${formatDate(eligibilityResult.coverage_end_date)}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Benefits Details */}
              {eligibilityResult.is_eligible && (
                <div className="grid grid-cols-2 gap-3">
                  {eligibilityResult.plan_type && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Plan Type</p>
                      <p className="font-semibold">{eligibilityResult.plan_type}</p>
                    </div>
                  )}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Copay</p>
                    <p className="font-semibold">{formatCurrency(eligibilityResult.copay)}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Deductible</p>
                    <p className="font-semibold">{formatCurrency(eligibilityResult.deductible)}</p>
                    {eligibilityResult.deductible_remaining !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(eligibilityResult.deductible_remaining)} remaining
                      </p>
                    )}
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Out-of-Pocket Max</p>
                    <p className="font-semibold">
                      {formatCurrency(eligibilityResult.out_of_pocket_max)}
                    </p>
                    {eligibilityResult.out_of_pocket_remaining !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(eligibilityResult.out_of_pocket_remaining)} remaining
                      </p>
                    )}
                  </div>
                  {eligibilityResult.coinsurance_percent !== undefined && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Coinsurance</p>
                      <p className="font-semibold">{eligibilityResult.coinsurance_percent}%</p>
                    </div>
                  )}
                </div>
              )}

              {/* Verification Time */}
              <p className="text-xs text-muted-foreground text-center">
                Verified on {formatDate(eligibilityResult.check_date)}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            {eligibilityResult && (
              <Button variant="outline" onClick={handleCheckEligibility} disabled={isChecking}>
                <RefreshCw className={cn('h-4 w-4 mr-2', isChecking && 'animate-spin')} />
                Re-verify
              </Button>
            )}
            {!eligibilityResult && (
              <Button
                onClick={handleCheckEligibility}
                disabled={isChecking || !patientInsurance}
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Verify Insurance'
                )}
              </Button>
            )}
            {eligibilityResult?.is_eligible && onCreateClaim && (
              <Button onClick={onCreateClaim}>Create Claim</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EligibilityModal;
