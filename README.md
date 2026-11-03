# EduTrack Pro — Advanced Student Academic Management & Analytics System

> An Advanced DBMS academic project demonstrating enterprise-grade database design, stored procedures, triggers, views, transactions, and a complete full-stack web application.

---

## 📌 Overview

EduTrack Pro is a comprehensive Student Academic Management System built for a university context. It supports three roles — **Admin**, **Faculty**, and **Student** — and covers the full academic lifecycle: student registration, course management, enrollment, attendance, examinations, results, analytics, and audit logging.

---

## ✨ Features

### Admin
- Dashboard with live KPIs (total students, faculty, departments, active enrollments)
- Student management — create, search, filter, update status, export CSV
- Faculty management — create and update faculty profiles
- Department management — CRUD with student/faculty counts
- Course management — course catalog and section offerings (with capacity limits)
- Academic term management — active term control via transactions
- Enrollment management — enroll students via stored procedure with lock
- Attendance management — session creation and attendance recording
- Examination management — create, publish/schedule exams
- Results & marks entry — batch marks save with automatic grade computation
- Academic analytics — department comparison, performance distribution, rankings
- Audit logs — paginated, filterable event trail
- Notification management — send and view system notifications
- User profile & settings management

### Faculty
- Personal dashboard (assigned courses, sections, upcoming exams)
- Attendance management for assigned sections
- Marks entry for assigned exams
- Results view for assigned courses

### Student
- Personal dashboard (enrolled courses, attendance %, GPA, upcoming exams)
- Results and marksheet view
- Attendance breakdown per course
- Notification inbox
- Profile update

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6, Recharts, Lucide React, Axios |
| Backend | Node.js, Express.js, mysql2/promise, JWT (jsonwebtoken), bcryptjs |
| Database | MySQL 8.0+ InnoDB, utf8mb4, MySQL Workbench |
| Auth | JWT Bearer tokens, bcrypt password hashing, role-based middleware |
| Security | Helmet, CORS origin whitelist, HTTP-only token in localStorage, rate limiting notes |

---

## 📁 Project Structure

```
EDUTRACK/
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # DataTable, Modal, PageHeader, StatCard, StatusBadge, EmptyState
│   │   │   └── layout/       # AppLayout, Navbar, Sidebar
│   │   ├── context/          # AuthContext, ToastContext
│   │   ├── pages/            # 19 page components (admin, faculty, student, shared)
│   │   ├── services/         # api.js — all axios service modules
│   │   ├── App.jsx           # BrowserRouter, lazy routes, ProtectedRoute, RoleGuard
│   │   └── main.jsx          # ReactDOM.createRoot entry point
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                   # Express.js backend
│   ├── src/
│   │   ├── config/db.js      # mysql2 pool, transaction helper, testConnection
│   │   ├── middleware/        # authMiddleware, roleMiddleware, errorMiddleware
│   │   ├── modules/          # 15 feature modules (auth, students, faculty, ...)
│   │   ├── routes/index.js   # Central router — mounts all 15 module routers
│   │   ├── utils/            # response.js, audit.js
│   │   └── app.js            # Express app, CORS, Helmet, middleware stack
│   ├── server.js             # HTTP server entry
│   ├── tests/api.test.js     # 8 Jest + Supertest integration tests
│   └── package.json
│
├── database/
│   ├── 01_schema.sql         # 16 tables
│   ├── 02_constraints_indexes.sql
│   ├── 03_views.sql          # 7 views
│   ├── 04_triggers.sql       # 5 triggers
│   ├── 05_functions.sql      # 3 stored functions
│   ├── 06_procedures.sql     # 5 stored procedures
│   ├── 07_sample_data.sql    # Seed data with demo accounts
│   └── run_migrations.js     # Migration runner (DELIMITER-aware, ordered)
│
├── docs/
│   ├── DATABASE_DOCUMENTATION.md
│   ├── ADVANCED_DBMS_DEMONSTRATIONS.md
│   ├── NORMALIZATION.md
│   ├── TESTING_REPORT.md
│   ├── QUERY_OPTIMIZATION_REPORT.md
│   └── USER_GUIDE.md
│
├── .gitignore
├── PROJECT_AUDIT.md
├── PROJECT_STATUS.md
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm 9+

### 1. Clone and enter project

```bash
git clone <your-repo-url>
cd EDUTRACK
```

### 2. Database Setup

```sql
-- In MySQL Workbench or mysql CLI:
CREATE DATABASE IF NOT EXISTS edutrack
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Then run migrations:

