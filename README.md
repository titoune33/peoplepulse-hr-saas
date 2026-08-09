# PeoplePulse — HR Analytics That Actually Works

Unified people analytics across your entire HR stack. Real reports, AI-powered insights, zero technical expertise required.

## Problem

**58% of organizations** rely on 4+ HR systems, and **17% juggle 10+ tools**. HR directors spend more time navigating between platforms than doing strategic work. Existing HRIS reporting is broken everywhere — Paylocity ("a mess"), Workday ("requires deep data knowledge"), BambooHR ("shallow analytics"). **67% of HR leaders** plan to switch their HCM platform within 12 months.

## Solution

PeoplePulse connects to your existing HRIS (Workday, BambooHR, Paylocity, Rippling) and provides:

- **Real-time dashboards** — turnover, retention, headcount, compensation, eNPS
- **AI-powered insights** — proactive alerts for attrition risk, pay gaps, compliance
- **One-click reports** — SOC 2, GDPR, diversity, compensation in seconds
- **Predictive analytics** — forecast who's at risk of leaving before they do

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| Charts | Recharts |
| Backend | Hono.js, TypeScript |
| Database | SQLite (better-sqlite3) + Drizzle ORM |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| AI | Hugging Face Inference API (Mistral 7B) |
| Payments | Stripe |
| Deployment | Netlify (frontend) + Railway (backend) |

## Quick Start

**Prerequisites:** Node.js ≥ 22, npm

```bash
git clone https://github.com/YOUR_USERNAME/peoplepulse.git
cd peoplepulse

# Frontend
npm install
npm run dev          # http://localhost:3001

# Backend
cd backend
npm install
npm run seed         # Populate demo data
npm run dev          # http://localhost:3002
```

## Environment Variables

**Frontend** (`.env`):
```
NEXT_PUBLIC_API_URL=http://localhost:3002
```

**Backend** (`backend/.env`):
```
PORT=3002
FRONTEND_URL=http://localhost:3001
JWT_SECRET=your-secret-here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
HUGGINGFACE_API_KEY=hf_...
```

**Free API Keys:**
| Service | How to Get | Cost |
|---------|-----------|------|
| Hugging Face | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | Free |
| Stripe | [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys) | Free (test) |

## Project Structure

```
peoplepulse/
├── src/
│   ├── app/               # Pages (dashboard, employees, reports, insights, settings, login, register, pricing)
│   ├── components/
│   │   ├── ui/            # shadcn/ui primitives
│   │   ├── layout/        # Sidebar
│   │   └── dashboard/     # Dashboard widgets
│   └── lib/               # Utilities, API client, auth context
├── backend/
│   ├── src/
│   │   ├── index.ts       # Hono.js server
│   │   ├── db/            # Drizzle schema + connection
│   │   ├── routes/        # Auth, employees, insights, reports, stripe
│   │   ├── middleware/     # JWT auth
│   │   └── lib/           # Stripe, HuggingFace clients
│   └── data/              # SQLite database
├── netlify.toml           # Netlify config
└── README.md
```

## API Routes (Backend :3002)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Register + get JWT |
| POST | /api/auth/login | No | Login + get JWT |
| GET | /api/auth/me | Yes | Current user |
| GET | /api/employees | Yes | List (paginated, filterable) |
| GET | /api/employees/:id | Yes | Employee detail |
| GET | /api/insights | Yes | AI insights (Pro: HF, Free: basic) |
| GET | /api/reports | Yes | Saved reports |
| POST | /api/reports/generate | Yes | Generate new report |
| POST | /api/stripe/checkout | Yes | Create checkout session |

## Deployment

### Frontend → Netlify
1. Push repo to GitHub
2. Connect to Netlify
3. Set `NEXT_PUBLIC_API_URL` env var
4. Deploy

### Backend → Railway
1. Push repo to GitHub
2. Connect `backend/` to Railway
3. Set env vars (see above)
4. Deploy

## License

MIT
