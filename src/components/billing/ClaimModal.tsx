import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FileText, Send, Save } from 'lucide-react';
import { ServiceLineEditor } from './ServiceLineEditor';
import { DiagnosisSelector } from './DiagnosisSelector';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import { createClaim, submitClaim } from '@/lib/billing-api';
import type {
  Claim,
  CreateClaimRequest,
  CreateClaimLineRequest,
  CreateClaimDiagnosisRequest,
} from '@/types/billing';
import { APPOINTMENT_TYPE_CPT_CODES, PROVIDER_BILLING_INFO } from '@/lib/constants';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ServiceLine {
  id: string;
  cpt_code: string;
  cpt_description?: string;
  modifier1?: string;
  modifier2?: string;
  units: number;
  charge_amount: number;
  diagnosis_pointers: number[];
}

interface Diagnosis {
  id: string;
  sequence_number: number;
  icd10_code: string;
  description?: string;
  is_primary: boolean;
}

interface ClaimModalProps {
  open: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    patient_id: string;
    patient_name: string;
    patient_dob?: string;
    provider: string;
    provider_name?: string;
    start_time: string;
    appointment_type: string;
    duration_minutes?: number;
  };
  patientInsuranceId?: string;
  insuranceName?: string;
  existingClaim?: Claim;
  onClaimCreated?: (claim: Claim) => void;
  onClaimSubmitted?: (claim: Claim) => void;
}

