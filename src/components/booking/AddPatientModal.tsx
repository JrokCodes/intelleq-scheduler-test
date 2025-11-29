import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { addPatient } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { DatePickerModal } from '@/components/calendar/DatePickerModal';

interface AddPatientModalProps {
  open: boolean;
  onClose: () => void;
  onPatientAdded: (patient: any) => void;
}

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Non-binary', label: 'Non-binary' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

export const AddPatientModal = ({ open, onClose, onPatientAdded }: AddPatientModalProps) => {
  // Personal Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState<Date>();
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Address
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('HI');
  const [zipCode, setZipCode] = useState('');

  // Insurance
  const [primaryInsurance, setPrimaryInsurance] = useState('');
  const [primarySubscriberId, setPrimarySubscriberId] = useState('');
  const [secondaryInsurance, setSecondaryInsurance] = useState('');
  const [secondarySubscriberId, setSecondarySubscriberId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const clearForm = () => {
    setFirstName('');
    setLastName('');
    setDob(undefined);
    setGender('');
    setPhone('');
    setEmail('');
    setStreetAddress('');
    setCity('');
    setState('HI');
    setZipCode('');
    setPrimaryInsurance('');
    setPrimarySubscriberId('');
    setSecondaryInsurance('');
    setSecondarySubscriberId('');
  };

  const hasFormData = () => {
    return (
      firstName.trim() !== '' ||
      lastName.trim() !== '' ||
      dob !== undefined ||
      gender !== '' ||
      phone.trim() !== '' ||
      email.trim() !== '' ||
      streetAddress.trim() !== '' ||
      city.trim() !== '' ||
      zipCode.trim() !== '' ||
      primaryInsurance.trim() !== '' ||
      primarySubscriberId.trim() !== '' ||
      secondaryInsurance.trim() !== '' ||
      secondarySubscriberId.trim() !== ''
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !dob || !primaryInsurance.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (First Name, Last Name, DOB, and Primary Insurance)',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const patient = await addPatient({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: format(dob, 'yyyy-MM-dd'),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        gender: gender || undefined,
        street_address: streetAddress.trim() || undefined,
        city: city.trim() || undefined,
        state: state || undefined,
        zip_code: zipCode.trim() || undefined,
        primary_insurance: primaryInsurance.trim(),
        primary_subscriber_id: primarySubscriberId.trim() || undefined,
        secondary_insurance: secondaryInsurance.trim() || undefined,
        secondary_subscriber_id: secondarySubscriberId.trim() || undefined,
      });

      toast({
        title: 'Success',
        description: 'Patient added successfully',
      });

      clearForm();
      onPatientAdded(patient);
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add patient',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (hasFormData()) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmed) {
        return;
      }
    }
    clearForm();
    onClose();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => {
        if (hasFormData()) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement)) {
            if (!(e.target instanceof HTMLButtonElement && (e.target as HTMLButtonElement).type === 'submit')) {
              e.preventDefault();
            }
          }
        }}>
          <div className="space-y-6 py-4">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDatePicker(true)}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dob ? format(dob, 'PPP') : <span className="text-muted-foreground">Pick a date</span>}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="808-555-1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="patient@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">Address</h3>
              <div className="space-y-2">
                <Label htmlFor="streetAddress">Street Address</Label>
                <Input
                  id="streetAddress"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Honolulu"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger>
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="96813"
                  />
                </div>
              </div>
            </div>

            {/* Primary Insurance Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">Primary Insurance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryInsurance">Insurance Carrier *</Label>
                  <Input
                    id="primaryInsurance"
                    value={primaryInsurance}
                    onChange={(e) => setPrimaryInsurance(e.target.value)}
                    placeholder="e.g., HMSA, Kaiser"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primarySubscriberId">Subscriber ID</Label>
                  <Input
                    id="primarySubscriberId"
                    value={primarySubscriberId}
                    onChange={(e) => setPrimarySubscriberId(e.target.value)}
                    placeholder="ABC123456"
                  />
                </div>
              </div>
            </div>

            {/* Secondary Insurance Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">Secondary Insurance (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secondaryInsurance">Insurance Carrier</Label>
                  <Input
                    id="secondaryInsurance"
                    value={secondaryInsurance}
                    onChange={(e) => setSecondaryInsurance(e.target.value)}
                    placeholder="e.g., Medicare"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondarySubscriberId">Subscriber ID</Label>
                  <Input
                    id="secondarySubscriberId"
                    value={secondarySubscriberId}
                    onChange={(e) => setSecondarySubscriberId(e.target.value)}
                    placeholder="XYZ789012"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              if (hasFormData()) {
                const confirmed = window.confirm(
                  'Are you sure you want to cancel? Your entered information will be lost.'
                );
                if (confirmed) {
                  clearForm();
                  onClose();
                }
              } else {
                onClose();
              }
            }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Patient'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <DatePickerModal
        open={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={(date) => setDob(date)}
        title="Select Date of Birth"
        selectedDate={dob}
        minDate={new Date('1900-01-01')}
        maxDate={new Date()}
      />
    </Dialog>
  );
};
