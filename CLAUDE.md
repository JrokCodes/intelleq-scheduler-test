# Quinio Family Medicine Staff Calendar - TEST ENVIRONMENT

> **Test environment for Quinio Staff Calendar - uses test database tables**

---

## Project Overview

**App Name**: IntelleQ Scheduler Test
**Purpose**: TEST environment for Quinio Family Medicine staff scheduling
**Platform**: Lovable.dev web application deployed to Vercel
**Git Remote**: https://github.com/JrokCodes/intelleq-scheduler-test.git

---

## This is a TEST Environment

**IMPORTANT**: This app uses TEST database tables:
- `appointments_test` (not `appointments`)
- `patients_test` (not `patients`)
- `event_blocks_test` (not `event_blocks`)
- `booking_in_progress_test` (not `booking_in_progress`)

Changes made here do NOT affect production data.

---

## Development Workflow

### How Changes Propagate
1. **Edit files** in this repo (`C:\Users\jrok1\intelleq-scheduler-test`)
2. **Commit & push** to GitHub (`intelleq-scheduler-test`)
3. **Vercel** auto-deploys from GitHub

### Key Paths
- **Test repo**: `C:\Users\jrok1\intelleq-scheduler-test`
- **Production repo**: `C:\Users\jrok1\intelleq-scheduler-temp`
- **Python backend**: `/home/ubuntu/intelleq-backend/backend/app/routes/calendar_site_flows/quinio_test.py`
- **EC2 server**: `3.142.245.101` (ubuntu@)

---

## Architecture

```
┌─────────────────┐      JWT Token        ┌─────────────────┐
│  TEST Frontend  │ ◄──────────────────► │  Python Backend │
│  (Vercel)       │                       │  (EC2)          │
└─────────────────┘                       └────────┬────────┘
                                                   │
                   /quinio-test/* endpoints        │
                                                   ▼
                                          ┌───────────────┐
                                          │  PostgreSQL   │
                                          │  (AWS RDS)    │
                                          │  *_test tables│
                                          └───────────────┘
```

### Authentication Flow
1. User enters password on login page
2. Frontend POSTs to `/auth/login` with `{practice: "quinio_test", password: "..."}`
3. Backend verifies password hash, returns JWT token
4. Token stored in localStorage (`quinio_test_auth_token`)
5. All API calls include `Authorization: Bearer <token>` header
6. Token expires after 24 hours

---

## API Endpoints (Python Backend)

**Base URL**: `https://api.intelleqn8n.net`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/login` | POST | Login → returns JWT (practice: "quinio_test") |
| `/auth/verify` | GET | Verify token validity |
| `/quinio-test/appointments` | GET | Get appointments (from test table) |
| `/quinio-test/appointments` | POST | Create appointment (in test table) |
| `/quinio-test/appointments/{id}` | DELETE | Delete appointment |
| `/quinio-test/patients` | GET | Search patients (from test table) |
| `/quinio-test/patients` | POST | Add patient (to test table) |
| `/quinio-test/event-blocks` | POST | Create event block (in test table) |
| `/quinio-test/event-blocks/{id}` | DELETE | Delete event block |

---

## Quick Reference

### Authentication
- **Password**: `quinio2025!` (same as production)
- **Token Key**: `quinio_test_auth_token` (localStorage)
- **Practice ID**: `quinio_test`

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

## Fix Workflow

### Testing a Fix:
1. Make changes in this test repo
2. Push to GitHub → Vercel auto-deploys
3. Test on test frontend
4. If fix works, apply same changes to production repo

### Applying to Production:
1. Copy changes to `C:\Users\jrok1\intelleq-scheduler-temp`
2. Push to GitHub
3. Lovable.dev syncs and Vercel deploys

---

## Related Repos

| Environment | Path | GitHub |
|-------------|------|--------|
| **Test** | `C:\Users\jrok1\intelleq-scheduler-test` | JrokCodes/intelleq-scheduler-test |
| **Production** | `C:\Users\jrok1\intelleq-scheduler-temp` | JrokCodes/intelleq-scheduler |

---

*Last updated: 2025-12-24*