```bash
cd server
cp .env.example .env
# Edit .env — fill in DB_HOST, DB_USER, DB_PASSWORD
npm install
npm run db:migrate
```

This runs all 7 SQL scripts in order, including triggers, functions, and procedures.

### 3. Backend Setup

```bash
cd server
# .env already configured from step 2
npm start
# Server starts on http://localhost:5000
```

### 4. Frontend Setup

```bash
cd client
npm install
npm run dev
# Vite dev server starts on http://localhost:5173
```

### 5. Open the App

Navigate to `http://localhost:5173`

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@edutrack.edu | Admin@123 |
| Faculty | faculty@edutrack.edu | Faculty@123 |
| Student | student@edutrack.edu | Student@123 |

---

## 🌐 API Base URL

```
http://localhost:5000/api
```

All API routes require a `Bearer` JWT token in the `Authorization` header (except `/api/auth/login`).

See [`docs/API_ENDPOINTS.md`](./docs/API_ENDPOINTS.md) for full endpoint documentation.

---

## 🗄 Database Architecture

| Object Type | Count | Description |
|-------------|-------|-------------|
| Tables | 16 | Full normalized schema (3NF) |
| Views | 7 | Student directory, attendance summary, faculty load, results, etc. |
| Stored Procedures | 5 | Enrollment (with SELECT FOR UPDATE), status update, grade compute, attendance bulk, report |
| Stored Functions | 3 | Grade letter, GPA calculator, attendance percentage |
| Triggers | 5 | Auto-update timestamps, enrollment quota check, result integrity |
| Indexes | 25+ | Primary, unique, foreign key, composite, covering indexes |

See [`docs/DATABASE_DOCUMENTATION.md`](./docs/DATABASE_DOCUMENTATION.md) for full details.

---

## 🔐 Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens signed with `JWT_SECRET` from environment (never committed)
- CORS restricted to `CLIENT_URL` origin only
- Role-based access control on every protected route
- SQL injection prevention via parameterized queries throughout
- Error messages sanitized in production (stack traces suppressed)
- `.env` files excluded from version control via `.gitignore`

---

## 📊 Advanced DBMS Features Demonstrated

- **Normalization**: Schema in 3NF — see [`docs/NORMALIZATION.md`](./docs/NORMALIZATION.md)
- **Stored Procedures**: `sp_enroll_student` (with `SELECT FOR UPDATE` for concurrency), `sp_compute_grades`, `sp_update_student_status`, `sp_record_attendance_bulk`, `sp_generate_student_report`
- **Stored Functions**: `fn_get_grade_letter`, `fn_calculate_gpa`, `fn_get_attendance_percentage`
- **Triggers**: Enrollment quota enforcement, result integrity, audit logging
- **Views**: Business logic encapsulated in views (attendance rate excludes excused absences from denominator)
- **Transactions**: Atomic term activation, enrollment, grade computation
- **Window Functions**: `DENSE_RANK()` for student performance rankings in analytics
- **CTEs**: Used in complex analytics queries
- **Indexing**: Composite indexes on foreign key pairs, covering indexes for search
- **ACID Compliance**: InnoDB with transaction isolation

---

## 🧪 Testing

Run backend integration tests (requires running MySQL with seeded data):

```bash
cd server
npm test
```

8 test cases covering: health check, auth login, student list, analytics, profile, notifications, audit logs, enrollment.

See [`docs/TESTING_REPORT.md`](./docs/TESTING_REPORT.md) for full test results.

---

## 📄 License

Academic project — for educational and portfolio purposes.

---

## 👨‍💻 Author

EduTrack Pro — Advanced DBMS Academic Project

