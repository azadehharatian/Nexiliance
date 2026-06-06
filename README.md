# Nexiliance — Proactive CRA Readiness Platform

A full-stack compliance dashboard helping manufacturers assess and achieve readiness under the EU **Cyber Resilience Act (CRA)**. Features a live SBOM scanner, vulnerability tracker, radar scoring charts, and PDF report export.

---

## 🚀 Key Features

- **Interactive CRA Assessment** — 42 questions (or 15 in demo mode) mapped across 6 CRA pillars: Security by Design, Secure by Default, SBOM, Conformity Assessment, Vulnerability Disclosure, and Support Period.
- **CRA Readiness Radar** — Visualizes readiness scores per pillar via a dynamic radar chart.
- **Live Manifest Scanner & SBOM Generator** — Upload `package.json`, `requirements.txt`, or `pom.xml` to enumerate components and query the **OSV.dev** database for CVEs. Download a CycloneDX-compliant SBOM.
- **Vulnerability Tracker** — Track, manage, and resolve CVEs aligned with CRA Article 14 (24h ENISA reporting obligation).
- **PDF Report Export** — Generates print-ready audit reports directly in the browser.
- **Secure User Accounts** — JWT-authenticated signup/login with bcrypt password hashing.
- **Persistent Data** — Assessment answers and vulnerabilities stored per-user in a database (SQLite locally, PostgreSQL in production).

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **HTML5 / Vanilla JS** | Core structure and application logic |
| **Vanilla CSS** | Custom light-theme design system with CSS variables |
| **Chart.js 4.x** | Radar charts for pillar score visualisation |
| **OSV.dev REST API** | Live CVE lookups directly from the browser |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Server runtime |
| **Express 4.x** | REST API framework |
| **SQLite3** | Local file-based database (zero-config for development) |
| **PostgreSQL (`pg`)** | Production cloud database (Neon, Supabase, or Vercel Postgres) |
| **bcryptjs** | Secure password hashing (salted, 10 rounds) |
| **jsonwebtoken** | JWT-based stateless authentication (7-day expiry) |
| **cors** | Cross-Origin Resource Sharing middleware |

### DevOps & Hosting
| Technology | Purpose |
|---|---|
| **Vercel** | Serverless hosting (frontend + backend as Functions) |
| **Vercel Serverless Functions** | Express handler under `/api/index.js` |
| **GitHub** | Source control |

---

## 🗄️ Database Schema

```
users            — id, name, company, product, category, email, password_hash, created_at
assessments      — user_email, question_id, response_value
vulnerabilities  — id, user_email, cve, component, severity, status, reported, due
```

---

## 📁 Project Structure

```
ProactiveCRA/
├── api/
│   ├── index.js        # Express app — all API routes & serverless entrypoint
│   └── db.js           # Dual-mode DB layer (SQLite locally / PostgreSQL on Vercel)
├── css/
│   └── style.css       # Global design system (light theme)
├── js/
│   ├── assessment.js   # CRA pillar data, question definitions & scoring logic
│   └── auth.js         # Client-side API helpers (signup, login, JWT storage)
├── index.html          # Marketing / landing page
├── login.html          # Login page
├── signup.html         # Registration page
├── dashboard.html      # Full authenticated user dashboard (42 questions)
├── demo.html           # Public demo dashboard (15 questions, no auth required)
├── package.json        # Node.js dependencies
├── vercel.json         # Vercel deployment configuration
└── db.sqlite           # Auto-created local SQLite database (gitignored)
```

---

## 📦 Running Locally

### 1. Install Dependencies

```bash
cd ProactiveCRA
npm install
```

### 2. Start the Backend Server

```bash
npm start
# → http://localhost:8000
```

The server auto-creates a `db.sqlite` file on first run. The frontend is served from the same port.

### 3. Try the Live Demo (no server needed)

If you only want to explore the UI, you can also run:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/demo.html` — this runs fully in-browser with `sessionStorage`.

---

## ☁️ Deploying to Vercel

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Import on Vercel

- Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
- Select `azadehharatian/Nexiliance`

### 3. Set Environment Variables

In Vercel Project Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string (Neon/Supabase) |
| `JWT_SECRET` | A long random secret string |

> If `DATABASE_URL` is not set, the app falls back to an in-process SQLite instance (suitable for testing only — data does not persist across Vercel function cold starts).

---

## 🔐 API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | None | Create a new user account |
| `POST` | `/api/auth/login` | None | Log in and receive JWT token |
| `GET` | `/api/auth/me` | JWT | Fetch current user profile |
| `GET` | `/api/assessment` | JWT | Load all saved assessment answers |
| `POST` | `/api/assessment` | JWT | Save/overwrite all assessment answers |
| `GET` | `/api/vulns` | JWT | List all tracked vulnerabilities |
| `POST` | `/api/vulns` | JWT | Add a new vulnerability |
| `PUT` | `/api/vulns/:id` | JWT | Update vulnerability status |
| `DELETE` | `/api/vulns/:id` | JWT | Delete a vulnerability |

---

## 📜 License

MIT
