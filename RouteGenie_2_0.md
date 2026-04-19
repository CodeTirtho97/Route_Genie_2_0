# RouteGenie 2.0 — Complete Architecture & Design Plan

> **Stack:** React 18 + TypeScript · Python FastAPI · MongoDB (Beanie) · Redis · LangChain + LangGraph · MUI v6 · Framer Motion
> **Design Direction:** Warm Adventure Dark — cinematic, photography-first, emotionally resonant
> **Author:** Tirthoraj Bhattacharya

---

## Table of Contents

1. [Concept & Vision](#1-concept--vision)
2. [Tech Stack](#2-tech-stack)
3. [Design System](#3-design-system)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Page-by-Page Design Spec](#5-page-by-page-design-spec)
6. [Backend Architecture](#6-backend-architecture)
7. [MongoDB Schema](#7-mongodb-schema)
8. [Redis Strategy](#8-redis-strategy)
9. [API Contract](#9-api-contract)
10. [LangChain Agent Design](#10-langchain-agent-design)
11. [Environment Variables](#11-environment-variables)
12. [Implementation Phases](#12-implementation-phases)

---

## 1. Concept & Vision

RouteGenie 2.0 is a **cinematic AI travel intelligence platform**. It is not a booking aggregator or a calendar tool — it is the smartest travel companion a person can have in their browser.

The core experience is built around a **conversational LangChain agent** that reasons, asks follow-up questions, fetches live data (weather, attractions, exchange rates), remembers your travel preferences across sessions, and produces a fully personalized day-by-day itinerary. Every other surface — trip timelines, booking management, the dashboard — wraps around that intelligence layer.

### Design Philosophy

Travel is emotional. People are not booking a spreadsheet — they are chasing a feeling. Every pixel should evoke **wanderlust before a single word is read**. The design language is warm, cinematic, and photography-first. Cold SaaS palettes (indigo/cyan/navy) belong to fintech and dev tools. RouteGenie 2.0 looks like the inside of a premium travel magazine — golden hour tones, editorial typography, destination images as first-class citizens.

### What Makes It a Portfolio Highlight

| Differentiator | Implementation |
|---|---|
| Streaming AI agent | LangGraph + Groq + SSE — real-time reasoning with tool visibility |
| Warm cinematic design | Unique among travel SaaS — warm dark palette, not cold blue |
| Type-safe end-to-end | TypeScript frontend + Pydantic backend — no runtime surprises |
| Smart Redis caching | Every external API call cached — fast, zero rate-limit risk |
| Paginated everything | Server-side pagination on all list endpoints from day one |
| Agent memory | Redis-persisted conversation — agent remembers context across messages |
| Production structure | Feature-organized components, TanStack Query, Zustand, Zod — scales cleanly |
| Cascade data integrity | Delete trip → atomically deletes all its bookings |

---

## 2. Tech Stack

### Final Decisions

| Layer | Technology | Reason |
|---|---|---|
| Frontend Framework | React 18 + TypeScript | Type safety, component model, ecosystem |
| UI Library | MUI v6 | Headless + styled system, component overrides |
| Animations | Framer Motion v11 | Production-grade motion, layout animations, SSE streaming text |
| Server State | TanStack Query v5 | Cache, background refetch, optimistic updates |
| Client State | Zustand | Lightweight, no boilerplate, TypeScript-first |
| Forms | React Hook Form + Zod | Schema-validated, performant, zero re-renders |
| Routing | React Router v6 | Lazy-loaded pages, nested routes, loaders |
| Maps | React-Leaflet + Leaflet.js | 100% free, OpenStreetMap tiles |
| Charts | Recharts | Free, composable, TypeScript support |
| Build Tool | Vite | Fast HMR, native ESM, optimized builds |
| Backend Framework | Python FastAPI | Async, auto-generated docs, Pydantic-native |
| ODM | Beanie (Motor + Pydantic v2) | Async MongoDB ODM, fully typed |
| Cache / Sessions | Redis (redis.asyncio) | Speed, TTL, sliding window rate limits |
| Auth | python-jose (JWT) + passlib (bcrypt) | Stateless, secure, refresh token support |
| LLM | Groq API — llama-3.3-70b-versatile | Free tier, native tool calling, ~300 tok/s |
| Agent Framework | LangChain + LangGraph | Stateful agent graph, tool loops, memory |
| Streaming | FastAPI StreamingResponse (SSE) | Agent token streaming, no WebSocket overhead |
| External APIs | OpenStreetMap · OpenMeteo · Exchangerate.host · Unsplash | All free tier |
| Package Manager | pnpm (frontend) · uv (backend) | Fast, deterministic, modern |

### Why Groq (Free LLM)

Groq's free tier provides:
- **14,400 requests/day** on `llama-3.3-70b-versatile`
- **131k context window** — handles long itinerary generation
- **Native tool/function calling** — required for the LangChain agent tools
- **~300 tokens/second** — fast enough for streaming to feel real-time
- Sign up free at `console.groq.com`

Fallback options (all free): Google Gemini 2.0 Flash API · Ollama (fully local, no API key at all)

---

## 3. Design System

### 3.1 Design Direction: Warm Adventure Dark

**Hybrid system:**
- **Warm Adventure Dark** as the consistent base — cinematic, photography-forward, emotionally resonant
- **Bento Grid layout** on the Dashboard only — editorial, data-as-design
- **Aceternity-style warm spotlight** on the landing hero only — maximum first impression

### 3.2 Color Palette

```
/* Base Surfaces */
--bg-base:          #12100A    /* very dark warm black — brown undertone, not blue */
--bg-surface:       #1C1710    /* lifted warm dark — cards, panels */
--bg-elevated:      #251D13    /* modals, dropdowns, popovers */
--border-subtle:    #2E2418    /* amber-tinted dividers */
--border-default:   #3D3020    /* default card borders */

/* Brand Colors */
--primary:          #F59E0B    /* warm amber — sunsets, golden hour */
--primary-dark:     #D97706    /* hover state */
--primary-glow:     rgba(245, 158, 11, 0.2)
--accent:           #E85D26    /* terracotta / burnt orange */
--accent-glow:      rgba(232, 93, 38, 0.15)

/* Semantic */
--success:          #4ADE80
--warning:          #FCD34D
--error:            #F87171
--info:             #60A5FA

/* Text */
--text-primary:     #FDF6EC    /* warm white — never pure #FFF */
--text-secondary:   #C4A882    /* warm sand */
--text-muted:       #A8927A    /* warm stone */
--text-disabled:    #6B5744

/* Gradients */
--gradient-primary: linear-gradient(135deg, #F59E0B 0%, #E85D26 100%)
--gradient-hero:    linear-gradient(180deg, rgba(18,16,10,0) 0%, #12100A 100%)
--gradient-card:    linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(232,93,38,0.04) 100%)
```

### 3.3 Typography

```
/* Fonts — all free via Google Fonts */

Display / Hero Headings:   "DM Serif Display"  weight 400
                            — editorial, travel-magazine energy
                            — use for H1 only (hero section)

Section Headings (H2-H4):  "Plus Jakarta Sans"  weight 600-700
                            — modern, geometric, clean

Body / UI:                 "Inter"              weight 400-500
                            — maximum legibility at all sizes

Monospace (agent output):  "JetBrains Mono"     weight 400
                            — coordinates, code, agent reasoning steps

/* Type Scale */
Hero:       clamp(3rem, 6vw, 5.5rem)   / DM Serif Display
H1:         clamp(2rem, 4vw, 3.5rem)   / Plus Jakarta Sans 700
H2:         1.875rem (30px)            / Plus Jakarta Sans 600
H3:         1.5rem (24px)              / Plus Jakarta Sans 600
H4:         1.25rem (20px)             / Plus Jakarta Sans 600
Body L:     1.125rem (18px)            / Inter 400
Body:       1rem (16px)                / Inter 400
Body S:     0.875rem (14px)            / Inter 400
Caption:    0.75rem (12px)             / Inter 500, letter-spacing: 0.05em
```

### 3.4 Elevation & Shadows

```css
/* Card — resting */
box-shadow: 0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3);

/* Card — hover lifted */
box-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3);

/* Primary glow — amber */
box-shadow: 0 0 40px rgba(245,158,11,0.25), 0 0 80px rgba(245,158,11,0.08);

/* Accent glow — terracotta */
box-shadow: 0 0 30px rgba(232,93,38,0.2);

/* Modal overlay */
box-shadow: 0 25px 60px rgba(0,0,0,0.7), 0 10px 24px rgba(0,0,0,0.5);
```

### 3.5 Motion Design Principles

Every animation should feel **intentional and physical** — not decorative.

```typescript
// theme/motion.ts — shared Framer variants

export const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } }
}

export const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
}

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "backOut" } }
}

export const pageTransition = {
  initial:  { opacity: 0, y: −16 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:     { opacity: 0, y: 8, transition: { duration: 0.25 } }
}

export const cardHover = {
  rest:  { y: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.4)" },
  hover: { y: -6, boxShadow: "0 10px 40px rgba(0,0,0,0.5)", transition: { duration: 0.25 } }
}

export const buttonPress = {
  tap: { scale: 0.96, transition: { duration: 0.1 } }
}
```

**Rules:**
- Page transitions: `AnimatePresence` + `pageTransition` variant on every `<Page>` wrapper
- Cards: `staggerContainer` + `fadeUp` on mount, `cardHover` on interaction
- Buttons: `buttonPress` (`whileTap`) on every interactive element
- Hero text: word-by-word stagger using `staggerChildren: 0.05`
- Agent stream: characters appear via `animate={{ width }}` on a growing span
- Data load: Skeleton → content swap using `AnimatePresence` + `scaleIn`
- Modals: `scaleIn` from `0.94` + backdrop `opacity: 0 → 0.7`
- Numbers/counters: `useMotionValue` + `useTransform` count-up on mount

### 3.6 Component Design Tokens

```css
/* Cards */
background: #1C1710;
border: 1px solid #2E2418;
border-radius: 16px;
padding: 24px;
transition: all 0.25s ease;

/* Cards — hover */
border-color: rgba(245, 158, 11, 0.3);
background: linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(232,93,38,0.03) 100%);

/* Primary Button */
background: linear-gradient(135deg, #F59E0B 0%, #E85D26 100%);
color: #12100A;
font-weight: 600;
border-radius: 10px;
padding: 12px 28px;
box-shadow: 0 4px 20px rgba(245,158,11,0.3);

/* Primary Button — hover */
box-shadow: 0 6px 28px rgba(245,158,11,0.45);
transform: translateY(-1px);

/* Input fields */
background: #12100A;
border: 1px solid #3D3020;
border-radius: 10px;
color: #FDF6EC;

/* Input — focus */
border-color: #F59E0B;
box-shadow: 0 0 0 3px rgba(245,158,11,0.15);
```

---

## 4. Frontend Architecture

### 4.1 Complete File Structure

```
frontend/
├── public/
│   ├── fonts/                        # Self-hosted: DM Serif Display, Plus Jakarta Sans, Inter
│   └── favicon.svg
│
├── src/
│   ├── app/
│   │   ├── App.tsx                   # Root: providers wrapper
│   │   ├── router.tsx                # createBrowserRouter, lazy page imports
│   │   └── providers.tsx             # MUI ThemeProvider, QueryClient, AuthProvider
│   │
│   ├── theme/
│   │   ├── index.ts                  # createTheme() — combines all tokens
│   │   ├── palette.ts                # Color tokens (maps to CSS vars above)
│   │   ├── typography.ts             # Font scale, family, weight config
│   │   ├── shadows.ts                # Elevation tokens
│   │   ├── components.ts             # MUI component overrides (Button, Card, Input, etc.)
│   │   └── motion.ts                 # Framer variants (exported for reuse everywhere)
│   │
│   ├── components/
│   │   │
│   │   ├── ui/                       # Atomic, reusable base components
│   │   │   ├── WarmCard/
│   │   │   │   ├── WarmCard.tsx      # Base card with amber hover border
│   │   │   │   └── index.ts
│   │   │   ├── GradientButton/       # Primary CTA — amber-to-terracotta gradient
│   │   │   ├── GhostButton/          # Outlined secondary action
│   │   │   ├── StatusChip/           # Confirmed / Pending / Cancelled / Planned
│   │   │   ├── CategoryBadge/        # Flight, Hotel, Restaurant icons + colors
│   │   │   ├── AnimatedCounter/      # Count-up number on mount
│   │   │   ├── SkeletonCard/         # Loading placeholder (warm-tinted shimmer)
│   │   │   ├── PageTitle/            # H1 + subtitle + optional action slot
│   │   │   ├── EmptyState/           # Illustrated SVG + message + CTA
│   │   │   └── ConfirmDialog/        # Reusable delete/action confirmation modal
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar/
│   │   │   │   ├── Navbar.tsx        # Warm dark frosted, scroll-reactive opacity
│   │   │   │   ├── NavLinks.tsx      # Desktop links with active underline animation
│   │   │   │   └── MobileDrawer.tsx  # Slide-in drawer for mobile
│   │   │   ├── Sidebar/
│   │   │   │   ├── Sidebar.tsx       # Collapsible dashboard sidebar
│   │   │   │   ├── NavItem.tsx       # Sidebar item with icon + label + active glow
│   │   │   │   └── SidebarFooter.tsx # Avatar, name, logout
│   │   │   ├── AppShell/             # Authenticated layout: Sidebar + main content
│   │   │   ├── Footer/
│   │   │   └── PageWrapper/          # Framer AnimatePresence page wrapper
│   │   │
│   │   ├── features/
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SignupForm.tsx
│   │   │   │   └── AuthGuard.tsx     # Redirect to /login if no token
│   │   │   │
│   │   │   ├── itinerary/
│   │   │   │   ├── ItineraryCard.tsx         # Cover image + destination + dates + hover overlay
│   │   │   │   ├── ItineraryTimeline.tsx      # Vertical day-by-day expandable timeline
│   │   │   │   ├── DayPanel.tsx              # Collapsible day with activity list
│   │   │   │   ├── ActivityItem.tsx          # Single activity with icon, time, location
│   │   │   │   ├── CreateTripStepper.tsx      # Multi-step trip creation form
│   │   │   │   ├── StepDestination.tsx        # Step 1 — typeahead + mini map
│   │   │   │   ├── StepDatesPersons.tsx       # Step 2 — date range + person count
│   │   │   │   ├── StepBudgetStyle.tsx        # Step 3 — budget slider + trip type grid
│   │   │   │   ├── StepGenerate.tsx           # Step 4 — AI toggle + streaming generation
│   │   │   │   ├── BudgetDonut.tsx            # Recharts donut: spend by category
│   │   │   │   └── TripTypeGrid.tsx           # Icon grid: Adventure, Beach, City, etc.
│   │   │   │
│   │   │   ├── booking/
│   │   │   │   ├── BookingCard.tsx            # Horizontal card with category color border
│   │   │   │   ├── BookingForm.tsx            # Create / edit booking form
│   │   │   │   ├── BookingFilters.tsx         # Sidebar filter panel
│   │   │   │   ├── BookingTable.tsx           # Sortable/paginated table (desktop)
│   │   │   │   └── BookingStats.tsx           # Total spend, upcoming count cards
│   │   │   │
│   │   │   ├── agent/
│   │   │   │   ├── ChatWindow.tsx             # Main SSE chat container
│   │   │   │   ├── ChatMessage.tsx            # User vs agent bubble (warm-tinted)
│   │   │   │   ├── StreamingText.tsx          # Character-by-character token renderer
│   │   │   │   ├── ThinkingIndicator.tsx      # Three pulsing amber dots
│   │   │   │   ├── ToolCallBadge.tsx          # "🔍 Searching OpenStreetMap..." pill
│   │   │   │   ├── SuggestionPills.tsx        # Quick-prompt suggestion buttons
│   │   │   │   ├── SessionList.tsx            # Past conversations sidebar
│   │   │   │   └── ItineraryPreviewCard.tsx   # Inline itinerary card in chat + Save button
│   │   │   │
│   │   │   └── dashboard/
│   │   │       ├── StatsRow.tsx               # 4 AnimatedCounter cards (bento style)
│   │   │       ├── UpcomingTrips.tsx           # Next 3 trips with countdown
│   │   │       ├── RecentBookings.tsx          # Last 5 bookings
│   │   │       ├── BudgetOverview.tsx          # Total spend this year
│   │   │       └── WorldMap.tsx               # Leaflet map — all destination markers
│   │   │
│   │   └── shared/
│   │       ├── MapView/                        # React-Leaflet wrapper, warm tile style
│   │       ├── DateRangePicker/                # MUI X — dark warm themed
│   │       ├── ImageWithFallback/              # Graceful image load with skeleton
│   │       ├── InfiniteScroll/                 # Intersection observer based
│   │       └── ErrorBoundary/
│   │
│   ├── pages/
│   │   ├── Home/
│   │   │   ├── Home.tsx
│   │   │   ├── HeroSection.tsx               # Full-viewport — parallax image + warm spotlight
│   │   │   ├── FeaturesSection.tsx            # 3 warm cards with stagger animation
│   │   │   ├── HowItWorksSection.tsx          # Numbered steps + animated connector line
│   │   │   ├── TestimonialsSection.tsx        # Rotating testimonial cards
│   │   │   └── CTASection.tsx                 # Gradient amber banner + signup CTA
│   │   │
│   │   ├── Dashboard/
│   │   │   └── Dashboard.tsx                  # Bento grid layout
│   │   │
│   │   ├── Trips/
│   │   │   ├── Trips.tsx                      # Masonry grid of ItineraryCards
│   │   │   └── TripCreate.tsx                 # Full-page multi-step stepper
│   │   │
│   │   ├── TripDetail/
│   │   │   └── TripDetail.tsx                 # Hero banner + tabbed content
│   │   │
│   │   ├── Bookings/
│   │   │   └── Bookings.tsx                   # Two-panel: filters + cards/table
│   │   │
│   │   ├── Agent/
│   │   │   └── Agent.tsx                      # Split: session list + chat window
│   │   │
│   │   ├── Profile/
│   │   │   └── Profile.tsx                    # Account info + preferences
│   │   │
│   │   ├── Auth/
│   │   │   ├── Login.tsx                      # Split-screen: image carousel + form
│   │   │   └── Signup.tsx
│   │   │
│   │   └── NotFound/
│   │       └── NotFound.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                         # Auth state + login/logout/refresh actions
│   │   ├── useItineraries.ts                  # TanStack Query: list, detail, create, update, delete
│   │   ├── useBookings.ts                     # TanStack Query: bookings with filters
│   │   ├── useAgentStream.ts                  # SSE EventSource hook + message queue
│   │   ├── useScrollReveal.ts                 # Framer scroll-triggered animation hook
│   │   ├── useCountUp.ts                      # Animated number counter
│   │   └── useDestinationImage.ts             # Unsplash image fetch with cache
│   │
│   ├── store/
│   │   ├── auth.store.ts                      # user, token, isAuthenticated, isLoading
│   │   ├── ui.store.ts                        # sidebarOpen, activeModal, theme
│   │   └── agent.store.ts                     # sessionId, messages[], isThinking, toolInFlight
│   │
│   ├── services/
│   │   ├── api.ts                             # Axios instance + request/response interceptors
│   │   ├── auth.service.ts                    # register, login, logout, refresh, getMe
│   │   ├── itinerary.service.ts               # CRUD + generate
│   │   ├── booking.service.ts                 # CRUD + stats
│   │   └── agent.service.ts                   # createSession, chat, getHistory, saveItinerary
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── itinerary.types.ts
│   │   ├── booking.types.ts
│   │   ├── agent.types.ts
│   │   └── api.types.ts                       # PaginatedResponse<T>, ApiResponse<T>
│   │
│   ├── utils/
│   │   ├── date.ts                            # dayjs wrappers, isPast, formatRange
│   │   ├── format.ts                          # currency, duration, distance formatters
│   │   ├── mapHelpers.ts                      # coordinate utils, bounds calculation
│   │   └── cn.ts                              # clsx class merging utility
│   │
│   └── constants/
│       ├── routes.ts                          # ROUTES.dashboard, ROUTES.trips, etc.
│       ├── queryKeys.ts                       # TanStack Query key factory functions
│       └── booking.ts                         # BOOKING_CATEGORIES, TRIP_TYPES, icons map
│
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── .eslintrc.cjs
├── .prettierrc
└── package.json
```

---

## 5. Page-by-Page Design Spec

### 5.1 Home (Landing)

**Hero Section**
- Full-viewport dark background (`#12100A`) with a **high-quality destination hero image** (full bleed, `object-fit: cover`, 40% opacity) — gradient overlay fades image to base color at bottom
- **Warm spotlight effect:** a soft radial amber glow (`rgba(245,158,11,0.12)`) follows the mouse cursor — `useMotionValue(mouseX)` + `useTransform`
- Headline uses `DM Serif Display` — animates word by word with `staggerChildren: 0.06`:
  ```
  "Plan Smarter.
   Travel Better."
  ```
- Subtitle fades up 0.3s after headline completes
- Two CTAs animate in last:
  - `Start Planning` — amber gradient button with amber glow, `whileHover` scale 1.03
  - `See How It Works` — ghost button with warm border
- Floating micro-cards drift in from edges (Framer `initial: { x: ±60, opacity: 0 }`): show sample AI-generated itinerary snippets

**Features Section** (scroll-triggered, `whileInView`)
- Three `WarmCard` components in a row — stagger 0.08s apart
- Icons: glowing amber SVGs
- Cards: `"AI Trip Planner"` · `"Smart Bookings"` · `"Live Weather & Rates"`
- Each card border glows amber on hover

**How It Works**
- Horizontal numbered steps: **1 → 2 → 3 → 4**
- Connector: animated dashed line that draws (`pathLength: 0 → 1`) as the section scrolls into view
- Steps: Tell the AI your dream → Agent researches live data → Get a personalized plan → Book and track everything

**Testimonials**
- Rotating carousel (auto-advance 4s, Framer `AnimatePresence` crossfade)
- Each testimonial: avatar, name, destination, quote

**CTA Strip**
- Full-width with subtle amber gradient shimmer animation
- `"Start Planning Your Next Adventure"` + `Sign Up Free`

---

### 5.2 Auth Pages (Login / Signup)

**Layout:** Split-screen — left 50% / right 50%

**Left panel:**
- Destination image carousel: cycles every 5s with Framer `AnimatePresence` crossfade
- Overlay with quote: `"The world is a book, and those who do not travel read only one page."`
- Bottom: RouteGenie logo + tagline

**Right panel:**
- Warm dark background (`#1C1710`)
- Logo at top
- Form fields animate in staggered (0.1s each): `fadeUp` variant
- Zod validation: inline error messages with amber text, input border turns red with `shake` animation on submit failure
- `Login → Signup` link uses shared layout animation (smooth route transition)
- Social OAuth row (placeholder — "Coming Soon" tooltip)

---

### 5.3 Dashboard

**Layout:** Collapsible sidebar (240px expanded / 72px collapsed icon-only) + main content area

**Bento Grid (main content):**
```
┌─────────────┬─────────────┬──────────────────────────┐
│ Total Trips │ Upcoming    │                           │
│    [12]     │    [3]      │    Upcoming Trips         │
├─────────────┼─────────────┤    (scrollable list)      │
│ Total Spend │ Destinations│                           │
│  [$2,840]   │   Visited   │                           │
├─────────────┴─────────────┼──────────────────────────┤
│                           │   Recent Bookings         │
│     World Map             │   (last 5)                │
│     (Leaflet)             │                           │
└───────────────────────────┴──────────────────────────┘
```

- **Stat cards:** `AnimatedCounter` counts up from 0 on mount. Amber accent line at top of each card.
- **Upcoming Trips:** Each trip shows cover image thumbnail, destination, countdown (`"In 12 days"`), status chip
- **World Map:** Leaflet map with warm dark tile style (`CartoDB Dark Matter`), amber markers for each destination. Clicking a marker shows a popup with trip name + dates.
- **Recent Bookings:** Category icon (color-coded) + name + date + price. Hover: amber border glow.

---

### 5.4 Trips Page

**Header:** Page title + trip count badge + `+ New Trip` gradient button (right-aligned)

**Filter bar:** Status tabs (All / Planned / Ongoing / Completed) + Trip Type dropdown + Sort select

**Grid:** Masonry-style, 3 cols desktop / 2 tablet / 1 mobile

**ItineraryCard:**
- Cover image fills top 55% (Unsplash, cached)
- Gradient overlay on image: `linear-gradient(to top, #12100A 0%, transparent 60%)`
- Destination name in `DM Serif Display` over image
- Below image: date range, person count, budget pill, status chip
- Hover state: card lifts (`translateY: -6px`), amber border appears, `"View Trip"` button overlay fades in over image
- Trip Type tag (Adventure, Beach, etc.) in top-right corner of image

**Empty state:** Illustrated compass SVG, `"No trips yet"`, `"Let the AI plan your first adventure"` + CTA button

---

### 5.5 Create Trip (Multi-Step Stepper)

**Layout:** Full-page — custom MUI Stepper at top, form content below, progress auto-saves to sessionStorage

**Step 1 — Destination**
- Large search input with OpenStreetMap typeahead suggestions
- Selection updates an inline mini Leaflet map (animated marker drop)
- Country + coordinates auto-filled

**Step 2 — Dates & Persons**
- MUI X DateRangePicker (warm dark themed)
- Duration badge auto-calculates: `"5 days"`
- Person count: animated `+` / `−` buttons with spring bounce

**Step 3 — Budget & Style**
- Budget: MUI Slider with live formatted value (`$2,500 USD`)
- Trip type: Icon grid — Adventure 🏔 · Beach 🏖 · City 🌆 · Cultural 🏛 · Wellness 🧘 · Road Trip 🚗
- Selected type: amber border + background tint

**Step 4 — Generate**
- Toggle: `AI Generate` (default) vs `Manual Planning`
- **AI Generate flow:**
  - Click `Generate My Trip` button
  - Button morphs into loading state: animated pulsing amber orb
  - Text cycles through: `"Researching {destination}..."` → `"Checking weather..."` → `"Finding top attractions..."` → `"Building your itinerary..."`
  - Day plans stream in one by one via SSE — each day panel animates in with `fadeUp`
  - Completed plan shows summary + `"Save This Trip"` button
- **Manual flow:** simple form to add destination, dates, basic info — redirects to Trip Detail to add days manually

---

### 5.6 Trip Detail

**Hero Banner:** Full-width destination image (60vh), gradient overlay, trip title in `DM Serif Display`, dates + status chip. Edit and Delete action buttons top-right.

**Tabs:** Overview · Timeline · Bookings · Map (MUI Tabs with warm amber indicator)

**Overview Tab:**
- Two-column: left = `BudgetDonut` (Recharts donut chart — spend by category), right = trip metadata (persons, trip type, AI generated badge, tags)

**Timeline Tab:**
- Vertical timeline — each day is a `DayPanel` (collapsible, amber left border)
- Day header: `Day 1 — Monday, Jan 13` + weather icon + temp (from OpenMeteo)
- Activity list inside: time + icon + title + location + estimated cost
- Inline `+ Add Activity` button at bottom of each day

**Bookings Tab:**
- Category-filtered list of bookings for this trip only
- `+ Add Booking` FAB (fixed bottom-right, amber, spring bounce on appear)

**Map Tab:**
- Full-panel Leaflet map
- Markers: activity locations (amber) + booking locations (terracotta)
- Clicking marker: popup with name, time, category icon

---

### 5.7 Bookings Page

**Layout:** Left sidebar (280px) + main content

**Sidebar filters:**
- Category checkboxes (with colored icons)
- Date range picker
- Status toggle (Upcoming / Past / All)
- Itinerary select
- Price range slider
- `Reset Filters` link

**Main content:**
- Booking cards (vertical stack, mobile) or sortable table (desktop toggle)
- **BookingCard:** thin left border in category color · category icon · name · itinerary name chip · date + time · price · status chip
- Hover: card shifts right 4px + amber border glow
- Pagination: server-side, 20 per page, amber accent on active page

**Top stats row:** Total spend · Upcoming count · Most booked category

---

### 5.8 AI Agent Page

**Layout:** Split — 280px session sidebar (left) + chat window (right)

**Session Sidebar:**
- `+ New Chat` button at top
- List of past sessions: title (auto-generated from first message), date, message count
- Active session: amber left border + warm background

**Chat Window:**
- Header: session title + Clear Session button
- Messages area: scroll container, bottom-anchored
- **User messages:** right-aligned, amber-tinted dark bubble, user avatar
- **Agent messages:** left-aligned, darker warm bubble, RouteGenie logo avatar
- **Streaming:** tokens appear character by character — `StreamingText` component uses `useEffect` to append chars from SSE stream
- **Tool call badge:** pill that appears above agent message during tool invocation: `🔍 Searching OpenStreetMap...` → animates to green `✓ Found 12 attractions`
- **Thinking indicator:** three amber pulsing dots + `"RouteGenie is thinking..."` in italic muted text
- **Inline itinerary card:** when agent generates a complete plan, renders a `ItineraryPreviewCard` with destination image, day count, estimated budget + `"Save to My Trips"` button

**Input bar (pinned bottom):**
- Frosted warm dark input field
- Send button: amber gradient, paper-plane icon, `whileTap: { scale: 0.92 }`
- Above input: `SuggestionPills` — quick prompts that disappear after first message:
  - `"Plan a 7-day trip to Japan"`
  - `"Best hotels in Barcelona under €100/night"`
  - `"What's the weather like in Bali in July?"`
  - `"Suggest a 3-day Paris itinerary"`

---

### 5.9 Profile Page

- Avatar with edit overlay (click to upload)
- Sections: Personal Info · Travel Preferences · Security
- Preferences: preferred currency · travel styles (multi-select chips) · home country
- Security: Change Password form (current + new + confirm, with Zod validation)
- Danger zone: Delete Account (red, requires typing `DELETE` to confirm)

---

## 6. Backend Architecture

### 6.1 Complete File Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py                 # Include all route modules
│   │       └── routes/
│   │           ├── auth.py               # /auth endpoints
│   │           ├── itineraries.py        # /itineraries endpoints
│   │           ├── bookings.py           # /bookings endpoints
│   │           ├── agent.py              # /agent endpoints (SSE)
│   │           ├── places.py             # /places proxy (OSM, Overpass)
│   │           └── health.py             # /health
│   │
│   ├── core/
│   │   ├── config.py                     # Pydantic BaseSettings — all env vars
│   │   ├── security.py                   # JWT create/decode, bcrypt hash/verify
│   │   ├── exceptions.py                 # Custom HTTPException subclasses
│   │   └── logging.py                    # structlog setup with request IDs
│   │
│   ├── db/
│   │   ├── mongodb.py                    # Beanie init, Motor AsyncIOMotorClient
│   │   └── redis.py                      # redis.asyncio connection pool
│   │
│   ├── models/                           # Beanie Documents — maps to MongoDB collections
│   │   ├── user.py                       # users collection
│   │   ├── itinerary.py                  # itineraries collection
│   │   └── booking.py                    # bookings collection
│   │
│   ├── schemas/                          # Pydantic v2 — request/response shapes
│   │   ├── auth.py                       # RegisterRequest, LoginRequest, TokenResponse
│   │   ├── itinerary.py                  # CreateItineraryRequest, ItineraryResponse, etc.
│   │   ├── booking.py                    # CreateBookingRequest, BookingResponse, etc.
│   │   ├── agent.py                      # ChatRequest, AgentMessageResponse
│   │   └── common.py                     # PaginatedResponse[T], ApiResponse[T], MessageResponse
│   │
│   ├── services/
│   │   ├── auth.py                       # register, login, refresh token logic
│   │   ├── itinerary.py                  # CRUD, cascade delete, cache invalidation
│   │   ├── booking.py                    # CRUD, is_past compute, stats aggregation
│   │   ├── cache.py                      # Redis get/set/delete helpers with type safety
│   │   ├── osm.py                        # OpenStreetMap Nominatim + Overpass wrappers
│   │   ├── weather.py                    # OpenMeteo free API wrapper
│   │   ├── exchange.py                   # Exchangerate.host wrapper
│   │   ├── unsplash.py                   # Unsplash image fetch + Redis cache
│   │   └── agent/
│   │       ├── agent.py                  # LangGraph agent executor entry point
│   │       ├── graph.py                  # StateGraph definition — nodes + edges
│   │       ├── state.py                  # AgentState TypedDict
│   │       ├── tools.py                  # All @tool decorated functions
│   │       ├── memory.py                 # RedisConversationMemory class
│   │       └── prompts.py                # System prompt, few-shot examples
│   │
│   ├── middleware/
│   │   ├── rate_limit.py                 # Redis sliding window rate limiter
│   │   ├── request_id.py                 # Attach X-Request-ID to every request
│   │   └── cors.py                       # CORS config with origin whitelist
│   │
│   ├── dependencies/
│   │   └── deps.py                       # get_current_user, get_redis, pagination params
│   │
│   └── main.py                           # FastAPI app factory, lifespan, middleware registration
│
├── tests/
│   ├── conftest.py                        # Fixtures: test app, test DB, mock Redis
│   ├── test_auth.py
│   ├── test_itineraries.py
│   ├── test_bookings.py
│   └── test_agent_tools.py
│
├── .env
├── .env.example
├── pyproject.toml                         # uv managed dependencies
├── Dockerfile
├── docker-compose.yml                     # MongoDB + Redis + backend
└── README.md
```

### 6.2 FastAPI App Factory (`main.py`)

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.mongodb import init_db
from app.db.redis import init_redis, close_redis
from app.api.v1.router import api_router
from app.core.config import settings
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.rate_limit import RateLimitMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    await init_redis()
    yield
    # Shutdown
    await close_redis()

def create_app() -> FastAPI:
    app = FastAPI(
        title="RouteGenie API",
        version="2.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        lifespan=lifespan,
    )
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router, prefix="/api/v1")
    return app

app = create_app()
```

---

## 7. MongoDB Schema

### 7.1 User Document

```python
# app/models/user.py
from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Literal

class UserPreferences(BaseModel):
    preferred_currency: str = "USD"
    travel_styles: list[str] = []          # ["adventure", "budget", "luxury", "cultural"]
    home_country: str | None = None
    notification_enabled: bool = True

class User(Document):
    email: Indexed(EmailStr, unique=True)
    name: str
    password_hash: str
    dob: date
    gender: Literal["Male", "Female", "Other", "Prefer not to say"]
    avatar_url: str | None = None
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
```

### 7.2 Itinerary Document

```python
# app/models/itinerary.py
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Literal

class Coordinates(BaseModel):
    lat: float
    lng: float

class Activity(BaseModel):
    time: str | None = None               # "09:00"
    title: str
    description: str | None = None
    location: str | None = None
    coordinates: Coordinates | None = None
    category: str | None = None           # "attraction" | "food" | "transport" | "leisure"
    estimated_cost: float = 0.0

class Day(BaseModel):
    day_number: int
    date: date
    title: str
    weather_summary: str | None = None    # "Sunny, 24°C" — fetched at generation time
    activities: list[Activity] = []

class Itinerary(Document):
    user_id: Indexed(PydanticObjectId)
    title: str
    destination: str
    country: str
    coordinates: Coordinates
    start_date: date
    end_date: date
    num_persons: int
    trip_type: str
    budget: float
    currency: str = "USD"
    cover_image_url: str | None = None
    days: list[Day] = []
    tags: list[str] = []
    status: Literal["planned", "ongoing", "completed", "cancelled"] = "planned"
    ai_generated: bool = False
    agent_session_id: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "itineraries"
        indexes = [
            [("user_id", 1)],
            [("user_id", 1), ("status", 1)],
            [("destination", "text")],
        ]
```

### 7.3 Booking Document

```python
# app/models/booking.py
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field
from datetime import datetime
from enum import Enum

class BookingCategory(str, Enum):
    FLIGHT     = "Flight"
    TRAIN      = "Train"
    BUS        = "Bus"
    HOTEL      = "Hotel"
    RESTAURANT = "Restaurant"
    ACTIVITY   = "Activity"
    CAR_RENTAL = "Car Rental"
    OTHER      = "Other"

class BookingStatus(str, Enum):
    CONFIRMED = "confirmed"
    PENDING   = "pending"
    CANCELLED = "cancelled"

class Booking(Document):
    user_id: Indexed(PydanticObjectId)
    itinerary_id: Indexed(PydanticObjectId)
    category: BookingCategory
    name: str
    origin: str | None = None
    destination_name: str | None = None
    date: datetime
    time: str | None = None
    price: float
    currency: str = "USD"
    status: BookingStatus = BookingStatus.PENDING
    confirmation_number: str | None = None
    notes: str | None = None
    is_past: bool = False                 # computed: date < now, updated on save
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "bookings"
        indexes = [
            [("user_id", 1)],
            [("itinerary_id", 1)],
            [("user_id", 1), ("date", -1)],
            [("user_id", 1), ("is_past", 1)],
            [("user_id", 1), ("category", 1)],
        ]
```

---

## 8. Redis Strategy

| Key Pattern | Value | TTL | Purpose |
|---|---|---|---|
| `auth:blacklist:{jti}` | `"1"` | Token remaining TTL | JWT logout / invalidation |
| `auth:refresh:{user_id}` | refresh token hash | 7 days | Refresh token store |
| `rate:auth:{ip}` | int (request count) | 15 min sliding window | Brute force protection on login |
| `rate:api:{user_id}` | int (request count) | 1 min sliding window | Global API rate limit per user |
| `cache:geocode:{query_hash}` | JSON (coords + country) | 24 hours | OSM Nominatim responses |
| `cache:attractions:{lat}:{lng}:{r}` | JSON (place list) | 12 hours | Overpass API results |
| `cache:weather:{lat}:{lng}:{date}` | JSON (forecast) | 3 hours | OpenMeteo responses |
| `cache:exchange:{base}` | JSON (rates map) | 1 hour | Currency exchange rates |
| `cache:unsplash:{destination}` | string (image URL) | 7 days | Cover image per destination |
| `cache:itineraries:{user_id}` | JSON (list) | 5 minutes | Itinerary list — invalidated on write |
| `cache:stats:{user_id}` | JSON (booking stats) | 10 minutes | Dashboard stats aggregation |
| `agent:session:{session_id}` | JSON (message history) | 24 hours | Conversation memory per session |
| `agent:lock:{user_id}` | `"1"` | 30 seconds | Prevent concurrent agent invocations |

### Cache Service Pattern

```python
# app/services/cache.py

class CacheService:
    def __init__(self, redis: Redis):
        self.redis = redis

    async def get(self, key: str) -> dict | None:
        data = await self.redis.get(key)
        return json.loads(data) if data else None

    async def set(self, key: str, value: dict, ttl: int) -> None:
        await self.redis.setex(key, ttl, json.dumps(value, default=str))

    async def delete(self, key: str) -> None:
        await self.redis.delete(key)

    async def delete_pattern(self, pattern: str) -> None:
        # Used for cache invalidation: delete_pattern("cache:itineraries:*")
        keys = await self.redis.keys(pattern)
        if keys:
            await self.redis.delete(*keys)
```

---

## 9. API Contract

All routes under `/api/v1/`. Standard response envelope:

```json
// Success
{ "success": true, "data": { ... }, "message": "OK" }

// Paginated success
{ "success": true, "data": [...], "total": 48, "page": 1, "limit": 20, "pages": 3 }

// Error
{ "success": false, "error": "NOT_FOUND", "detail": "Itinerary not found" }
```

### Authentication

```
POST   /auth/register              Register new user → UserResponse
POST   /auth/login                 Login → TokenResponse { access_token, refresh_token, user }
POST   /auth/logout                Blacklist JTI in Redis → MessageResponse
POST   /auth/refresh               Rotate refresh token → TokenResponse
GET    /auth/me                    Current user profile → UserResponse
PATCH  /auth/me                    Update name, avatar, dob, gender → UserResponse
PATCH  /auth/me/password           Change password (requires current password)
PATCH  /auth/me/preferences        Update travel preferences → UserPreferencesResponse
```

### Itineraries

```
GET    /itineraries                All user itineraries (paginated)
       ?page=1&limit=12
       &status=planned
       &trip_type=adventure
       &sort=-created_at           → PaginatedResponse<ItineraryResponse>

POST   /itineraries                Create itinerary manually → ItineraryResponse

GET    /itineraries/{id}           Single itinerary with days + booking summary
                                   → ItineraryDetailResponse

PATCH  /itineraries/{id}           Update itinerary fields → ItineraryResponse
DELETE /itineraries/{id}           Delete + cascade delete bookings → MessageResponse

GET    /itineraries/{id}/bookings  Bookings for this trip (paginated) → PaginatedResponse<BookingResponse>

POST   /itineraries/generate       SSE — streams day plans as agent generates them
                                   → StreamingResponse (text/event-stream)
```

### Bookings

```
GET    /bookings                   All user bookings (paginated + filtered)
       ?page=1&limit=20
       &itinerary_id=...
       &category=Flight
       &is_past=false
       &status=confirmed
       &date_from=2025-01-01
       &date_to=2025-12-31
       &sort=-date                 → PaginatedResponse<BookingResponse>

POST   /bookings                   Create booking → BookingResponse
GET    /bookings/{id}              Single booking → BookingResponse
PATCH  /bookings/{id}              Update booking → BookingResponse
DELETE /bookings/{id}              Delete booking → MessageResponse

GET    /bookings/stats             Aggregated stats → BookingStatsResponse
                                   { total_spend, by_category: {...}, upcoming_count, past_count }
```

### Agent

```
POST   /agent/sessions             Create new session → { session_id: string, created_at: string }
GET    /agent/sessions             List user sessions from Redis → SessionListResponse[]
DELETE /agent/sessions/{id}        Clear session from Redis → MessageResponse

POST   /agent/chat/{session_id}    Send message, get full response (non-streaming) → AgentMessageResponse
GET    /agent/stream/{session_id}  SSE — stream agent response tokens
       ?message=...                → StreamingResponse (text/event-stream)

POST   /agent/save-itinerary       Parse agent itinerary output → save to DB → ItineraryResponse
```

### Places (proxied, cached)

```
GET    /places/search?q=Tokyo&limit=5          OSM Nominatim geocoding
GET    /places/attractions?lat=&lng=&radius=5  Overpass attractions
GET    /places/restaurants?lat=&lng=&cuisine=  Overpass restaurants
GET    /weather?lat=&lng=&date=2025-03-15      OpenMeteo forecast
GET    /exchange?from=USD&to=JPY               Exchange rate
```

### SSE Event Schema

Events emitted by `/agent/stream/{session_id}`:

```
data: {"type": "token",      "content": "Based on your "}
data: {"type": "token",      "content": "preferences, I recommend..."}
data: {"type": "tool_start", "tool": "search_attractions", "input": "Tokyo, 5km"}
data: {"type": "tool_end",   "tool": "search_attractions", "result_count": 14}
data: {"type": "tool_start", "tool": "get_weather_forecast", "input": "35.68,139.69,2025-03-15"}
data: {"type": "tool_end",   "tool": "get_weather_forecast", "summary": "Sunny, 18°C"}
data: {"type": "itinerary",  "data": { ...full itinerary JSON... }}
data: {"type": "done"}
```

---

## 10. LangChain Agent Design

### 10.1 Architecture: LangGraph ReAct Agent

A **stateful multi-step reasoning agent** built with LangGraph's `StateGraph`. Unlike a basic `AgentExecutor`, LangGraph allows conditional branching, tool loops, and human-in-the-loop patterns.

**LLM:** `ChatGroq(model="llama-3.3-70b-versatile")` — free tier, native tool calling, 131k context.

### 10.2 State Graph

```
[User Message]
      │
      ▼
┌─────────────┐
│   Router    │──── "casual / short answer" ────────► [Direct Reply Node]
└─────────────┘
      │
   "trip planning" / "destination question" / "booking advice"
      │
      ▼
┌───────────────────┐
│  Clarifier Node   │──── missing: destination / dates / budget ──► [Ask User → wait]
└───────────────────┘
      │
   has sufficient context
      │
      ▼
┌───────────────┐
│ Planner Node  │◄──────────────────────────────────┐
└───────────────┘                                   │
      │                                             │
  [invoke tool] ──► [Tool Execution] ──► [result] ──┘
      │
   all tools done
      │
      ▼
┌─────────────────┐
│ Synthesis Node  │   Compose final itinerary from all tool results
└─────────────────┘
      │
      ▼
[Stream tokens to frontend via SSE]
```

### 10.3 Tools

```python
# app/services/agent/tools.py

@tool("geocode_destination")
async def geocode_destination(destination: str) -> dict:
    """Get coordinates, country, and bounding box for a destination name.
    Always call this first before any location-based tool."""

@tool("search_attractions")
async def search_attractions(lat: float, lng: float, radius_km: int = 5) -> list[dict]:
    """Find top tourist attractions near coordinates using the Overpass API.
    Returns name, category, coordinates, and opening hours."""

@tool("search_restaurants")
async def search_restaurants(lat: float, lng: float, cuisine: str = "") -> list[dict]:
    """Find restaurants near coordinates. Optionally filter by cuisine type
    (italian, japanese, indian, etc.)."""

@tool("search_accommodation")
async def search_accommodation(lat: float, lng: float, budget_per_night: float) -> list[dict]:
    """Find hotels and hostels near coordinates within the per-night budget.
    Returns name, type, approximate price, and coordinates."""

@tool("get_weather_forecast")
async def get_weather_forecast(lat: float, lng: float, date: str) -> dict:
    """Get weather forecast for a location and specific date (YYYY-MM-DD).
    Uses OpenMeteo API — free, no API key required.
    Returns: temperature_max, temperature_min, precipitation, description."""

@tool("get_exchange_rate")
async def get_exchange_rate(from_currency: str, to_currency: str) -> float:
    """Get the current exchange rate between two ISO currency codes (e.g. USD → JPY)."""

@tool("estimate_budget_breakdown")
async def estimate_budget_breakdown(
    destination: str,
    num_days: int,
    num_persons: int,
    trip_style: str  # "budget" | "mid-range" | "luxury"
) -> dict:
    """Estimate trip budget breakdown by category.
    Returns estimated daily costs for: accommodation, food, transport, activities, misc."""

@tool("get_destination_tips")
async def get_destination_tips(destination: str, country: str) -> dict:
    """Get general travel information: local currency, language, best travel season,
    typical visa requirements, cultural tips, safety rating, and power socket type."""

@tool("build_day_plan")
async def build_day_plan(
    day_number: int,
    date: str,
    attractions: list,
    restaurants: list,
    weather: dict,
    budget_per_day: float
) -> dict:
    """Compose a single structured day plan from gathered data.
    Schedules activities with realistic timing and travel time between locations."""
```

### 10.4 Conversation Memory

```python
# app/services/agent/memory.py

class RedisConversationMemory:
    """
    Persists LangChain message history per session in Redis.
    Serializes HumanMessage / AIMessage / ToolMessage to JSON.
    Auto-truncates to last 40 messages to stay within context.
    TTL refreshed on every interaction (24h sliding window).
    """

    MAX_MESSAGES = 40
    TTL_SECONDS  = 86400  # 24 hours

    def __init__(self, session_id: str, redis: Redis):
        self.key   = f"agent:session:{session_id}"
        self.redis = redis

    async def load_messages(self) -> list[BaseMessage]:
        raw = await self.redis.get(self.key)
        if not raw:
            return []
        data = json.loads(raw)
        return [messages_from_dict([m])[0] for m in data]

    async def save_messages(self, messages: list[BaseMessage]) -> None:
        trimmed = messages[-self.MAX_MESSAGES:]
        serialized = [m.dict() for m in trimmed]
        await self.redis.setex(self.key, self.TTL_SECONDS, json.dumps(serialized))

    async def clear(self) -> None:
        await self.redis.delete(self.key)
```

### 10.5 System Prompt

```
You are RouteGenie — an expert AI travel planner with deep knowledge of destinations
worldwide. You help users create detailed, personalized travel itineraries and answer
any travel-related question.

PERSONALITY:
- Enthusiastic and knowledgeable but concise — no filler
- You think like a seasoned traveler, not a brochure
- Use destination-appropriate emojis sparingly (1-2 per response max)
- Be honest: if a destination is challenging to visit, say so

PLANNING RULES:
1. If destination, dates, or budget are missing — ask for them before generating
2. Always geocode the destination first (geocode_destination tool)
3. Fetch weather for each travel date (get_weather_forecast tool)
4. Search attractions, restaurants, and accommodation in parallel where possible
5. Build day plans that are REALISTIC — account for travel time between locations
6. Never schedule more than 4 major sites in a single day
7. Always include meal breaks at local restaurants — no generic "grab lunch"
8. Consider the user's trip style (adventure vs. relaxed vs. cultural, etc.)

OUTPUT FORMAT for complete itineraries:
- Start with a 2-sentence destination overview
- Then: Day 1, Day 2, ... with times, activity names, locations, estimated costs
- End with total estimated budget breakdown
- Final line always: "Would you like me to save this itinerary to your RouteGenie account?"

You have access to these tools: {tool_names}
Current date: {current_date}
User's preferred currency: {preferred_currency}
```

### 10.6 Streaming Implementation

```python
# app/api/v1/routes/agent.py

@router.get("/stream/{session_id}")
async def agent_stream(
    session_id: str,
    message: str = Query(..., alias="message"),
    current_user: User = Depends(get_current_user),
    redis: Redis  = Depends(get_redis),
):
    # Prevent concurrent calls from same user
    lock_key = f"agent:lock:{str(current_user.id)}"
    if await redis.exists(lock_key):
        raise HTTPException(429, "Agent is already processing a request")
    await redis.setex(lock_key, 30, "1")

    async def event_stream():
        try:
            memory  = RedisConversationMemory(session_id, redis)
            history = await memory.load_messages()
            agent   = build_agent(current_user, history)

            async for event in agent.astream_events(
                {"input": message}, version="v2", include_tags=["agent"]
            ):
                kind = event["event"]

                if kind == "on_chat_model_stream":
                    chunk = event["data"]["chunk"].content
                    if chunk:
                        payload = json.dumps({"type": "token", "content": chunk})
                        yield f"data: {payload}\n\n"

                elif kind == "on_tool_start":
                    payload = json.dumps({"type": "tool_start", "tool": event["name"]})
                    yield f"data: {payload}\n\n"

                elif kind == "on_tool_end":
                    payload = json.dumps({"type": "tool_end", "tool": event["name"]})
                    yield f"data: {payload}\n\n"

                elif kind == "on_chain_end" and "itinerary" in str(event.get("data", "")):
                    payload = json.dumps({"type": "itinerary", "data": event["data"]})
                    yield f"data: {payload}\n\n"

            yield 'data: {"type": "done"}\n\n'

        except Exception as e:
            yield f'data: {json.dumps({"type": "error", "detail": str(e)})}\n\n'
        finally:
            await redis.delete(lock_key)

    return StreamingResponse(event_stream(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})
```

---

## 11. Environment Variables

### Frontend (`frontend/.env`)

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_key
VITE_MAP_TILE_URL=https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```

### Backend (`backend/.env`)

```bash
# Database
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=routegenie

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-minimum-32-character-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# AI
GROQ_API_KEY=gsk_...                         # Free at console.groq.com
GROQ_MODEL=llama-3.3-70b-versatile

# External APIs (all free)
UNSPLASH_ACCESS_KEY=your_unsplash_key        # Free at unsplash.com/developers

# Server
ALLOWED_ORIGINS=http://localhost:5173,https://yourapp.vercel.app
ENVIRONMENT=development
LOG_LEVEL=INFO
```

---

## 12. Implementation Phases

### Phase 1 — Foundation (Week 1–2)

**Backend**
- [ ] uv project init — `pyproject.toml` with all dependencies
- [ ] FastAPI app factory with lifespan, middleware stack
- [ ] MongoDB connection with Beanie init (all 3 Document models registered)
- [ ] Redis connection pool
- [ ] `core/config.py` — typed Pydantic settings with `.env` loading
- [ ] `core/security.py` — bcrypt hash/verify, JWT create/decode, refresh token rotation
- [ ] Auth routes: register, login, logout, refresh, get me, update me, change password
- [ ] `AuthGuard` dependency — `get_current_user`
- [ ] Request ID middleware + structlog setup
- [ ] `/health` endpoint (checks DB + Redis)

**Frontend**
- [ ] Vite + React 18 + TypeScript init, pnpm, ESLint + Prettier
- [ ] MUI theme: palette (warm dark), typography (DM Serif Display + Plus Jakarta Sans + Inter), shadows, component overrides
- [ ] `theme/motion.ts` — all shared Framer variants
- [ ] Zustand store: `auth.store.ts`, `ui.store.ts`
- [ ] Axios instance + interceptors (attach Bearer token, handle 401 → auto refresh → retry)
- [ ] TanStack Query client setup with default retry/staleTime config
- [ ] React Router v6 — all routes defined (lazy imports), `AuthGuard` component
- [ ] `Login.tsx` + `Signup.tsx` — split-screen, animated forms, Zod validation
- [ ] Token persistence: store in memory (`auth.store`) + `httpOnly` cookie (backend sets it)

---

### Phase 2 — Core Features (Week 3–4)

**Backend**
- [ ] Itinerary CRUD routes + service + cache layer (Redis 5-min TTL on list, invalidate on write)
- [ ] Cascade delete: `DELETE /itineraries/{id}` → `Booking.find(itinerary_id=id).delete_all()`
- [ ] Booking CRUD routes + service — server-side filters (itinerary_id, category, is_past, date range)
- [ ] `is_past` auto-computed on Booking save (`date < datetime.utcnow()`)
- [ ] Booking stats aggregation endpoint (MongoDB `$group` pipeline)
- [ ] OSM service: Nominatim geocoding + Overpass attractions/restaurants (Redis 12h cache)
- [ ] Weather service: OpenMeteo wrapper (Redis 3h cache)
- [ ] Exchange rate service (Redis 1h cache)
- [ ] Unsplash service: fetch one photo per destination keyword (Redis 7d cache)
- [ ] Rate limiting middleware: 5 req/15min on `/auth/login`, 100 req/min on `/api`

**Frontend**
- [ ] `auth.service.ts` — all auth API calls
- [ ] `itinerary.service.ts` + `useItineraries.ts` hook (TanStack Query: list, detail, create, update, delete, invalidation)
- [ ] `booking.service.ts` + `useBookings.ts` hook
- [ ] `Dashboard.tsx` — bento grid, `StatsRow` with `AnimatedCounter`, `UpcomingTrips`, `RecentBookings`, `WorldMap`
- [ ] `Trips.tsx` — masonry grid, filters, `ItineraryCard` with hover overlay
- [ ] `TripCreate.tsx` — 4-step stepper with Zod-validated forms, mini Leaflet map on step 1
- [ ] `TripDetail.tsx` — hero banner, 4 tabs (Overview, Timeline, Bookings, Map)
- [ ] `ItineraryTimeline.tsx` — `DayPanel` collapsible with activity list
- [ ] `Bookings.tsx` — filter sidebar + paginated booking cards + stats row
- [ ] `BookingForm.tsx` — create/edit booking modal with Zod validation
- [ ] `WorldMap.tsx` + `MapView.tsx` — Leaflet wrappers with dark warm tile style

---

### Phase 3 — AI Agent (Week 5–6)

**Backend**
- [ ] Groq client setup, verify connection and tool calling works
- [ ] `AgentState` TypedDict definition
- [ ] LangGraph `StateGraph` — all nodes + edges + conditional routing
- [ ] All 8 tools implemented, individually unit-tested
- [ ] `RedisConversationMemory` class — serialize/deserialize LangChain messages
- [ ] Agent builder function (`build_agent`) — wires LLM + tools + memory + system prompt
- [ ] SSE streaming endpoint (`GET /agent/stream/{session_id}`)
- [ ] Session management routes (create, list, delete)
- [ ] `POST /agent/save-itinerary` — parse agent JSON output → save as `Itinerary` document
- [ ] Agent rate limiting (1 concurrent per user via Redis lock)

**Frontend**
- [ ] `agent.service.ts` — session CRUD + non-streaming chat
- [ ] `useAgentStream.ts` — `EventSource` wrapper, parses SSE event types, updates Zustand `agent.store`
- [ ] `Agent.tsx` — split layout: session list sidebar + chat window
- [ ] `SessionList.tsx` — past sessions with auto-generated titles
- [ ] `ChatWindow.tsx` — scrollable messages, bottom-anchored input
- [ ] `ChatMessage.tsx` — user vs agent bubble (warm-tinted, avatar)
- [ ] `StreamingText.tsx` — character-by-character token renderer
- [ ] `ThinkingIndicator.tsx` — three pulsing amber dots
- [ ] `ToolCallBadge.tsx` — animated pill showing tool name → result
- [ ] `SuggestionPills.tsx` — quick-prompt buttons above input (disappear after first message)
- [ ] `ItineraryPreviewCard.tsx` — inline in chat, `"Save to My Trips"` button → calls `/agent/save-itinerary`

---

### Phase 4 — Polish & Production (Week 7–8)

**Features**
- [ ] `Home.tsx` — hero (warm spotlight + parallax), features section, how-it-works (animated connector line), testimonials, CTA
- [ ] Auth split-screen with destination image carousel
- [ ] `Profile.tsx` — personal info, travel preferences, password change, danger zone
- [ ] `NotFound.tsx` — illustrated 404 page
- [ ] Weather display wired into `DayPanel` (icon + temp from cached OpenMeteo data)
- [ ] Currency conversion display on booking cards (user's preferred currency)

**Quality**
- [ ] Responsive audit — every page on 320px / 768px / 1440px
- [ ] Skeleton loading on all async components (warm shimmer animation)
- [ ] `ErrorBoundary` wrapping every page
- [ ] Optimistic updates on Booking create/delete (TanStack Query `onMutate`)
- [ ] `react-helmet-async` — page titles + meta description per route

**Testing**
- [ ] Backend: pytest fixtures for test DB + mock Redis
- [ ] Backend: `test_auth.py` — register, login, refresh, logout flows
- [ ] Backend: `test_itineraries.py` — CRUD + cascade delete
- [ ] Backend: `test_agent_tools.py` — each tool with mocked HTTP responses
- [ ] Frontend: Vitest + React Testing Library — `useAuth`, `useAgentStream` hooks

**Deployment**
- [ ] `Dockerfile` for backend (Python slim, uv install, uvicorn)
- [ ] `docker-compose.yml` — MongoDB + Redis + backend (local dev)
- [ ] `vercel.json` for frontend (SPA routing, env vars)
- [ ] `.env.example` files for both frontend and backend
- [ ] GitHub Actions CI: lint + typecheck + test on PR

---

## Summary

| What | Decision |
|---|---|
| Design | Warm Adventure Dark — cinematic, photography-first, amber/terracotta palette |
| Layout pattern | Warm card base · Bento grid on Dashboard · Full-bleed images on hero/trip detail |
| Typography | DM Serif Display (hero) · Plus Jakarta Sans (headings) · Inter (body) |
| Motion | Framer Motion — `fadeUp` stagger system, `cardHover`, `pageTransition`, SSE streaming text |
| State | Zustand (client) + TanStack Query v5 (server) — clean separation, no Redux |
| Forms | React Hook Form + Zod — schema-first, zero re-renders |
| Backend | FastAPI + Beanie (async MongoDB ODM) + Redis — fully async stack |
| Agent LLM | Groq llama-3.3-70b (free, fast, native tool calling) via LangGraph ReAct |
| Agent memory | Redis-persisted conversation history, 24h TTL, auto-truncates at 40 messages |
| Caching | Redis on all external APIs — OSM (12h), weather (3h), exchange (1h), unsplash (7d) |
| Auth | JWT (15min access + 7d refresh rotation) + Redis blacklist on logout |
