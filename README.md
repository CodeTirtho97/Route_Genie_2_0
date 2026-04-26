# RouteGenie 2.0

> **AI-powered travel intelligence platform.** Plan cinematic trips with an autonomous AI agent, smart itinerary builder, and real-time travel data — all in one beautifully designed interface.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, MUI v6, Framer Motion, TanStack Query, Zustand, React Hook Form + Zod |
| **Backend** | FastAPI, Python 3.12, Beanie ODM, Motor (async MongoDB driver) |
| **Database** | MongoDB Atlas |
| **Cache / Rate-limit** | Upstash Redis (TLS) |
| **AI Agent** | LangGraph, Groq (Llama 3.3 70B) |
| **Auth** | JWT (access + refresh) with Redis blacklist |
| **External APIs** | Unsplash, OpenWeatherMap, OpenStreetMap, Exchange Rate API |

---

## Features

- **AI Itinerary Builder** — LangGraph agent generates complete day-by-day trip plans via streaming SSE
- **Trip Management** — Create, edit and manage multiple trips with rich activity details
- **Booking Tracker** — Track flights, hotels, and activities with status indicators
- **Live Travel Data** — Real-time weather forecasts and currency exchange rates
- **Destination Photos** — Auto-populated via Unsplash API
- **Warm Adventure Dark UI** — Cinematic design system with amber/terracotta palette, DM Serif Display typography, and Framer Motion animations
- **Secure Auth** — Sliding-window rate limiting, JWT refresh rotation, Redis token blacklist

---

## Project Structure

```
RouteGenie_2_0/
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── api/v1/        # Route handlers
│   │   ├── core/          # Config, security, logging
│   │   ├── db/            # MongoDB + Redis init
│   │   ├── models/        # Beanie documents (User, Itinerary, Booking)
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Rate limiting, request ID
│   └── pyproject.toml
└── frontend/              # React application
    ├── src/
    │   ├── app/           # Router + providers
    │   ├── components/    # Shared + feature components
    │   ├── pages/         # Auth, Dashboard, Trips, Bookings
    │   ├── services/      # Axios API client + auth service
    │   ├── store/         # Zustand (auth + UI state)
    │   └── theme/         # MUI theme, motion variants
    └── package.json
```

---

## Running Locally

### Prerequisites

- Python 3.12+, [uv](https://docs.astral.sh/uv/) package manager
- Node.js 20+, [pnpm](https://pnpm.io/)
- MongoDB Atlas account (free M0 tier)
- Upstash Redis account (free tier, TLS enabled)

---

### 1 — Backend (FastAPI)

```bash
cd backend

# Install dependencies with uv
uv sync

# Copy the example env and fill in your credentials
cp .env.example .env

# Start the dev server (auto-reloads on file save)
uv run uvicorn app.main:app --reload --port 8000
```

> The API will be live at **http://localhost:8000**

**Required environment variables** (`backend/.env`):

```env
# Database
MONGODB_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/?appName=RouteGenie
MONGODB_DB_NAME=RouteGenie

# Cache / rate-limit (Upstash Redis — TLS URL)
REDIS_URL=rediss://default:<token>@<host>:6379

# Auth
JWT_SECRET=<32+ char random string>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (Resend)
RESEND_API_KEY=<your resend key>
APP_URL=http://localhost:5173/

# AI (Groq — free tier)
GROQ_API_KEY=<your groq key>
GROQ_MODEL=llama-3.3-70b-versatile

# Photos (Unsplash)
UNSPLASH_ACCESS_KEY=<your unsplash key>

# CORS
ALLOWED_ORIGINS=http://localhost:5173
ENVIRONMENT=development
LOG_LEVEL=INFO
```

---

### 2 — Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
pnpm install

# Create the env file
echo "VITE_API_BASE_URL=http://localhost:8000/api/v1" > .env

# Start the dev server (hot module replacement enabled)
pnpm dev
```

> The app will be live at **http://localhost:5173**

**Frontend environment variables** (`frontend/.env`):

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_UNSPLASH_ACCESS_KEY=<your unsplash key>   # optional — for cover image search
VITE_MAP_TILE_URL=https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```

---

### 3 — Verify everything is running

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API (health) | http://localhost:8000/api/v1/health |
| Swagger docs | http://localhost:8000/api/docs |
| ReDoc | http://localhost:8000/api/redoc |

---

## Roadmap

- [x] Phase 1 — Auth, core API, design system
- [ ] Phase 2 — Trip & booking CRUD, dashboard, external APIs
- [ ] Phase 3 — LangGraph AI agent with SSE streaming chat
- [ ] Phase 4 — Landing page, profile, responsive audit, CI/CD

---

## License

MIT
