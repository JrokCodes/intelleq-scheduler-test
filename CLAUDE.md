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

## SECURITY MIGRATION (In Progress)

### Current Vulnerabilities (CRITICAL)
These credentials are **exposed in client-side JavaScript**:

```typescript
// src/lib/constants.ts:32 - PASSWORD EXPOSED
export const AUTH_PASSWORD = 'intelleq2025';

// src/lib/api.ts:4 - API KEY EXPOSED
const API_KEY = 'IntelleQ_Lvbl_2025_xK9mPqR3vT7wZ2nL';
```

### Target Architecture
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

### New API Endpoints (Python Backend)
**Base URL**: `https://api.intelleqn8n.net`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/login` | POST | Login → returns JWT |
| `/auth/verify` | GET | Verify token validity |
| `/quinio/appointments` | GET | Get appointments (requires auth) |
| `/quinio/patients` | GET | Search patients (requires auth) |

### Migration Steps
1. **Remove hardcoded password** from `constants.ts`
2. **Remove API key** from `api.ts`
3. **Add JWT auth service** - store token in memory/localStorage
4. **Update API calls** to use `Authorization: Bearer <token>` header
5. **Point to Python backend** instead of n8n webhooks

---

## Quick Reference

### Current Authentication (Insecure)
- **App Password**: `intelleq2025`
- **API Key Header**: `X-API-Key: IntelleQ_Lvbl_2025_xK9mPqR3vT7wZ2nL`
- **Base URL**: `https://intelleqn8n.net/webhook/`

### New Authentication (Secure - TODO)
- **Login**: POST to `/auth/login` with `{practice: "quinio", password: "..."}`
- **Token Storage**: In memory (not localStorage for security)
- **API Calls**: `Authorization: Bearer <jwt_token>`
- **Base URL**: `https://api.intelleqn8n.net`

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
│   │   ├── api.ts               # API functions (CONTAINS API KEY - FIX!)
│   │   ├── constants.ts         # Config (CONTAINS PASSWORD - FIX!)
│   │   └── utils.ts             # Utilities
│   ├── components/
│   │   ├── auth/                # Authentication components
│   │   ├── calendar/            # Calendar grid components
│   │   ├── booking/             # Appointment booking
│   │   └── ui/                  # shadcn/ui components
│   ├── pages/
│   │   └── Index.tsx            # Main calendar page
│   └── types/
│       └── calendar.ts
└── package.json
```

---

## API Endpoints (Current - n8n)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/lovable-appointments` | GET | Fetch appointments |
| `/lovable-search-patients` | GET | Patient search |
| `/lovable-add-patient` | POST | Add new patient |
| `/lovable-create-appointment` | POST | Book appointment |
| `/lovable-delete-appointment` | DELETE | Cancel appointment |
| `/lovable-create-event-block` | POST | Create time block |
| `/lovable-delete-event-block` | DELETE | Delete time block |

---

## Integration Points

### PostgreSQL (AWS RDS)
- **Host**: `quinio-patient-db.c34gcwe4cjgc.us-east-2.rds.amazonaws.com`
- **Database**: `postgres`
- **User**: `quinio_admin`
- **Tables**: patients, appointments, event_blocks, holidays

### Python Backend (NEW)
- **URL**: `https://api.intelleqn8n.net`
- **Code**: `C:\Users\jrok1\intelleq-library-temp\backend`
- **EC2 Path**: `/home/ubuntu/intelleq-backend/backend`

---

## Instructions for Claude

When working on this project:

1. **Security First** - Never commit passwords or API keys
2. **Hawaii timezone (UTC-10)** - Always include `-10:00` offset
3. **Follow Lovable patterns** - Use shadcn/ui, React, TypeScript
4. **Test locally** - Run `npm run dev` before pushing
5. **Commit carefully** - Changes auto-deploy via Lovable sync

### Key Files to Modify for Security Migration
- `src/lib/constants.ts` - Remove PASSWORD
- `src/lib/api.ts` - Remove API_KEY, add JWT auth
- `src/components/auth/` - Update login to use JWT

---

## Related Projects

- **Tsai Calendar**: `C:\Users\jrok1\tsai-staff-scheduler-temp`
- **Python Backend**: `C:\Users\jrok1\intelleq-library-temp\backend`
- **IntelleQ Library**: `C:\Users\jrok1\intelleq-library-temp`
