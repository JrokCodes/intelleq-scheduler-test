import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const sections = [
  { id: 'introduction', title: 'Introduction' },
  { id: 'getting-started', title: 'Getting Started' },
  { id: 'calendar-interface', title: 'Calendar Interface' },
  { id: 'daily-workflow', title: 'Daily Workflow' },
  { id: 'booking-appointments', title: 'Booking Appointments' },
  { id: 'managing-appointments', title: 'Managing Appointments' },
  { id: 'same-day-scenarios', title: 'Same-Day Scenarios' },
  { id: 'event-blocks', title: 'Event Blocks' },
  { id: 'ai-integration', title: 'AI Integration' },
  { id: 'real-time-log', title: 'Real-Time Log' },
  { id: 'troubleshooting', title: 'Troubleshooting' },
  { id: 'quick-reference', title: 'Quick Reference' },
];

export default function Documentation() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  const TableOfContents = () => (
    <nav className="space-y-1">
      <h3 className="font-semibold text-sm text-muted-foreground mb-3">Table of Contents</h3>
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className="block w-full text-left text-sm py-1.5 px-3 rounded hover:bg-muted transition-colors"
        >
          {section.title}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10 print:hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Calendar
            </Button>
            <h1 className="text-xl font-bold text-foreground">IntelleQ Calendar Documentation</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-border bg-card sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto print:hidden">
          <div className="p-6">
            <TableOfContents />
          </div>
        </aside>

        {/* Mobile Menu */}
        <div className="lg:hidden fixed bottom-4 right-4 z-20 print:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <TableOfContents />
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-6 lg:px-12 py-8 max-w-4xl">
          <article className="prose prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-td:text-foreground prose-th:text-foreground max-w-none">
            
            {/* Introduction */}
            <section id="introduction" className="mb-12 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">Introduction</h2>
              <p>
                The IntelleQ Calendar is a specialized scheduling system designed for managing future appointments at the clinic.
                It works alongside Akamai (your EHR/billing system) to provide a seamless scheduling experience.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">System Overview</h3>
              <p>IntelleQ Calendar handles all future appointments (any day after today), while Akamai remains your source of truth for:</p>
              <ul>
                <li>Same-day appointments</li>
                <li>Billing and insurance</li>
                <li>Medical records and documentation</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Akamai Integration</h3>
              <p>
                IntelleQ syncs with Akamai overnight. At the end of each day, all appointments scheduled for the next day
                are automatically transferred to Akamai's schedule. This ensures your billing system is always up to date
                without manual data entry.
              </p>
            </section>

            {/* Getting Started */}
            <section id="getting-started" className="mb-12 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">Getting Started</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Login</h3>
              <p>Access the IntelleQ Calendar at your clinic's URL with these credentials:</p>
              <div className="bg-muted p-4 rounded-lg my-4">
                <p className="font-mono text-sm">Username: <strong>intelleq2025</strong></p>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">Browser Requirements</h3>
              <ul>
                <li>Chrome, Firefox, Safari, or Edge (latest versions)</li>
                <li>Internet connection required</li>
                <li>JavaScript must be enabled</li>
              </ul>
            </section>

            {/* Calendar Interface */}
            <section id="calendar-interface" className="mb-12 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">Calendar Interface</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Layout</h3>
              <p>The calendar displays a weekly view with:</p>
              <ul>
                <li><strong>Time column</strong> on the left (8:00 AM - 5:00 PM)</li>
                <li><strong>Provider columns</strong> for each staff member</li>
                <li><strong>Week navigation</strong> buttons at the top</li>
                <li><strong>Action buttons</strong> (Today, Block Time, Refresh, Help, Logout)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Visual Indicators</h3>
              <table className="w-full border-collapse border border-border mt-4">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-2 text-left">Indicator</th>
                    <th className="border border-border px-4 py-2 text-left">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border px-4 py-2">Blue appointment card</td>
                    <td className="border border-border px-4 py-2">Confirmed appointment</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border px-4 py-2">Red pulsing slot</td>
                    <td className="border border-border px-4 py-2">AI booking in progress - do not book</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2">Robot badge 🤖</td>
                    <td className="border border-border px-4 py-2">Appointment booked by AI system</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border px-4 py-2">Gray blocked time</td>
                    <td className="border border-border px-4 py-2">Provider unavailable (lunch, meeting, etc.)</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Daily Workflow */}
            <section id="daily-workflow" className="mb-12 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">Daily Workflow</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Morning Routine</h3>
              <ol>
                <li>Check <strong>Akamai</strong> for today's appointments</li>
                <li>Review any notes or special instructions</li>
                <li>Confirm all patients are scheduled correctly</li>
              </ol>

              <h3 className="text-xl font-semibold mt-6 mb-3">During the Day</h3>
              <ol>
                <li>Use <strong>IntelleQ Calendar</strong> for all future bookings</li>
                <li>Answer phones and schedule appointments as normal</li>
                <li>Check for red pulsing slots before booking</li>
                <li>Use Akamai only for same-day changes</li>
              </ol>
            </section>

            {/* Booking Appointments */}
            <section id="booking-appointments" className="mb-12 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">Booking Appointments</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Step-by-Step Guide</h3>
              <ol>
                <li><strong>Click</strong> on an empty time slot in the provider's column</li>
                <li><strong>Search</strong> for the patient by name or MRN</li>
                <li><strong>Select</strong> the patient from the search results</li>
                <li><strong>Choose</strong> appointment type (New Patient, Follow-up, etc.)</li>
                <li><strong>Add notes</strong> if needed (optional)</li>
                <li><strong>Click</strong> "Book Appointment"</li>
              </ol>

              <h3 className="text-xl font-semibold mt-6 mb-3">Adding New Patients</h3>
              <p>If the patient isn't in the system:</p>
              <ol>
                <li>Click "Add New Patient" in the search modal</li>
                <li>Enter patient's first and last name</li>
                <li>Enter MRN (Medical Record Number)</li>
                <li>Click "Add Patient"</li>
                <li>Patient is now available for booking</li>
              </ol>

              <h3 className="text-xl font-semibold mt-6 mb-3">Appointment Types</h3>
              <ul>
                <li><strong>New Patient</strong> - First visit (typically 30-60 min)</li>
                <li><strong>Follow-up</strong> - Return visit (typically 15-30 min)</li>
                <li><strong>Consultation</strong> - Specialist review (30 min)</li>
                <li><strong>Procedure</strong> - In-office procedure (varies)</li>
              </ul>
            </section>

            {/* Managing Appointments */}
            <section id="managing-appointments" className="mb-12 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">Managing Appointments</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">View Appointment Details</h3>
              <p>Click on any appointment card to see:</p>
              <ul>
                <li>Patient name and MRN</li>
                <li>Appointment type and duration</li>
                <li>Provider and time</li>
                <li>Any special notes</li>
                <li>Who booked it (staff or AI)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Cancel Appointment</h3>
              <ol>
                <li>Click on the appointment card</li>
                <li>Click "Delete Appointment" button</li>
                <li>Confirm deletion</li>
                <li>Appointment is removed from IntelleQ</li>
              </ol>

              <h3 className="text-xl font-semibold mt-6 mb-3">Modify Appointment</h3>
              <p>To change an appointment (time, provider, or date):</p>
              <ol>
                <li>Delete the existing appointment</li>
                <li>Book a new appointment in the desired slot</li>
              </ol>
              <p className="text-muted-foreground text-sm mt-2">
                Note: There is no "move" function - you must delete and rebook.
              </p>
            </section>

            {/* Same-Day Scenarios */}
            <section id="same-day-scenarios" className="mb-12 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">Same-Day Scenarios</h2>
              
              <p className="mb-4">
                For same-day appointments, Akamai is your source of truth. IntelleQ should only be used for future dates.
              </p>

              <table className="w-full border-collapse border border-border mt-4">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-2 text-left">Scenario</th>
                    <th className="border border-border px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border px-4 py-2">Patient calls for same-day NEW appointment</td>
                    <td className="border border-border px-4 py-2">Book in <strong>Akamai only</strong></td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border px-4 py-2">Patient needs to reschedule today's appointment</td>
                    <td className="border border-border px-4 py-2">Delete from IntelleQ → Add to Akamai</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2">Patient wants to move today to future date</td>
                    <td className="border border-border px-4 py-2">Cancel in Akamai → Book in IntelleQ</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border px-4 py-2">Patient cancels same-day appointment</td>
                    <td className="border border-border px-4 py-2">Cancel in <strong>Akamai only</strong></td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Event Blocks */}
            <section id="event-blocks" className="mb-12 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">Event Blocks</h2>
              
              <p>
                Event blocks are used to mark time when a provider is unavailable (lunch, meetings, training, PTO, etc.).
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Creating Event Blocks</h3>
              <ol>
                <li>Click the <strong>"Block Time"</strong> button in the header</li>
                <li>Select the provider</li>
                <li>Choose start time and end time</li>
                <li>Select reason (Lunch, Meeting, Training, PTO, etc.)</li>
                <li>Add optional notes</li>
                <li>Click "Block Time"</li>
              </ol>

              <h3 className="text-xl font-semibold mt-6 mb-3">Deleting Event Blocks</h3>
              <ol>
                <li>Click on the gray event block</li>
                <li>Click "Delete Block" button</li>
                <li>Confirm deletion</li>
              </ol>
            </section>

            {/* AI Integration */}
            <section id="ai-integration" className="mb-12 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">AI Integration</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">What is AI Booking?</h3>
              <p>
                The IntelleQ system includes AI-powered phone answering that can automatically schedule appointments
                when patients call after hours or when all staff are busy.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Red Pulsing Slots</h3>
              <p>When you see a red pulsing slot on the calendar:</p>
              <ul>
                <li>The AI is currently booking an appointment in that time slot</li>
                <li><strong>DO NOT click or book that slot</strong></li>
                <li>Wait 30 seconds for the AI to complete the booking</li>
                <li>The slot will either show a confirmed appointment or become available again</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Robot Badge (🤖)</h3>
              <p>Appointments with a robot badge were booked by the AI system:</p>
              <ul>
                <li>Treat them exactly like staff-booked appointments</li>
                <li>Same cancellation/modification rules apply</li>
                <li>Patient has received confirmation via text/email</li>
              </ul>
            </section>

            {/* Real-Time Log */}
            <section id="real-time-log" className="mb-12 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">Real-Time Log</h2>
              
              <p>
                IntelleQ maintains a detailed log of all scheduling activities for auditing and troubleshooting purposes.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">What Gets Logged</h3>
              <ul>
                <li>Every appointment booking (staff and AI)</li>
                <li>All cancellations and deletions</li>
                <li>Event block creation and removal</li>
                <li>Login and logout events</li>
                <li>System errors and warnings</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">End of Day Sync</h3>
              <p>
                Every night, IntelleQ automatically syncs tomorrow's appointments to Akamai:
              </p>
              <ol>
                <li>System exports all next-day appointments</li>
                <li>Data is formatted for Akamai import</li>
                <li>Appointments appear in Akamai by morning</li>
                <li>Log entry created for sync completion</li>
              </ol>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting" className="mb-12 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">Troubleshooting</h2>
              
              <table className="w-full border-collapse border border-border mt-4">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-2 text-left">Issue</th>
                    <th className="border border-border px-4 py-2 text-left">Solution</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border px-4 py-2">Calendar won't load</td>
                    <td className="border border-border px-4 py-2">Refresh browser (Ctrl+R or Cmd+R). Check internet connection.</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border px-4 py-2">Patient not showing in search</td>
                    <td className="border border-border px-4 py-2">Try searching by MRN. Patient may need to be added to system.</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2">Appointment won't book</td>
                    <td className="border border-border px-4 py-2">Check if slot is red/pulsing. Wait 30 seconds and try again.</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border px-4 py-2">Can't delete appointment</td>
                    <td className="border border-border px-4 py-2">Ensure appointment is in the future. Same-day must be deleted in Akamai.</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2">Double-booked slot</td>
                    <td className="border border-border px-4 py-2">Check Akamai for conflicts. Delete duplicate. Contact IT if issue persists.</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border px-4 py-2">Logged out unexpectedly</td>
                    <td className="border border-border px-4 py-2">Session timeout after inactivity. Log back in with credentials.</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Quick Reference */}
            <section id="quick-reference" className="mb-12 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-4">Quick Reference</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Login Information</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-mono text-sm">Username: <strong>intelleq2025</strong></p>
              </div>

              <h3 className="text-xl font-semibold mt-6 mb-3">Providers</h3>
              <ul>
                <li>Dr. Smith (Column 1)</li>
                <li>Dr. Johnson (Column 2)</li>
                <li>Dr. Williams (Column 3)</li>
                <li>Dr. Brown (Column 4)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Appointment Types</h3>
              <table className="w-full border-collapse border border-border mt-4">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-2 text-left">Type</th>
                    <th className="border border-border px-4 py-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border px-4 py-2">New Patient</td>
                    <td className="border border-border px-4 py-2">30-60 minutes</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border px-4 py-2">Follow-up</td>
                    <td className="border border-border px-4 py-2">15-30 minutes</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2">Consultation</td>
                    <td className="border border-border px-4 py-2">30 minutes</td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td className="border border-border px-4 py-2">Procedure</td>
                    <td className="border border-border px-4 py-2">Varies</td>
                  </tr>
                </tbody>
              </table>

              <h3 className="text-xl font-semibold mt-6 mb-3">Key Rules</h3>
              <ol>
                <li><strong>IntelleQ = future only</strong> (Any days after today)</li>
                <li><strong>Akamai = today + billing</strong></li>
                <li><strong>Red pulsing = don't book</strong> (wait 30 seconds)</li>
                <li><strong>Check both systems</strong> to avoid double-booking</li>
              </ol>
            </section>

          </article>
        </main>
      </div>
    </div>
  );
}
