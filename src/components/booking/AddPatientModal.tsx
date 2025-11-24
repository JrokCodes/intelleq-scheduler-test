import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export const AddPatientModal = ({ open, onClose, onPatientAdded }: AddPatientModalProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState<Date>();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Check if form has any data entered
  const hasFormData = () => {
    return firstName.trim() !== '' || lastName.trim() !== '' || dob !== undefined || phone.trim() !== '' || email.trim() !== '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim() || !dob) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
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
      });

      toast({
        title: 'Success',
        description: 'Patient added successfully',
      });

      // Clear form state before closing (no confirmation needed after success)
      setFirstName('');
      setLastName('');
      setDob(undefined);
      setPhone('');
      setEmail('');

      onPatientAdded(patient);
      onClose(); // Close without going through handleClose
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
    // Check if user has entered data
    if (hasFormData()) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmed) {
        return; // Don't close if user cancels
      }
    }

    // Clear form and close
    setFirstName('');
    setLastName('');
    setDob(undefined);
    setPhone('');
    setEmail('');
    onClose();
  };

  // Handle dialog open change (ESC key, click outside)
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // User trying to close dialog
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => {
        // Prevent closing when clicking outside if form has data
        if (hasFormData()) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} onKeyDown={(e) => {
          // Prevent Enter key from submitting form unless user is on submit button
          if (e.key === 'Enter' && (e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement)) {
            // Allow Enter on submit button, prevent on other inputs
            if (!(e.target instanceof HTMLButtonElement && (e.target as HTMLButtonElement).type === 'submit')) {
              e.preventDefault();
            }
          }
        }}>
          <div className="space-y-4 py-4">
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
            <div className="space-y-2">
              <Label>Date of Birth *</Label>
              <Button
                variant="outline"
                onClick={() => setShowDatePicker(true)}
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dob ? format(dob, 'PPP') : <span className="text-muted-foreground">Pick a date</span>}
              </Button>
            </div>
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => {
              // Cancel button - confirm if form has data, otherwise just close
              if (hasFormData()) {
                const confirmed = window.confirm(
                  'Are you sure you want to cancel? Your entered information will be lost.'
                );
                if (confirmed) {
                  setFirstName('');
                  setLastName('');
                  setDob(undefined);
                  setPhone('');
                  setEmail('');
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
