import { useState, useEffect } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchPatients } from '@/lib/api';

interface Patient {
  patient_id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone?: string;
  display_name: string;
}

interface PatientSearchProps {
  onSelectPatient: (patient: Patient) => void;
  onAddNewPatient: () => void;
  selectedPatient: Patient | null;
  onClearSelection: () => void;
}

export const PatientSearch = ({
  onSelectPatient,
  onAddNewPatient,
  selectedPatient,
  onClearSelection,
}: PatientSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setPatients([]);
      setShowDropdown(false);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchPatients(searchQuery);
        setPatients(results);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error searching patients:', error);
        setPatients([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelectPatient = (patient: Patient) => {
    onSelectPatient(patient);
    setSearchQuery('');
    setShowDropdown(false);
    setPatients([]);
  };

  if (selectedPatient) {
    return (
      <div className="flex items-center gap-2 p-3 bg-secondary rounded-md border border-border">
        <span className="flex-1 text-sm">
          {selectedPatient.first_name} {selectedPatient.last_name} (DOB: {selectedPatient.date_of_birth})
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search patient by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {isSearching ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Searching...
            </div>
          ) : patients.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              No patients found
            </div>
          ) : (
            <div className="py-1">
              {patients.map((patient) => (
                <button
                  key={patient.patient_id}
                  onClick={() => handleSelectPatient(patient)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                >
                  {patient.first_name} {patient.last_name} (DOB: {patient.date_of_birth})
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onAddNewPatient}
        className="mt-2 w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New Patient
      </Button>
    </div>
  );
};
