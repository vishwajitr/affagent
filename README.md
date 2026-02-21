# AffAgent — AI Voice Calling CRM

A production-ready SaaS CRM for automated voice calling using Twilio with DTMF keypad input detection (Press 1 / Press 2).

---

## Features

- **Upload contacts** via CSV (bulk import)
- **Create campaigns** with custom voice scripts
- **Auto-dial contacts** using Twilio Programmable Voice
- **DTMF input detection** — no AI/speech-to-text required
  - Press `1` → Marks contact as **Interested**
  - Press `2` → Marks contact as **Not Interested**
- **CRM Dashboard** with live metrics and progress bars
- **Contacts table** with search, status filters, and pagination
- **Retry logic** — up to 2 automatic retries for failed calls
- **Real-time status callbacks** from Twilio

---

## Tech Stack

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Frontend  | React 18, TypeScript, Vite, TailwindCSS, TanStack  |
| Backend   | Node.js, Express, TypeScript                        |
| Database  | PostgreSQL + Prisma ORM                             |
| Telephony | Twilio Programmable Voice SDK                       |
| Parsing   | csv-parse                                           |

---

## Project Structure

```
affagent/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Layout, StatsCard, StatusBadge, etc.
│   │   ├── hooks/           # React Query hooks
│   │   ├── pages/           # Dashboard, Contacts, Campaigns
│   │   ├── services/        # Axios API layer
│   │   └── types/           # TypeScript interfaces
│   └── package.json
│
└── server/                  # Express backend
    ├── prisma/
    │   ├── schema.prisma    # Database schema
    │   └── seed.ts          # Seed script
    ├── src/
    │   ├── middleware/      # Error handler
    │   ├── routes/          # campaigns, contacts, webhooks
    │   ├── services/        # twilioService, campaignService
    │   ├── types/           # TypeScript types
    │   ├── utils/           # prisma client, csvParser
    │   └── index.ts         # Express entry point
    └── package.json
```

---

## Prerequisites

- Node.js >= 18
- PostgreSQL database (local or cloud)
- Twilio account with a verified phone number
- [ngrok](https://ngrok.com) for local webhook testing

---

## Setup Instructions

### 1. Clone & Install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/affagent_db"
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1xxxxxxxxxx"
BASE_URL="https://your-ngrok-subdomain.ngrok.io"
PORT=3001
```

> **BASE_URL** must be publicly accessible (use ngrok for local dev).
> Twilio webhooks will POST to `BASE_URL/voice` and `BASE_URL/handle-input`.

### 3. Setup Database

```bash
cd server

# Generate Prisma client
npm run db:generate

# Push schema (development)
npm run db:push

# OR run migrations (production)
npm run db:migrate

# Seed with demo data
npm run db:seed
```

### 4. Run the App

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Frontend: http://localhost:5173
Backend API: http://localhost:3001

### 5. Expose Backend for Twilio Webhooks (Local Dev)

```bash
ngrok http 3001
```

Copy the HTTPS URL (e.g. `https://abc123.ngrok.io`) and set it as `BASE_URL` in your `.env`.

---

## API Endpoints

### Campaigns
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | `/api/campaigns`            | List all campaigns       |
| POST   | `/api/campaigns`            | Create a campaign        |
| GET    | `/api/campaigns/:id`        | Get campaign details     |
| POST   | `/api/campaigns/:id/start`  | Start calling contacts   |
| DELETE | `/api/campaigns/:id`        | Delete campaign          |

### Contacts
| Method | Endpoint                  | Description                       |
|--------|---------------------------|-----------------------------------|
| GET    | `/api/contacts`           | List contacts (paginated, filtered)|
| POST   | `/api/contacts/upload`    | Upload CSV file                   |
| GET    | `/api/contacts/stats`     | Get CRM dashboard stats           |
| DELETE | `/api/contacts/:id`       | Delete a contact                  |

Query params for GET `/api/contacts`:
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `status` — `NOT_CALLED | CALLED | INTERESTED | NOT_INTERESTED | NO_ANSWER | FAILED`
- `search` — searches name and phone

### Twilio Webhooks
| Method | Endpoint        | Description                        |
|--------|-----------------|------------------------------------|
| POST   | `/voice`        | Plays script, collects DTMF digit  |
| POST   | `/handle-input` | Processes digit, updates contact   |
| POST   | `/call-status`  | Twilio status callback             |

---

## CSV Import Format

Create a `.csv` file with these headers:

```csv
name,phone
Alice Johnson,+14155552671
Bob Smith,+14155552672
```

- Phone numbers must include country code (e.g. `+1` for US)
- Duplicate phone numbers will be updated (upsert)

A sample file is available at `server/sample_contacts.csv`.

---

## DTMF Flow

```
Twilio dials contact
        │
        ▼
  [/voice webhook]
  Plays campaign script
  Waits for keypad input (10s timeout)
        │
        ▼
  [/handle-input webhook]
  Digit == "1"  →  Contact: INTERESTED
  Digit == "2"  →  Contact: NOT_INTERESTED
  No input      →  Contact: CALLED (no response)
        │
        ▼
  Plays confirmation message
  Hangs up
```

---

## Retry Logic

Failed calls are retried up to **2 times** with exponential backoff (2s, 4s).

After all retries fail:
- Contact status → `FAILED`
- A failed Call record is saved with `callStatus: FAILED`

---

## Production Deployment

1. Set `NODE_ENV=production`
2. Run `npm run build` in `/server`
3. Set a real `BASE_URL` (your hosted domain)
4. Run `npm run db:migrate` in production
5. Start with `npm start` (serves `dist/index.js`)
6. Configure Twilio webhook URLs in your Twilio console

---

## License

MIT
