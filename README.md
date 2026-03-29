# EduMerge — Admission Management & CRM

> A full-stack admission management system built with **Next.js 15**, **Go (Gin)**, and **MongoDB**. Manage institutions, programs, seat quotas, applicants, and the complete admission lifecycle with role-based access control.

![Tech Stack](https://img.shields.io/badge/Frontend-Next.js_15-black?logo=next.js)
![Go](https://img.shields.io/badge/Backend-Go_1.22-00ADD8?logo=go&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB_7-47A248?logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white)

---

## 📋 Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Demo Credentials](#demo-credentials)
- [Deployment](#deployment)

---

## 🏗 Architecture

```
┌────────────────┐     HTTP/JSON     ┌────────────────┐     Driver     ┌──────────┐
│   Next.js 15   │ ◄──────────────► │   Go (Gin)     │ ◄────────────► │ MongoDB  │
│   React 19     │   Port 3000      │   REST API     │   Port 27017   │          │
│   Tailwind CSS │                  │   JWT Auth     │                │          │
└────────────────┘                  └────────────────┘                └──────────┘
     Frontend                           Backend                        Database
```

**Backend Clean Architecture:**

```
Handlers → Services → Repositories → MongoDB
     ↑         ↑           ↑
  Middleware  Models     Database
```

---

## ✨ Features

### Master Setup
- **Institutions** — CRUD for affiliated universities
- **Campuses** — Multi-campus support per institution
- **Departments** — Academic departments per campus
- **Programs** — UG/PG programs with intake, duration, course type
- **Academic Years** — Configurable years with "current" toggle

### Seat Management
- **Quota-wise allocation** — KCET, COMEDK, Management quotas
- **Real-time counters** — Atomic increment/decrement on seat fill
- **Supernumerary seats** — Additional category-based seats
- **Validation** — Quota total must equal program intake

### Applicant Management
- **Auto-generated application numbers** — `APP/2026/0001` format
- **15-field applicant form** — Personal, academic, quota details
- **Document checklist** — 7 standard documents with Pending/Submitted/Verified
- **Fee tracking** — Pending/Paid/Partial/Waived status

### Admission Lifecycle
1. **Seat Allocation** — Validates quota availability, atomic seat decrement
2. **Fee Collection** — Update fee status on admission record
3. **Confirmation** — Generates structured admission number: `VTU/2026/UG/CSE/KCET/0001`
4. **Rollback** — Auto-rollback on allocation failure

### Dashboard
- **6 KPI cards** — Intake, admitted, remaining, docs, fees, confirmed
- **Quota bar chart** — Visual fill rate per quota
- **Program pie chart** — Intake distribution across programs
- **Program summary table** — Fill rate percentages
- **Recent admissions feed**

### Role-Based Access Control
| Feature | Admin | Officer | Management |
|---------|-------|---------|------------|
| Master CRUD | ✅ | ❌ | ❌ |
| Seat Matrix Config | ✅ | ❌ | ❌ |
| Applicant Create | ✅ | ✅ | ❌ |
| Seat Allocation | ✅ | ✅ | ❌ |
| Confirm Admission | ✅ | ✅ | ❌ |
| View Dashboard | ✅ | ✅ | ✅ |
| User Management | ✅ | ❌ | ❌ |

### UI/UX
- **Dark / Light / System** theme with smooth transitions
- **Collapsible sidebar** with role-filtered navigation
- **Glass morphism** cards and gradient accents
- **Fully responsive** — works on mobile and desktop
- **Toast notifications** via Sonner
- **Animated transitions** (fade-in, slide-in)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| State | Zustand |
| HTTP | Axios with JWT interceptors |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Go 1.22, Gin, gin-contrib/cors |
| Auth | JWT (golang-jwt/jwt/v5), bcrypt |
| Database | MongoDB 7, mongo-driver v1.16 |
| DevOps | Docker, Docker Compose, GitHub Actions |
| Deploy | Render (render.yaml) |

---

## 📁 Project Structure

```
├── .github/workflows/ci-cd.yml
├── .gitattributes
├── .env.example
├── docker-compose.yml
├── Makefile
├── render.yaml
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── go.mod
│   ├── scripts/mongo-init.js
│   ├── cmd/
│   │   ├── server/main.go          # API entry point
│   │   └── seed/main.go            # Seed script
│   └── internal/
│       ├── config/config.go
│       ├── database/mongodb.go
│       ├── models/                  # Domain models
│       ├── repository/              # Data access layer
│       ├── services/                # Business logic
│       ├── handlers/                # HTTP handlers
│       ├── middleware/              # Auth & logging
│       └── router/router.go        # Route definitions
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── app/
    │   ├── layout.tsx               # Root layout + ThemeProvider
    │   ├── page.tsx                 # Auth redirect
    │   ├── login/page.tsx           # Login page
    │   └── dashboard/
    │       ├── layout.tsx           # Sidebar + Header shell
    │       ├── page.tsx             # Dashboard with charts
    │       ├── institutions/
    │       ├── campuses/
    │       ├── departments/
    │       ├── programs/
    │       ├── academic-years/
    │       ├── seat-matrix/
    │       ├── applicants/
    │       ├── admissions/
    │       └── users/
    ├── components/
    │   ├── sidebar.tsx
    │   ├── header.tsx
    │   ├── theme-provider.tsx
    │   ├── theme-toggle.tsx
    │   └── ui.tsx                   # Reusable components
    └── lib/
        ├── api.ts                   # Axios instance
        ├── types.ts                 # TypeScript interfaces
        ├── store.ts                 # Zustand auth store
        └── utils.ts                 # Helpers
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Go** ≥ 1.22
- **MongoDB** ≥ 7 (or Docker)
- **Docker & Docker Compose** (optional, for containerized setup)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repo
git clone https://github.com/rahulsingh/admission-crm.git
cd admission-crm

# Copy env file and adjust if needed
cp .env.example .env

# Start all services
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api/v1
- MongoDB: localhost:27017

### Option 2: Local Development

```bash
# ── Backend ──
cd backend
go mod tidy
go run cmd/server/main.go

# ── Frontend ──
cd frontend
npm install
npm run dev
```

### Option 3: Make Targets

```bash
make dev          # Start backend + frontend concurrently
make build        # Build both
make docker-up    # Docker compose up
make seed         # Seed demo data
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` at the project root:

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://localhost:27017/admission_crm` | MongoDB connection string |
| `JWT_SECRET` | `your-super-secret-jwt-key` | JWT signing secret |
| `SERVER_PORT` | `8080` | Backend port |
| `GIN_MODE` | `debug` | Gin mode (debug/release) |
| `ADMIN_EMAIL` | `admin@edumerge.com` | Auto-seeded admin email |
| `ADMIN_PASSWORD` | `Admin@123` | Auto-seeded admin password |
| `ADMIN_NAME` | `System Admin` | Auto-seeded admin name |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api/v1` | Frontend API base URL |

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | — | Login, returns JWT |
| POST | `/auth/register` | Admin | Create user |
| GET | `/auth/me` | ✅ | Current user |
| GET | `/auth/users` | Admin | List users |

### Master Data (Admin only for CUD)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/institutions` | List / Create |
| GET/PUT/DELETE | `/institutions/:id` | Read / Update / Delete |
| GET/POST | `/campuses` | List (filter: `?institution_id=`) / Create |
| GET/POST | `/departments` | List (filter: `?campus_id=`) / Create |
| GET/POST | `/programs` | List (filter: `?department_id=`) / Create |
| GET/POST | `/academic-years` | List / Create |
| PUT | `/academic-years/:id/set-current` | Set active year |

### Seat Matrix (Admin only for CUD)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/seat-matrices` | List / Create |
| GET/PUT | `/seat-matrices/:id` | Read / Update |
| GET | `/seat-matrices/availability` | Check availability (`?program_id=&academic_year_id=`) |

### Applicants
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/applicants` | ✅ | Paginated list (`?page=&limit=`) |
| POST | `/applicants` | Officer | Create applicant |
| GET | `/applicants/:id` | ✅ | Get details |
| PUT | `/applicants/:id/documents` | Officer | Update documents |
| PUT | `/applicants/:id/fee-status` | Officer | Update fee status |

### Admissions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admissions` | ✅ | List all |
| POST | `/admissions/allocate` | Officer | Allocate seat |
| PUT | `/admissions/:id/confirm` | Officer | Confirm (generates admission #) |
| PUT | `/admissions/:id/fee-status` | Officer | Update fee |
| GET | `/admissions/:id` | ✅ | Get details |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Aggregated statistics |

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@edumerge.com` | `Admin@123` |
| Admission Officer | `officer@edumerge.com` | `Officer@123` |
| Management | `management@edumerge.com` | `Mgmt@123` |

> Admin user is auto-seeded on first backend startup. Run `make seed` or `go run cmd/seed/main.go` for all three demo users.

---

## 🚢 Deployment

### Render

1. Push to GitHub
2. Connect repo in Render Dashboard
3. Use the `render.yaml` Blueprint — it configures both services
4. Set `MONGODB_URI` to your MongoDB Atlas connection string
5. Deploy

### Manual Docker

```bash
docker compose -f docker-compose.yml up --build -d
```

---

## 📄 License

MIT © Rahul Singh
