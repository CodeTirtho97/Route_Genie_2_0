<div align="center">

# RouteGenie 2.0

**Cinematic AI travel intelligence platform.**  
Plan, manage, and track trips with a beautifully designed full-stack application.

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/atlas)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://upstash.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

</div>

---

## Overview

RouteGenie 2.0 is a full-stack travel management application built as a portfolio project. It features a cinematic **Warm Adventure Dark** design system, production-grade JWT auth with Redis token rotation, 4-step trip creation with Pexels cover photos, a bento-grid dashboard with interactive maps, and a booking tracker. An AI itinerary builder powered by LangGraph and Groq is in progress.

---

## Screenshots

> _Add screenshots of Landing, Dashboard, Trip Detail, and Bookings pages here._

---

## Features

### What's Built

| Feature | Details |
|---|---|
| **Auth** | Register + login, JWT access/refresh rotation, Redis token blacklist, per-IP rate limiting |
| **Trip Management** | 4-step creation wizard, edit, delete; Pexels cover photo auto-fetched from destination name |
| **Booking Tracker** | Track flights, hotels, and activities; filter by type and status, grouped per trip |
| **Dashboard** | Bento-grid with trip stats, upcoming trips card, and interactive Leaflet map |
| **Profile** | Edit display name, avatar URL, date of birth, gender, and travel preferences |
| **Photo UX** | Skeleton shimmer + opacity fade-in on every card and hero image while Pexels CDN loads |
| **Design System** | Warm Adventure Dark — amber `#F59E0B` + terracotta `#E85D26`, DM Serif Display + Plus Jakarta Sans, Framer Motion page transitions |

### Coming Soon

| Feature | Details |
|---|---|
| **AI Itinerary Builder** | LangGraph ReAct agent — Router → Clarifier → Planner → Synthesis nodes |
| **AI Agent Chat** | Multi-turn streaming chat via SSE, Groq Llama 3.3 70B, tool-use status badges |
| **Live Travel Data** | Real-time weather forecasts and currency exchange rates per destination |

---

## Tech Stack

**Frontend**

| Package | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | ~6.0 | Type safety |
| MUI | v9 | Component library + theming |
| Framer Motion | v12 | Page & element animations |
| TanStack Query | v5 | Server state + caching |
| Zustand | v5 | Client state (auth + UI) |
| React Hook Form + Zod | v7 / v4 | Form validation |
| React Router | v7 | Client-side routing |
| React-Leaflet | v5 | Interactive trip maps |
| Vite | v8 | Build tool |

**Backend**

| Package | Version | Purpose |
|---|---|---|
| FastAPI | ≥0.136 | Async Python API framework |
| Beanie | 1.26 | Async MongoDB ODM (Motor + Pydantic v2) |
| python-jose | ≥3.5 | JWT encoding / decoding |
| passlib\[bcrypt\] | ≥1.7 | Password hashing |
| redis\[hiredis\] | ≥7.4 | Async Redis client (token blacklist) |
| structlog | ≥25.5 | Structured JSON logging |
| httpx | ≥0.28 | Async HTTP client (Pexels API) |

**Infrastructure**

| Service | Role |
|---|---|
| MongoDB Atlas | Primary database (M0 free tier) |
| Upstash Redis | Token blacklist + rate limiting (serverless TLS) |
| Pexels API | Destination cover photos (server-side, free tier) |
| Render | Backend hosting |
| Vercel | Frontend hosting |

---

## Demo

A demo account is available when running locally with the provided seed:

```
Email:    demo@routegenie.app
Password: Demo@1234
```

---

## Running Locally

### Prerequisites

