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

## Local Setup

### Prerequisites

- Python 3.12+, [uv](https://docs.astral.sh/uv/) package manager
- Node.js 20+, [pnpm](https://pnpm.io/)
- MongoDB Atlas account (free M0 tier)
- Upstash Redis account (free tier, TLS enabled)

### Backend

```bash
cd backend

# Install dependencies
python -m uv sync

# Create .env (see Backend Environment below)
cp .env.example .env   # then fill in your keys

# Start dev server
python -m uv run uvicorn app.main:app --reload --port 8000
```

**Backend Environment** (`backend/.env`):

```env
MONGODB_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/?appName=RouteGenie
MONGODB_DB_NAME=RouteGenie

REDIS_URL=rediss://default:<token>@<host>:6379

JWT_SECRET=<32+ char random string>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

GROQ_API_KEY=<your groq key>
GROQ_MODEL=llama-3.3-70b-versatile

UNSPLASH_ACCESS_KEY=<your unsplash key>

ALLOWED_ORIGINS=http://localhost:5173
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Create .env
echo "VITE_API_BASE_URL=http://localhost:8000/api/v1" > .env

# Start dev server
pnpm dev
```

### Health check

Once both servers are running, visit:
- API docs: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- Health: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)
- Frontend: [http://localhost:5173](http://localhost:5173)

---

## Roadmap

- [x] Phase 1 — Auth, core API, design system
- [ ] Phase 2 — Trip & booking CRUD, dashboard, external APIs
- [ ] Phase 3 — LangGraph AI agent with SSE streaming chat
- [ ] Phase 4 — Landing page, profile, responsive audit, CI/CD

---

## License

MIT
