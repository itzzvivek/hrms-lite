# HRMS Lite – Human Resource Management System

A lightweight, production-ready Human Resource Management System built with Django REST Framework and React. Manage employee records and daily attendance tracking with a clean, modern interface.

---

## Live Demo

| Resource | URL |
|----------|-----|
| Frontend | *Deploy to Vercel (see instructions below)* |
| Backend API | *Deploy to Render (see instructions below)* |
| GitHub | *Your repository URL* |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Vite, Axios |
| Styling | Custom CSS with CSS Variables (dark theme) |
| Backend | Python 3.11, Django 4.2, Django REST Framework |
| Database | SQLite (local) / PostgreSQL (production) |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |
| Auth | None (single admin, no auth required) |

---

## Features

### Core
- ✅ Add / View / Delete employees (ID, name, email, department)
- ✅ Mark daily attendance (Present / Absent) per employee
- ✅ View all attendance records with filters (employee, date range, status)
- ✅ Prevent duplicate attendance (auto-updates if re-marked)
- ✅ Server-side validation (unique employee ID, unique email, email format, required fields)

### Bonus
- ✅ Dashboard summary (total employees, today's present/absent/unmarked counts)
- ✅ Department breakdown with visual bar chart
- ✅ Total present days per employee (shown in Employees table)
- ✅ Filter attendance by employee, date range, and status
- ✅ Recent attendance feed on Dashboard

---

## Project Structure

```
hrms-lite/
├── backend/
│   ├── hrms/                  # Django project
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── employees/             # Main app
│   │   ├── models.py          # Employee + Attendance models
│   │   ├── serializers.py     # DRF serializers with validation
│   │   ├── views.py           # API views
│   │   └── urls.py            # API routes
│   ├── requirements.txt
│   ├── Procfile               # For Render deployment
│   ├── build.sh               # Render build script
│   └── manage.py
│
└── frontend/
    ├── src/
    │   ├── components/        # Reusable UI (Modal, Badge, Btn, Spinner, etc.)
    │   ├── pages/             # Dashboard, Employees, Attendance
    │   └── utils/api.js       # Axios API client
    ├── index.html
    ├── vite.config.js
    └── vercel.json
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/` | Summary stats + recent attendance |
| GET | `/api/employees/` | List all employees |
| POST | `/api/employees/` | Create new employee |
| GET | `/api/employees/{id}/` | Get single employee |
| DELETE | `/api/employees/{id}/` | Delete employee + their records |
| GET | `/api/attendance/` | List records (supports filters) |
| POST | `/api/attendance/` | Mark attendance (or update if exists) |
| DELETE | `/api/attendance/{id}/` | Delete a record |

**Attendance query params:** `?employee=<id>&date=YYYY-MM-DD&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD&status=Present|Absent`

---

## Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- pip

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env if needed (defaults work for local SQLite)

# Run migrations
python manage.py migrate

# (Optional) Load sample data
python manage.py shell -c "
from employees.models import Employee, Attendance
import datetime

e1 = Employee.objects.create(employee_id='EMP-001', full_name='Alice Johnson', email='alice@company.com', department='Engineering')
e2 = Employee.objects.create(employee_id='EMP-002', full_name='Bob Smith', email='bob@company.com', department='Product')
e3 = Employee.objects.create(employee_id='EMP-003', full_name='Carol White', email='carol@company.com', department='Design')
Attendance.objects.create(employee=e1, date=datetime.date.today(), status='Present')
Attendance.objects.create(employee=e2, date=datetime.date.today(), status='Absent')
print('Sample data created.')
"

# Start server
python manage.py runserver
# API available at http://localhost:8000/api/
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start dev server
npm run dev
# App available at http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Deployment Guide

### Backend → Render (Free Tier)

1. **Push your code to GitHub**

2. **Go to [render.com](https://render.com)** → New → Web Service

3. **Connect your GitHub repo** → Select the `backend/` folder as root (or set root to `backend`)

4. **Configure the service:**
   - **Name:** `hrms-lite-api`
   - **Runtime:** Python 3
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn hrms.wsgi:application --bind 0.0.0.0:$PORT`

5. **Add Environment Variables** (in Render dashboard → Environment):
   ```
   SECRET_KEY=<generate a random 50-char string>
   DEBUG=False
   DATABASE_URL=<Render will auto-provide if you add a PostgreSQL database>
   ALLOWED_HOSTS=your-app-name.onrender.com
   CORS_ALLOW_ALL_ORIGINS=True
   ```

6. **Add a PostgreSQL database** (optional but recommended):
   - Render → New → PostgreSQL (free tier)
   - Copy the "Internal Database URL"
   - Paste as `DATABASE_URL` env var in your web service

7. **Deploy** — Render will run `build.sh` (installs deps, runs migrations, collects static)

8. **Your backend URL:** `https://hrms-lite-api.onrender.com`
   - Test: `https://hrms-lite-api.onrender.com/api/employees/`

> ⚠️ **Note:** Render free tier spins down after 15min inactivity. First request takes ~30s to wake up.

---

### Frontend → Vercel

1. **Go to [vercel.com](https://vercel.com)** → New Project

2. **Import your GitHub repo**

3. **Configure project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add Environment Variable:**
   ```
   VITE_API_URL = https://hrms-lite-api.onrender.com/api
   ```
   *(Replace with your actual Render backend URL)*

5. **Deploy** → Your frontend is live at `https://hrms-lite.vercel.app`

6. **Update backend CORS** — in Render, update:
   ```
   CORS_ALLOWED_ORIGINS=https://hrms-lite.vercel.app
   CORS_ALLOW_ALL_ORIGINS=False
   ```

---

### GitHub Repository Setup

```bash
# From project root (hrms-lite/)
git init
git add .
git commit -m "Initial commit: HRMS Lite full-stack application"
git remote add origin https://github.com/yourusername/hrms-lite.git
git branch -M main
git push -u origin main
```

Create a `.gitignore` at root:
```
# Backend
backend/venv/
backend/__pycache__/
backend/db.sqlite3
backend/.env
backend/staticfiles/

# Frontend
frontend/node_modules/
frontend/dist/
frontend/.env
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| Employee ID | Required, unique, alphanumeric + hyphens only |
| Full Name | Required, min 2 characters |
| Email | Required, valid format, unique |
| Department | Required, must be one of predefined list |
| Attendance Date | Cannot be a future date |
| Attendance Status | Must be "Present" or "Absent" |
| Duplicate Attendance | Auto-updates existing record for same employee+date |

---

## Assumptions & Limitations

- **No authentication** — single admin user assumed as per requirements
- **No pagination** — kept simple for the scope; add DRF pagination for large datasets
- **SQLite in development** — PostgreSQL recommended for production
- **Date validation** — future dates blocked server-side; attendance can be backdated
- **Render free tier** — 15-minute spin-down means first request after idle takes ~30 seconds

---

## Local Quick Test (API)

```bash
# Create employee
curl -X POST http://localhost:8000/api/employees/ \
  -H "Content-Type: application/json" \
  -d '{"employee_id":"EMP-001","full_name":"Alice Johnson","email":"alice@co.com","department":"Engineering"}'

# List employees
curl http://localhost:8000/api/employees/

# Mark attendance
curl -X POST http://localhost:8000/api/attendance/ \
  -H "Content-Type: application/json" \
  -d '{"employee":1,"date":"2025-01-15","status":"Present"}'

# Dashboard
curl http://localhost:8000/api/dashboard/
```