- Python 3.12+, [`uv`](https://docs.astral.sh/uv/) package manager
- Node.js 20+, [`pnpm`](https://pnpm.io/)
- [MongoDB Atlas](https://mongodb.com/atlas) cluster (free M0)
- [Upstash Redis](https://upstash.com) database (free tier, TLS)
- [Pexels API key](https://www.pexels.com/api/) (free)

---

### 1 — Backend

```bash
cd backend

# Install dependencies
uv sync

# Copy env template and fill in your credentials
cp .env.example .env

# Start the dev server (auto-reloads)
uv run uvicorn app.main:app --reload --port 8000
```

**`backend/.env`**

```env
# Database
MONGODB_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/?appName=RouteGenie
MONGODB_DB_NAME=RouteGenie

# Cache (Upstash Redis — TLS)
REDIS_URL=rediss://default:<token>@<host>:6379

# Auth
JWT_SECRET=<32+ character random string>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Photos
PEXELS_API_KEY=<your pexels key>

# AI — leave blank until Phase 3
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile

# CORS
ALLOWED_ORIGINS=http://localhost:5173
ENVIRONMENT=development
LOG_LEVEL=INFO
```

---

### 2 — Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Create env file
echo "VITE_API_BASE_URL=http://localhost:8000/api/v1" > .env

# Start the dev server (HMR)
pnpm dev
```

**`frontend/.env`**

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_MAP_TILE_URL=https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```

---

### 3 — Verify

| Service | URL |
|---|---|
| App | http://localhost:5173 |
| API health | http://localhost:8000/api/v1/health |
| Swagger UI | http://localhost:8000/api/docs |
| ReDoc | http://localhost:8000/api/redoc |

---

## Project Structure

```
RouteGenie_2_0/
├── backend/
│   ├── app/
│   │   ├── api/v1/routes/     # auth · trips · bookings · media · health
│   │   ├── core/              # config · security · logging · exceptions
│   │   ├── db/                # MongoDB + Redis connection init
│   │   ├── models/            # Beanie documents — User, Trip, Booking
│   │   ├── schemas/           # Pydantic request / response schemas
│   │   ├── services/          # Business logic layer
│   │   └── middleware/        # Rate limiting · request ID injection
│   ├── pyproject.toml
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── app/               # Router + global providers
    │   ├── components/        # Shared UI · feature components · AppLayout
    │   ├── pages/             # Landing · Auth · Dashboard · Trips · Bookings · Profile · About · NotFound
    │   ├── services/          # Axios client + per-resource API modules
    │   ├── store/             # Zustand — auth state + UI state
    │   └── theme/             # MUI theme tokens + Framer Motion variants
    └── package.json
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user, returns token pair |
| `POST` | `/api/v1/auth/login` | Login, returns token pair |
| `POST` | `/api/v1/auth/logout` | Blacklist access token in Redis |
| `POST` | `/api/v1/auth/refresh` | Rotate refresh token, issue new pair |
| `GET` | `/api/v1/auth/me` | Get current user profile |
| `PATCH` | `/api/v1/auth/me` | Update profile fields |
| `PATCH` | `/api/v1/auth/me/password` | Change password |
| `PATCH` | `/api/v1/auth/me/preferences` | Update travel preferences |
| `GET` | `/api/v1/trips` | List user's trips |
| `POST` | `/api/v1/trips` | Create a trip |
| `GET` | `/api/v1/trips/:id` | Get trip details |
| `PATCH` | `/api/v1/trips/:id` | Update trip |
| `DELETE` | `/api/v1/trips/:id` | Delete trip |
| `GET` | `/api/v1/bookings` | List bookings (filterable) |
| `POST` | `/api/v1/bookings` | Create a booking |
| `PATCH` | `/api/v1/bookings/:id` | Update booking |
| `DELETE` | `/api/v1/bookings/:id` | Delete booking |
| `GET` | `/api/v1/media/photo` | Fetch Pexels cover photo for a query |
| `GET` | `/api/v1/health` | Service health check |

---

## Roadmap

- [x] **Phase 1** — Auth system, core API, design system, MUI theme
- [x] **Phase 2** — Trip & booking CRUD, dashboard, Leaflet maps, Pexels photos
- [ ] **Phase 3** — LangGraph AI agent, Groq streaming, SSE chat UI _(in progress)_
- [ ] **Phase 4** — Full deployment, responsive audit, CI/CD pipeline

---

## License

MIT