export function ClaimModal({
  open,
  onClose,
  appointment,
  patientInsuranceId,
  insuranceName,
  existingClaim,
  onClaimCreated,
  onClaimSubmitted,
}: ClaimModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<'save' | 'submit' | null>(null);
  const [serviceLines, setServiceLines] = useState<ServiceLine[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);

  // Initialize from existing claim or appointment type
  useEffect(() => {
    if (existingClaim) {
      // Populate from existing claim
      setServiceLines(
        existingClaim.lines.map((line) => ({
          id: line.id,
          cpt_code: line.cpt_code,
          cpt_description: line.cpt_description,
          modifier1: line.modifier1,
          modifier2: line.modifier2,
          units: line.units,
          charge_amount: line.charge_amount,
          diagnosis_pointers: [
            line.diagnosis_pointer1,
            line.diagnosis_pointer2,
            line.diagnosis_pointer3,
            line.diagnosis_pointer4,
          ].filter((p): p is number => p !== undefined),
        }))
      );
      setDiagnoses(
        existingClaim.diagnoses.map((d) => ({
          id: d.id,
          sequence_number: d.sequence_number,
          icd10_code: d.icd10_code,
          description: d.diagnosis_description,
          is_primary: d.is_primary,
        }))
      );
    } else if (appointment.appointment_type && serviceLines.length === 0) {
      // Initialize with default CPT code for appointment type
      const mapping = APPOINTMENT_TYPE_CPT_CODES[appointment.appointment_type];
      if (mapping) {
        setServiceLines([
          {
            id: crypto.randomUUID(),
            cpt_code: mapping.code,
            cpt_description: mapping.description,
            units: 1,
            charge_amount: mapping.fee,
            diagnosis_pointers: [],
          },
        ]);
      }
    }
  }, [existingClaim, appointment.appointment_type]);

  // Update diagnosis pointers when diagnoses change
  useEffect(() => {
    if (diagnoses.length > 0 && serviceLines.length > 0) {
      // Auto-set first diagnosis pointer if none set
      const needsUpdate = serviceLines.some(
        (line) => line.diagnosis_pointers.length === 0
      );
      if (needsUpdate) {
        setServiceLines((lines) =>
          lines.map((line) =>
            line.diagnosis_pointers.length === 0
              ? { ...line, diagnosis_pointers: [1] }
              : line
          )
        );
      }
    }
  }, [diagnoses.length]);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MM/dd/yyyy');
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'h:mm a');
    } catch {
      return '';
    }
  };

  const totalCharges = serviceLines.reduce(
    (sum, line) => sum + line.charge_amount * line.units,
    0
  );

  const handleSave = async (andSubmit: boolean = false) => {
    // Validation
    if (serviceLines.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one service line.',
        variant: 'destructive',
      });
      return;
    }

    if (diagnoses.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one diagnosis code.',
        variant: 'destructive',
      });
      return;
    }

    const invalidLines = serviceLines.filter((line) => !line.cpt_code);
    if (invalidLines.length > 0) {
      toast({
        title: 'Validation Error',
        description: 'All service lines must have a CPT code.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitAction(andSubmit ? 'submit' : 'save');

    try {
      // Build claim request
      const claimRequest: CreateClaimRequest = {
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        patient_insurance_id: patientInsuranceId,
        provider_id: appointment.provider,
        service_date: appointment.start_time.split('T')[0],
        lines: serviceLines.map((line) => ({
          cpt_code: line.cpt_code,
          modifier1: line.modifier1,
          modifier2: line.modifier2,
          units: line.units,
          charge_amount: line.charge_amount,
          diagnosis_pointers: line.diagnosis_pointers,
        })),
        diagnoses: diagnoses.map((d) => ({
          icd10_code: d.icd10_code,
          is_primary: d.is_primary,
        })),
      };

      const response = await createClaim(claimRequest);

      if (response.success && response.claim) {
        toast({
          title: 'Claim Saved',
          description: `Claim ${response.claim.claim_number} has been created.`,
        });
        onClaimCreated?.(response.claim);

        // Submit if requested
        if (andSubmit) {
          const submitResponse = await submitClaim(response.claim.id);
          if (submitResponse.success) {
            toast({
              title: 'Claim Submitted',
              description: `Claim submitted to ${insuranceName || 'payer'}.`,
            });
            onClaimSubmitted?.(response.claim);
            onClose();
          } else {
            toast({
              title: 'Submission Failed',
              description: submitResponse.error || 'Failed to submit claim.',
              variant: 'destructive',
            });
          }
        } else {
          onClose();
        }
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create claim.',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setSubmitAction(null);
    }
  };

  const providerInfo = PROVIDER_BILLING_INFO[appointment.provider as keyof typeof PROVIDER_BILLING_INFO];

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {existingClaim ? 'Edit Claim' : 'Create Claim'}
            {existingClaim && (
              <ClaimStatusBadge status={existingClaim.status} size="sm" />
            )}
          </DialogTitle>
          <DialogDescription>
            {existingClaim
              ? `Claim ${existingClaim.claim_number}`
              : 'Create a new insurance claim for this appointment'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="space-y-6 py-4 pr-4">
            {/* Appointment & Patient Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Appointment</p>
                <p className="font-medium">
                  {formatDate(appointment.start_time)} @ {formatTime(appointment.start_time)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {appointment.appointment_type}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Patient</p>
                <p className="font-medium">{appointment.patient_name}</p>
                {appointment.patient_dob && (
                  <p className="text-sm text-muted-foreground">
                    DOB: {formatDate(appointment.patient_dob)}
                  </p>
                )}
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Provider</p>
                <p className="font-medium">
                  {providerInfo?.billingName || appointment.provider_name || appointment.provider}
                </p>
                {providerInfo?.npi && (
                  <p className="text-sm text-muted-foreground">
                    NPI: {providerInfo.npi}
                  </p>
                )}
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Insurance</p>
                <p className="font-medium">{insuranceName || 'Self-Pay'}</p>
                {patientInsuranceId && (
                  <p className="text-sm text-green-600">Coverage Verified</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Diagnosis Codes */}
            <DiagnosisSelector
              diagnoses={diagnoses}
              onChange={setDiagnoses}
            />

            <Separator />

            {/* Service Lines */}
            <ServiceLineEditor
              appointmentType={appointment.appointment_type}
              lines={serviceLines}
              onChange={setServiceLines}
              diagnosisCount={diagnoses.length}
            />

            <Separator />

            {/* Totals */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Charges</span>
                <span className="text-2xl font-bold">${totalCharges.toFixed(2)}</span>
              </div>
              {patientInsuranceId && (
                <p className="text-sm text-muted-foreground mt-1">
                  Estimated payment will be calculated after claim submission.
                </p>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-between gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={isSubmitting}
            >
              {isSubmitting && submitAction === 'save' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={isSubmitting || !patientInsuranceId}
            >
              {isSubmitting && submitAction === 'submit' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit to {insuranceName || 'Payer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ClaimModal;
