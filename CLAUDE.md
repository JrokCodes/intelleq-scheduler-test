# Quinio Family Medicine Staff Calendar

> **Project-specific instructions for Claude Code**

---

## Project Overview

**App Name**: IntelleQ Scheduler (Quinio Staff Calendar)
**Purpose**: React calendar for Quinio Family Medicine staff scheduling
**Platform**: Lovable.dev web application with two-way GitHub sync
**Lovable Project**: Connected via GitHub sync
**Git Remote**: https://github.com/JrokCodes/intelleq-scheduler.git

---

## Development Workflow

### How Changes Propagate
1. **Edit files** in this repo (`C:\Users\jrok1\intelleq-scheduler-temp`)
2. **Commit & push** to GitHub (`intelleq-scheduler`)
3. **Lovable.dev** auto-syncs changes (two-way sync enabled)
4. **Vercel** auto-deploys from GitHub

### Key Paths
- **This repo**: `C:\Users\jrok1\intelleq-scheduler-temp`
- **Python backend**: `C:\Users\jrok1\intelleq-library-temp\backend`
- **EC2 server**: `3.142.245.101` (ubuntu@)

---

## Architecture (Secure - Implemented Dec 2025)

```
┌─────────────────┐      JWT Token        ┌─────────────────┐
│   Lovable App   │ ◄──────────────────► │  Python Backend │
│   (Vercel)      │                       │  (EC2)          │
└─────────────────┘                       └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌───────────────┐
                                          │  PostgreSQL   │
                                          │  (AWS RDS)    │
                                          └───────────────┘
```

### Authentication Flow
1. User enters password on login page
2. Frontend POSTs to `/auth/login` with `{practice: "quinio", password: "..."}`
3. Backend verifies password hash, returns JWT token
4. Token stored in localStorage (`quinio_auth_token`)
5. All API calls include `Authorization: Bearer <token>` header
6. Token expires after 24 hours

---

## API Endpoints (Python Backend)

**Base URL**: `https://api.intelleqn8n.net`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/login` | POST | Login → returns JWT |
| `/auth/verify` | GET | Verify token validity |
| `/quinio/appointments` | GET | Get appointments for date range |
| `/quinio/appointments` | POST | Create appointment (with conflict check) |
| `/quinio/appointments/{id}` | DELETE | Delete appointment |
| `/quinio/patients` | GET | Search patients |
| `/quinio/patients` | POST | Add patient (with duplicate check) |
| `/quinio/event-blocks` | POST | Create event block |
| `/quinio/event-blocks/{id}` | DELETE | Delete event block |

### Backend Features
- **Conflict detection**: Prevents double-booking appointments
- **Duplicate patient check**: Returns existing patient if name+DOB match
- **Google Sheets logging**: All actions logged with "Staff (Lovable)" source
- **JWT authentication**: 24-hour token expiration

---

## Quick Reference

### Authentication
- **Password**: `quinio2025!`
- **Token Key**: `quinio_auth_token` (localStorage)
- **Practice ID**: `quinio`

### Providers
| ID | Name | Full Name |
|----|------|-----------|
| `cherie` | Cherie | Ng, Cherie - PA |
| `anna_lia` | Anna-Lia | Quinio, Anna-Lia - MD |

### Calendar Settings
- **Hours**: 7:00 AM - 5:00 PM HST
- **Slots**: 15-minute increments
- **Timezone**: Hawaii Standard Time (UTC-10, no DST)

---

## File Structure

```
intelleq-scheduler/
├── CLAUDE.md                    # This file
├── src/
│   ├── App.tsx                  # Main app with routing
│   ├── lib/
│   │   ├── api.ts               # API functions (Python backend)
│   │   ├── auth.ts              # JWT authentication
│   │   ├── constants.ts         # Config
│   │   └── utils.ts             # Utilities
│   ├── components/
│   │   ├── auth/                # Login components
│   │   ├── calendar/            # Calendar grid components
│   │   ├── booking/             # Appointment booking
│   │   ├── eventblock/          # Event block components
│   │   └── ui/                  # shadcn/ui components
│   ├── pages/
│   │   └── Index.tsx            # Main calendar page
│   └── types/
│       └── calendar.ts
└── package.json
```

---

## Integration Points

### PostgreSQL (AWS RDS)
- **Host**: `quinio-patient-db.c34gcwe4cjgc.us-east-2.rds.amazonaws.com`
- **Database**: `quinio_patient_db`
- **Tables**: patients, appointments, event_blocks, holidays, booking_in_progress

### Python Backend
- **URL**: `https://api.intelleqn8n.net`
- **Code**: `C:\Users\jrok1\intelleq-library-temp\backend`
- **EC2 Path**: `/home/ubuntu/intelleq-backend/backend`

### Google Sheets Logging
- **Spreadsheet**: Real Time Logs (Quinio)
- **Source Label**: "Staff (Lovable)" for calendar actions
- **Logs**: schedule, cancel, event_block, delete_block

---

## Instructions for Claude

When working on this project:

1. **Security** - No credentials in client-side code (JWT auth is implemented)
2. **Hawaii timezone (UTC-10)** - All timestamps include offset
3. **Follow Lovable patterns** - Use shadcn/ui, React, TypeScript
4. **Test locally** - Run `npm run dev` before pushing
5. **Commit carefully** - Changes auto-deploy via Lovable sync

---

## Related Projects

- **Tsai Calendar**: `C:\Users\jrok1\tsai-staff-scheduler-temp`
- **Python Backend**: `C:\Users\jrok1\intelleq-library-temp\backend`
- **IntelleQ Library**: `C:\Users\jrok1\intelleq-library-temp`
