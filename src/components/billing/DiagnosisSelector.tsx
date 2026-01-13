import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Trash2, Check, Star, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Diagnosis {
  id: string;
  sequence_number: number;
  icd10_code: string;
  description?: string;
  is_primary: boolean;
}

interface DiagnosisSelectorProps {
  diagnoses: Diagnosis[];
  onChange: (diagnoses: Diagnosis[]) => void;
  className?: string;
}

// Common ICD-10 codes for quick selection (most used in primary care)
const QUICK_ICD10_CODES = [
  { code: 'Z00.00', description: 'General adult exam without abnormal findings', category: 'Wellness' },
  { code: 'I10', description: 'Essential hypertension', category: 'Cardiovascular' },
  { code: 'E11.9', description: 'Type 2 diabetes without complications', category: 'Endocrine' },
  { code: 'E78.5', description: 'Hyperlipidemia, unspecified', category: 'Metabolic' },
  { code: 'E03.9', description: 'Hypothyroidism, unspecified', category: 'Endocrine' },
  { code: 'J06.9', description: 'Acute upper respiratory infection', category: 'Respiratory' },
  { code: 'M54.5', description: 'Low back pain', category: 'MSK' },
  { code: 'F32.9', description: 'Major depressive disorder, single episode', category: 'Mental Health' },
  { code: 'F41.1', description: 'Generalized anxiety disorder', category: 'Mental Health' },
  { code: 'N39.0', description: 'Urinary tract infection', category: 'GU' },
  { code: 'K21.0', description: 'GERD with esophagitis', category: 'GI' },
  { code: 'J45.20', description: 'Mild intermittent asthma', category: 'Respiratory' },
  { code: 'R53.83', description: 'Fatigue', category: 'Symptoms' },
  { code: 'E66.9', description: 'Obesity, unspecified', category: 'Metabolic' },
  { code: 'Z23', description: 'Encounter for immunization', category: 'Immunization' },
];

export function DiagnosisSelector({
  diagnoses,
  onChange,
  className,
}: DiagnosisSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const addDiagnosis = (code: string, description?: string) => {
    const newSequence = diagnoses.length + 1;
    const newDiagnosis: Diagnosis = {
      id: crypto.randomUUID(),
      sequence_number: newSequence,
      icd10_code: code,
      description: description,
      is_primary: diagnoses.length === 0, // First one is primary
    };
    onChange([...diagnoses, newDiagnosis]);
    setOpen(false);
    setSearchValue('');
  };

  const removeDiagnosis = (id: string) => {
    const remaining = diagnoses.filter((d) => d.id !== id);
    // Re-sequence and ensure there's a primary
    const resequenced = remaining.map((d, index) => ({
      ...d,
      sequence_number: index + 1,
      is_primary: index === 0 && !remaining.some((r) => r.is_primary),
    }));
    // Make sure at least one is primary if any exist
    if (resequenced.length > 0 && !resequenced.some((d) => d.is_primary)) {
      resequenced[0].is_primary = true;
    }
    onChange(resequenced);
  };

  const setPrimary = (id: string) => {
    onChange(
      diagnoses.map((d) => ({
        ...d,
        is_primary: d.id === id,
      }))
    );
  };

  const filteredCodes = QUICK_ICD10_CODES.filter(
    (code) =>
      !diagnoses.some((d) => d.icd10_code === code.code) &&
      (code.code.toLowerCase().includes(searchValue.toLowerCase()) ||
        code.description.toLowerCase().includes(searchValue.toLowerCase()))
  );

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Diagnosis Codes</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Diagnosis
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="end">
            <Command>
              <CommandInput
                placeholder="Search ICD-10 codes..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                <CommandEmpty>No matching codes found.</CommandEmpty>
                <CommandGroup heading="Common Diagnoses">
                  {filteredCodes.map((code) => (
                    <CommandItem
                      key={code.code}
                      value={`${code.code} ${code.description}`}
                      onSelect={() => addDiagnosis(code.code, code.description)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">
                            {code.code}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {code.category}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {code.description}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {diagnoses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>No diagnoses added.</p>
          <p className="text-sm">
            Click "Add Diagnosis" to add an ICD-10 code.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {diagnoses.map((diagnosis, index) => (
            <div
              key={diagnosis.id}
              className={cn(
                'flex items-center gap-3 p-3 border rounded-lg bg-muted/20',
                diagnosis.is_primary && 'border-primary/50 bg-primary/5'
              )}
            >
              {/* Sequence Number */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <GripVertical className="h-4 w-4" />
                <span className="w-5 text-center font-mono text-sm">
                  {diagnosis.sequence_number}
                </span>
              </div>

              {/* Code and Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">
                    {diagnosis.icd10_code}
                  </span>
                  {diagnosis.is_primary && (
                    <Badge className="bg-primary text-xs">Primary</Badge>
                  )}
                </div>
                {diagnosis.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {diagnosis.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {!diagnosis.is_primary && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPrimary(diagnosis.id)}
                    title="Set as primary"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDiagnosis(diagnosis.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Helper text */}
      {diagnoses.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Drag to reorder. The first diagnosis marked as Primary will be the
          principal diagnosis on the claim.
        </p>
      )}
    </div>
  );
}

export default DiagnosisSelector;
