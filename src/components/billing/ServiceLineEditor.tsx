import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { APPOINTMENT_TYPE_CPT_CODES, CPT_MODIFIERS } from '@/lib/constants';
import type { CreateClaimLineRequest } from '@/types/billing';
import { cn } from '@/lib/utils';

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

interface ServiceLineEditorProps {
  appointmentType?: string;
  lines: ServiceLine[];
  onChange: (lines: ServiceLine[]) => void;
  diagnosisCount?: number;
  className?: string;
}

// Common CPT codes for quick selection
const QUICK_CPT_CODES = [
  { code: '99211', description: 'Office Visit Lvl 1', fee: 50.00 },
  { code: '99212', description: 'Office Visit Lvl 2', fee: 100.00 },
  { code: '99213', description: 'Office Visit Lvl 3', fee: 150.00 },
  { code: '99214', description: 'Office Visit Lvl 4', fee: 200.00 },
  { code: '99215', description: 'Office Visit Lvl 5', fee: 275.00 },
  { code: '99203', description: 'New Patient Lvl 3', fee: 200.00 },
  { code: '99204', description: 'New Patient Lvl 4', fee: 300.00 },
  { code: '99396', description: 'Preventive 40-64', fee: 250.00 },
  { code: 'G0439', description: 'Medicare AWV', fee: 125.00 },
  { code: '99392', description: 'Well Child 1-4 yr', fee: 200.00 },
  { code: '90471', description: 'Immunization Admin', fee: 25.00 },
  { code: '36415', description: 'Venipuncture', fee: 10.00 },
];

export function ServiceLineEditor({
  appointmentType,
  lines,
  onChange,
  diagnosisCount = 0,
  className,
}: ServiceLineEditorProps) {
  // Auto-add default line based on appointment type
  useEffect(() => {
    if (lines.length === 0 && appointmentType) {
      const mapping = APPOINTMENT_TYPE_CPT_CODES[appointmentType];
      if (mapping) {
        onChange([
          {
            id: crypto.randomUUID(),
            cpt_code: mapping.code,
            cpt_description: mapping.description,
            units: 1,
            charge_amount: mapping.fee,
            diagnosis_pointers: diagnosisCount > 0 ? [1] : [],
          },
        ]);
      }
    }
  }, [appointmentType, lines.length, diagnosisCount, onChange]);

  const addLine = () => {
    onChange([
      ...lines,
      {
        id: crypto.randomUUID(),
        cpt_code: '',
        units: 1,
        charge_amount: 0,
        diagnosis_pointers: diagnosisCount > 0 ? [1] : [],
      },
    ]);
  };

  const removeLine = (id: string) => {
    onChange(lines.filter((line) => line.id !== id));
  };

  const updateLine = (id: string, updates: Partial<ServiceLine>) => {
    onChange(
      lines.map((line) => (line.id === id ? { ...line, ...updates } : line))
    );
  };

  const handleCPTSelect = (id: string, cptCode: string) => {
    const quickCode = QUICK_CPT_CODES.find((c) => c.code === cptCode);
    if (quickCode) {
      updateLine(id, {
        cpt_code: quickCode.code,
        cpt_description: quickCode.description,
        charge_amount: quickCode.fee,
      });
    } else {
      updateLine(id, { cpt_code: cptCode });
    }
  };

  const totalCharge = lines.reduce(
    (sum, line) => sum + line.charge_amount * line.units,
    0
  );

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Service Lines</Label>
        <Button type="button" variant="outline" size="sm" onClick={addLine}>
          <Plus className="h-4 w-4 mr-1" />
          Add Line
        </Button>
      </div>

      {lines.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>No service lines added.</p>
          <p className="text-sm">Click "Add Line" to add a procedure code.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lines.map((line, index) => (
            <div
              key={line.id}
              className="border rounded-lg p-4 space-y-3 bg-muted/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Line {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLine(line.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* CPT Code */}
                <div className="col-span-2 sm:col-span-1">
                  <Label className="text-xs">CPT Code</Label>
                  <Select
                    value={line.cpt_code}
                    onValueChange={(value) => handleCPTSelect(line.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select CPT code" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUICK_CPT_CODES.map((cpt) => (
                        <SelectItem key={cpt.code} value={cpt.code}>
                          <span className="font-mono">{cpt.code}</span>
                          <span className="ml-2 text-muted-foreground">
                            - {cpt.description}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Modifier */}
                <div>
                  <Label className="text-xs">Modifier</Label>
                  <Select
                    value={line.modifier1 || ''}
                    onValueChange={(value) =>
                      updateLine(line.id, {
                        modifier1: value === 'none' ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {Object.values(CPT_MODIFIERS).map((mod) => (
                        <SelectItem key={mod.code} value={mod.code}>
                          <span className="font-mono">{mod.code}</span>
                          <span className="ml-2 text-muted-foreground text-xs">
                            - {mod.description}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Units */}
                <div>
                  <Label className="text-xs">Units</Label>
                  <Input
                    type="number"
                    min={1}
                    value={line.units}
                    onChange={(e) =>
                      updateLine(line.id, {
                        units: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    className="w-full"
                  />
                </div>

                {/* Charge */}
                <div>
                  <Label className="text-xs">Charge ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={line.charge_amount}
                    onChange={(e) =>
                      updateLine(line.id, {
                        charge_amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full"
                  />
                </div>

                {/* Diagnosis Pointers */}
                {diagnosisCount > 0 && (
                  <div className="col-span-2">
                    <Label className="text-xs">Diagnosis Pointers</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Array.from({ length: diagnosisCount }, (_, i) => i + 1).map(
                        (num) => (
                          <Button
                            key={num}
                            type="button"
                            variant={
                              line.diagnosis_pointers.includes(num)
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => {
                              const pointers = line.diagnosis_pointers.includes(num)
                                ? line.diagnosis_pointers.filter((p) => p !== num)
                                : [...line.diagnosis_pointers, num].sort();
                              updateLine(line.id, { diagnosis_pointers: pointers });
                            }}
                          >
                            {num}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Line Total */}
              <div className="flex justify-end text-sm">
                <span className="text-muted-foreground">Line Total:</span>
                <span className="ml-2 font-semibold">
                  ${(line.charge_amount * line.units).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      {lines.length > 0 && (
        <div className="flex justify-end pt-2 border-t">
          <div className="text-right">
            <span className="text-muted-foreground">Total Charges:</span>
            <span className="ml-2 text-lg font-bold">${totalCharge.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceLineEditor;
