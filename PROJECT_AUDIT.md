# EduTrack Pro — Comprehensive Project Audit & Architectural Assessment

> **Project Name:** EduTrack Pro — Academic Management & Institutional Analytics Platform  
> **Workspace Root:** `c:\Users\aashi\OneDrive\Desktop\EDUTRACK`  
> **Backend Port:** `5000` | **Frontend Port:** `5173`  
> **Database:** MySQL 8.x (`edutrack` database, InnoDB, UTF8mb4)  
> **Audit Date:** November 2026  
> **Architecture:** Modern Decoupled SPA (React 18 + Vite) & REST API (Node.js/Express) + Stored Relational Logic

---

## 1. Executive Summary

EduTrack Pro is an enterprise-grade Academic Management and Institutional Analytics System designed for higher education institutions. The system models the complete academic lifecycle across three authenticated roles: **System Administrator (`ADMIN`)**, **Faculty Instructor (`FACULTY`)**, and **Student (`STUDENT`)**.

The platform is designed around strict transactional integrity, real-time analytics, automated stored database logic, role-based access control (RBAC), and responsive data-dense interfaces tailored for academic administration.

### Technology Stack Overview
- **Client Application:** React 18, Vite 5, React Router v6, Tailwind CSS 3, Lucide React, Recharts, Axios.
- **Server Application:** Node.js, Express.js 4, `mysql2/promise` connection pooling, JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors`.
- **Database Engine:** MySQL 8.x with 16 Normalized Tables, 7 Pre-compiled Relational Views, 5 ACID Stored Procedures, 3 Stored Functions, and 5 Automated Audit/Validation Triggers.

---

## 2. Comprehensive System Audit Table

| # | Area / Subsystem | Existing Implementation | Missing Functionality & Expansion Opportunities | Status |
|---|------------------|-------------------------|------------------------------------------------|--------|
| **1** | **Frontend Setup** | React 18 SPA bootstrapped with Vite 5. Tailored Tailwind CSS design system with custom palette (`navy`, `brand`), custom scrollbars, and toast animations. Complete Lucide icon integration and Recharts data visualization. Entry point `main.jsx` and `App.jsx` fully configured. | Optional PWA service worker; SSR/SSG (not needed for this SaaS intranet dashboard). | **COMPLETE** |
| **2** | **React Routing** | React Router v6 with `BrowserRouter`. Dynamic role-based redirection (`RoleRedirect`), `ProtectedRoute` for authentication verification, and `RoleGuard` for granular RBAC. Code splitting via React `lazy()` and `Suspense` fallbacks. Custom 404 Not Found and 403 Forbidden pages. | Deep linking with query-driven breadcrumb preservation on nested detail pages. | **COMPLETE** |
| **3** | **Authentication & Session** | JWT-based bearer authentication with 7-day expiration. Encrypted passwords via `bcryptjs` (salt rounds = 10). Endpoints `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`. Client-side `AuthContext` with auto-sync from `localStorage`. Automatic logout on 401 HTTP response interceptor. Demo quick-fill credentials for all 3 roles on login page. | Refresh token rotation; Multi-Factor Authentication (MFA/TOTP); OAuth2 / Google SSO integration. | **OPERATIONAL** |
| **4** | **Database Schema** | 16 normalized InnoDB tables (`departments`, `roles`, `users`, `students`, `faculty`, `academic_terms`, `courses`, `course_offerings`, `enrollments`, `class_sessions`, `attendance`, `exams`, `results`, `grade_rules`, `audit_logs`, `notifications`). Full referential integrity, cascading foreign keys, unique composite indexes, and timestamp auditing. | Soft-delete flags (`deleted_at`) across all secondary tables (currently handled via status enums). | **COMPLETE** |
| **5** | **Stored Database Logic** | **7 Views:** `v_student_directory`, `v_attendance_summary`, `v_course_performance`, `v_academic_overview`, `v_published_results`, `v_department_performance`, `v_faculty_course_summary`.<br>**5 Stored Procedures:** `sp_enroll_student` (with `SELECT FOR UPDATE`), `sp_record_attendance`, `sp_publish_exam`, `sp_generate_semester_report`, `sp_update_student_status`.<br>**3 Functions:** `fn_calculate_grade`, `fn_attendance_percentage`, `fn_student_gpa`.<br>**5 Triggers:** Validation triggers (`trg_result_validate_insert`, `trg_result_validate_update`), Audit triggers (`trg_student_update_audit`, `trg_result_insert_audit`, `trg_result_update_audit`). | Scheduled MySQL event to mark past academic terms as completed automatically. | **COMPLETE** |
| **6** | **Backend APIs & Routing** | Modular Express router hierarchy in `server/src/routes/index.js` mounting 15 specialized domain controllers. Consistent response envelopes (`successResponse`, `errorResponse`), centralized HTTP 404 and 500 error middleware, dynamic `/api/health` checking actual database connection and MySQL version. | OpenAPI 3.0 / Swagger interactive docs endpoint; API rate-limiting via Redis token bucket. | **COMPLETE** |
| **7** | **Admin Dashboard** | Institutional KPI statistics (Total Active Students, Faculty, Courses, Departments, Offerings, Avg Attendance). Recharts Bar chart for Department distribution, Grade distribution chart, Term enrollment area trends, Recent audit trail, and Recent student registrations. | Real-time WebSocket streaming of live audit logs; date-range filter on dashboard summary. | **COMPLETE** |
| **8** | **Faculty Dashboard** | Assigned course offering cards with section, room, and enrollment capacity. Teaching metrics (total students taught, sessions held, pending exam evaluations). Upcoming examinations list with grading progress bars. Attendance shortage warning list (< 75%). | Faculty timetable grid view; direct messaging from shortage list to student. | **COMPLETE** |
| **9** | **Student Dashboard** | Personal academic identity card, Department, Semester, and calculated Cumulative GPA (`fn_student_gpa`). Enrolled course cards with per-course attendance progress and Shortage warnings. Published exam marks and grades. System notifications list. | Degree audit progress meter; fee payment ledger view. | **COMPLETE** |
| **10.1** | **Students Management** | Directory table with multi-column sorting, pagination, search by roll number/name/email, and filtering by department, semester, and academic status. 6-tab student profile inspection modal. Student registration with transactional user creation. Status modification modal calling `sp_update_student_status`. CSV export (`/api/students/export/csv`). | Bulk student CSV/Excel import; Student ID card PDF generation. | **COMPLETE** |
| **10.2** | **Faculty Management** | Faculty directory with department and status filtering. Employee code and name search. Modal showing assigned course offerings and enrolled student count. Creation and editing of faculty records with linked user accounts. | Faculty workload calculation formulas; CV/publication attachment uploads. | **COMPLETE** |
| **10.3** | **Department Management** | Department list displaying department code, name, description, active student count, faculty count, course count, and department-wide average attendance. Add/Edit department modal. Safe deletion validation blocking removal of departments with active dependencies. | Department head assignment link; Department budget tracking. | **COMPLETE** |
| **10.4** | **Courses & Offerings** | Course catalogue management with credit (1-6) and department filters. Term-based Course Offering management with section allocation (`A`, `B`, `C`), instructor assignment, capacity caps, and remaining seat calculations. | Course prerequisite tree enforcement during registration; syllabus syllabus file attachments. | **COMPLETE** |
| **10.5** | **Academic Terms** | Academic terms listing with semester type (`Fall`, `Spring`, `Summer`), academic year, start/end dates, active status, and completion status. Add/Edit modal. Atomic transaction ensuring only one term is marked active at a time. | Term archiving wizard to automatically lock all grades and promote student semesters. | **COMPLETE** |
| **10.6** | **Enrollment Management** | Student course enrollment management table with search and filters by term, offering, and status. Manual and administrative enrollment modal executing stored procedure `sp_enroll_student` with ACID row-locking (`SELECT FOR UPDATE`) against section capacity. Status transitions (`Enrolled`, `Completed`, `Dropped`, `Withdrawn`). | Waitlist queue with automated promotion when a seat opens. | **COMPLETE** |
| **10.7** | **Attendance Management** | Session management per course offering (date, time, topic, room). Interactive session attendance grid with quick toggles (`Present`, `Absent`, `Late`, `Excused`). Batch submission calling stored procedure `sp_record_attendance`. Attendance summary view (`v_attendance_summary`) with real-time percentage and shortage calculation (< 75%). | Biometric / QR code check-in scanner integration; automated SMS/Email absence alerts. | **COMPLETE** |
| **10.8** | **Examinations Management** | Exam management supporting multiple types (`Quiz`, `Midterm`, `Final`, `Assignment`, `Project`). Validation of max marks (> 0) and weightage percentage. Exam creation, draft editing, and draft deletion. Formal publication workflow via stored procedure `sp_publish_exam` which publishes grades and notifies enrolled students. | Exam scheduling conflict detector across courses sharing students. | **COMPLETE** |
| **10.9** | **Results & Marks Entry** | Marksheet entry page for faculty to submit grades per student for an exam. Database triggers enforce `marks_obtained <= max_marks` and auto-calculate letter grade from `grade_rules`. Individual result edit modal. Comprehensive student transcript page with term reports via `sp_generate_semester_report` and GPA calculation. | Grade curve distribution tool; official digitally-signed PDF transcript generator. | **COMPLETE** |
| **11** | **Academic Analytics** | Institutional overview dashboard with overall pass rates, institutional average score, and top courses. Department performance comparison table (`v_department_performance`). Attendance distribution bracket chart and shortage rosters. Grade point distribution chart. Window function rankings (`DENSE_RANK`) for top students across the university and within departments. | Predictive analytics model (e.g. at-risk student dropout early warning system). | **COMPLETE** |
| **12** | **Notifications System** | Notification records in database linked by user ID (`INFO`, `WARNING`, `SUCCESS`, `ALERT`). Navbar dropdown popover with unread counter badge and auto-polling every 30 seconds. Mark as read and Mark all as read endpoints. Dedicated Notification List page. Automatic notifications generated on exam publication via `sp_publish_exam`. | Real-time WebSockets / SSE; push notifications; email notification dispatch. | **COMPLETE** |
| **13** | **Audit Logging** | Complete audit trail in `audit_logs` capturing `user_id`, `action_type` (`INSERT`, `UPDATE`, `DELETE`, `LOGIN`, `STATUS_CHANGE`), `table_name`, `record_id`, previous values (`old_values`), new values (`new_values`), `ip_address`, and `action_time`. Automated logging from MySQL triggers and server utility `logAuditEvent`. Dedicated Admin Audit Log page with search, filters, and pagination. | Audit log export to CSV/JSON; automated integrity hashing / tamper-detection. | **COMPLETE** |
| **14** | **Profile & Settings** | User Profile page with role badge, contact details, academic/departmental affiliation, and last login timestamp. Phone number update. Change password modal with current password verification and bcrypt hashing. Settings page with interface preferences and security overview. | Profile avatar photo upload; dark mode theme toggle persistence. | **COMPLETE** |
| **15** | **Migration Runner** | Node.js automated migration runner (`database/run_migrations.js`) with dual-strategy execution: native MySQL CLI (preferred) and `mysql2` DELIMITER parser fallback. Handles complex stored procedures, functions, triggers, and seed data across 7 ordered SQL files. | Rollback / down migration scripts; versioned schema migration table (`schema_migrations`). | **COMPLETE** |
| **16** | **Security, CORS & Headers** | `helmet` middleware for security headers (CSP, frameguard, XSS protection). CORS strictly configured using `CLIENT_URL` environment variable (allowing trusted frontend origins and rejecting unauthorized cross-origin requests). Parameterized SQL queries preventing SQL injection across all queries. JWT expiration and secret enforcement. | CSRF tokens for state-changing operations; IP rate limiting via `express-rate-limit`. | **COMPLETE** |

---

## 3. End-to-End Dependency Map

This map traces every user-facing client screen through its network API calls, backend controllers, and underlying database objects.

```
┌─────────────────────────────────┐
│     CLIENT (React 18 SPA)       │
└────────────────┬────────────────┘
                 │ HTTP (Axios /api)
                 ▼
┌─────────────────────────────────┐
│     SERVER (Express 4 API)      │
└────────────────┬────────────────┘
                 │ SQL (mysql2/promise)
                 ▼
┌─────────────────────────────────┐
│     DATABASE (MySQL 8.x)        │
└─────────────────────────────────┘
```

### Page-by-Page Dependency Trace

| Frontend Page / Component | Client Route | API Service Call | HTTP Route | Server Controller & Method | Database Tables / Views / Routines |
|---------------------------|--------------|------------------|------------|----------------------------|-----------------------------------|
| **Login Page** | `/login` | `authService.login` | `POST /api/auth/login` | `auth.controller.js`<br>`login()` | `users`, `roles`, `students`, `faculty`, `audit_logs` |
| **User Profile / Header** | *All pages* | `authService.getMe` | `GET /api/auth/me` | `auth.controller.js`<br>`getMe()` | `users`, `roles`, `students`, `faculty`, `departments` |
| **Admin Dashboard** | `/admin/dashboard` | `dashboardService.getAdminDashboard` | `GET /api/dashboard/admin` | `dashboard.controller.js`<br>`getAdminDashboard()` | `students`, `faculty`, `courses`, `departments`, `course_offerings`, `grade_rules`, `results`, `academic_terms`, `audit_logs`, `v_attendance_summary` |
| **Faculty Dashboard** | `/faculty/dashboard` | `dashboardService.getFacultyDashboard` | `GET /api/dashboard/faculty` | `dashboard.controller.js`<br>`getFacultyDashboard()` | `course_offerings`, `courses`, `academic_terms`, `enrollments`, `class_sessions`, `exams`, `results`, `v_attendance_summary` |
| **Student Dashboard** | `/student/dashboard` | `dashboardService.getStudentDashboard` | `GET /api/dashboard/student` | `dashboard.controller.js`<br>`getStudentDashboard()` | `students`, `departments`, `enrollments`, `course_offerings`, `courses`, `faculty`, `exams`, `results`, `notifications`, `v_attendance_summary`, `fn_student_gpa` |
| **Student Directory** | `/admin/students`<br>`/faculty/students` | `studentService.getStudents` | `GET /api/students` | `student.controller.js`<br>`getStudents()` | `v_student_directory`, `users`, `students`, `departments`, `fn_student_gpa` |
| **Student Detail Modal** | `/admin/students`<br>`/faculty/students` | `studentService.getStudentById` | `GET /api/students/:id` | `student.controller.js`<br>`getStudentById()` | `v_student_directory`, `enrollments`, `course_offerings`, `courses`, `academic_terms`, `faculty`, `exams`, `results`, `v_attendance_summary`, `fn_student_gpa` |
| **Student Registration** | `/admin/students` | `studentService.createStudent` | `POST /api/students` | `student.controller.js`<br>`createStudent()` | `users`, `students`, `roles`, `audit_logs` (Transaction) |
| **Student Edit** | `/admin/students` | `studentService.updateStudent` | `PATCH /api/students/:id` | `student.controller.js`<br>`updateStudent()` | `students`, `audit_logs` (Transaction) |
| **Student Status Modal** | `/admin/students` | `studentService.updateStudentStatus` | `PATCH /api/students/:id/status` | `student.controller.js`<br>`updateStudentStatus()` | `sp_update_student_status`, `students`, `users`, `audit_logs` |
| **Student CSV Export** | `/admin/students` | `studentService.exportCsv` | `GET /api/students/export/csv` | `student.controller.js`<br>`exportStudentsCsv()` | `v_student_directory` |
| **Faculty Management** | `/admin/faculty` | `facultyService.getFacultyList` | `GET /api/faculty` | `faculty.controller.js`<br>`getFacultyList()` | `faculty`, `users`, `departments`, `course_offerings` |
| **Faculty Detail Modal** | `/admin/faculty` | `facultyService.getFacultyById` | `GET /api/faculty/:id` | `faculty.controller.js`<br>`getFacultyById()` | `faculty`, `users`, `departments`, `course_offerings`, `courses`, `academic_terms`, `enrollments` |
| **Faculty Create** | `/admin/faculty` | `facultyService.createFaculty` | `POST /api/faculty` | `faculty.controller.js`<br>`createFaculty()` | `users`, `faculty`, `roles`, `audit_logs` (Transaction) |
| **Faculty Edit** | `/admin/faculty` | `facultyService.updateFaculty` | `PATCH /api/faculty/:id` | `faculty.controller.js`<br>`updateFaculty()` | `faculty`, `audit_logs` |
| **Departments** | `/admin/departments` | `deptService.getDepartments` | `GET /api/departments` | `dept.controller.js`<br>`getDepartments()` | `departments`, `students`, `faculty`, `courses`, `v_attendance_summary` |
| **Department Create** | `/admin/departments` | `deptService.createDepartment` | `POST /api/departments` | `dept.controller.js`<br>`createDepartment()` | `departments`, `audit_logs` |
| **Department Edit** | `/admin/departments` | `deptService.updateDepartment` | `PATCH /api/departments/:id` | `dept.controller.js`<br>`updateDepartment()` | `departments` |
| **Department Delete** | `/admin/departments` | `deptService.deleteDepartment` | `DELETE /api/departments/:id` | `dept.controller.js`<br>`deleteDepartment()` | `departments`, `students`, `faculty`, `courses` |
| **Course Catalogue** | `/admin/courses`<br>`/faculty/courses`<br>`/student/courses` | `courseService.getCourses` | `GET /api/courses` | `course.controller.js`<br>`getCourses()` | `courses`, `departments`, `course_offerings` |
| **Course Create** | `/admin/courses` | `courseService.createCourse` | `POST /api/courses` | `course.controller.js`<br>`createCourse()` | `courses`, `audit_logs` |
| **Course Edit** | `/admin/courses` | `courseService.updateCourse` | `PATCH /api/courses/:id` | `course.controller.js`<br>`updateCourse()` | `courses` |
| **Course Offerings** | `/admin/courses` | `courseService.getOfferings` | `GET /api/courses/offerings` | `course.controller.js`<br>`getCourseOfferings()` | `course_offerings`, `courses`, `departments`, `academic_terms`, `faculty`, `enrollments`, `class_sessions`, `exams` |
| **Offering Create** | `/admin/courses` | `courseService.createOffering` | `POST /api/courses/offerings` | `course.controller.js`<br>`createCourseOffering()` | `course_offerings`, `audit_logs` |
| **Academic Terms** | `/admin/terms` | `termService.getTerms` | `GET /api/terms` | `term.controller.js`<br>`getTerms()` | `academic_terms`, `course_offerings`, `enrollments` |
| **Academic Term Create** | `/admin/terms` | `termService.createTerm` | `POST /api/terms` | `term.controller.js`<br>`createTerm()` | `academic_terms` (Transaction) |
| **Academic Term Edit** | `/admin/terms` | `termService.updateTerm` | `PATCH /api/terms/:id` | `term.controller.js`<br>`updateTerm()` | `academic_terms` (Transaction) |
| **Enrollments Page** | `/admin/enrollments` | `enrollmentService.getEnrollments` | `GET /api/enrollments` | `enrollment.controller.js`<br>`getEnrollments()` | `enrollments`, `students`, `departments`, `course_offerings`, `courses`, `academic_terms`, `faculty`, `v_attendance_summary` |
| **Enroll Student Modal** | `/admin/enrollments` | `enrollmentService.enrollStudent` | `POST /api/enrollments` | `enrollment.controller.js`<br>`enrollStudent()` | `sp_enroll_student`, `course_offerings`, `enrollments`, `audit_logs` |
| **Attendance Sessions** | `/admin/attendance`<br>`/faculty/attendance` | `attendanceService.getSessions` | `GET /api/attendance/sessions` | `attendance.controller.js`<br>`getOfferingSessions()` | `class_sessions`, `attendance` |
| **Create Class Session** | `/faculty/attendance` | `attendanceService.createSession` | `POST /api/attendance/sessions` | `attendance.controller.js`<br>`createSession()` | `class_sessions` |
| **Session Mark Attendance** | `/faculty/attendance` | `attendanceService.getSessionAttendance` | `GET /api/attendance/sessions/:id/records` | `attendance.controller.js`<br>`getSessionAttendance()` | `class_sessions`, `course_offerings`, `courses`, `enrollments`, `students`, `attendance`, `fn_attendance_percentage` |
| **Submit Attendance** | `/faculty/attendance` | `attendanceService.recordAttendance` | `POST /api/attendance/sessions/:id/records` | `attendance.controller.js`<br>`recordSessionAttendance()` | `sp_record_attendance`, `attendance` (Batch Transaction) |
| **Attendance Summary** | `/admin/attendance`<br>`/student/attendance` | `attendanceService.getAttendanceSummary` | `GET /api/attendance/summary` | `attendance.controller.js`<br>`getAttendanceSummary()` | `v_attendance_summary` |
| **Examinations List** | `/admin/examinations`<br>`/faculty/examinations`<br>`/student/examinations` | `examService.getExams` | `GET /api/exams` | `exam.controller.js`<br>`getExams()` | `exams`, `course_offerings`, `courses`, `academic_terms`, `faculty`, `enrollments`, `results` |
| **Create Exam** | `/faculty/examinations` | `examService.createExam` | `POST /api/exams` | `exam.controller.js`<br>`createExam()` | `exams`, `audit_logs` |
| **Publish Exam** | `/faculty/examinations` | `examService.publishExam` | `POST /api/exams/:id/publish` | `exam.controller.js`<br>`publishExam()` | `sp_publish_exam`, `exams`, `results`, `notifications`, `audit_logs` |
| **Marks Entry Sheet** | `/faculty/marks-entry` | `resultService.getExamMarksheet` | `GET /api/results/exam/:id` | `result.controller.js`<br>`getExamMarksheet()` | `exams`, `course_offerings`, `courses`, `academic_terms`, `faculty`, `enrollments`, `students`, `departments`, `results` |
| **Save Marks (Batch)** | `/faculty/marks-entry` | `resultService.saveMarks` | `POST /api/results` | `result.controller.js`<br>`saveMarks()` | `results`, `trg_result_validate_insert`, `trg_result_validate_update`, `trg_result_insert_audit`, `grade_rules`, `fn_calculate_grade` |
| **Academic Results** | `/admin/results`<br>`/faculty/results`<br>`/student/results` | `resultService.getResults` | `GET /api/results` | `result.controller.js`<br>`getResults()` | `results`, `exams`, `enrollments`, `students`, `departments`, `course_offerings`, `courses`, `academic_terms` |
| **Student Transcript** | `/student/results`<br>`/admin/students` | `resultService.getStudentResults` | `GET /api/results/student/:id` | `result.controller.js`<br>`getStudentResults()` | `v_published_results`, `sp_generate_semester_report`, `fn_student_gpa` |
| **Academic Analytics** | `/admin/analytics`<br>`/faculty/analytics`<br>`/student/analytics` | `analyticsService.getOverview`<br>`analyticsService.getDepartments`<br>`analyticsService.getAttendance`<br>`analyticsService.getPerformance`<br>`analyticsService.getRankings` | `GET /api/analytics/overview`<br>`GET /api/analytics/departments`<br>`GET /api/analytics/attendance`<br>`GET /api/analytics/performance`<br>`GET /api/analytics/rankings` | `analytics.controller.js` | `v_department_performance`, `v_attendance_summary`, `v_course_performance`, `students`, `departments`, `enrollments`, `results`, `exams`, `grade_rules`, `fn_student_gpa` (Window Functions `DENSE_RANK`) |
| **Notifications Dropdown** | *Navbar / Header* | `notificationService.getNotifications` | `GET /api/notifications` | `notification.controller.js`<br>`getNotifications()` | `notifications` |
| **Notification Center** | `/notifications` | `notificationService.getNotifications`<br>`notificationService.markAsRead`<br>`notificationService.markAllAsRead` | `GET /api/notifications`<br>`PATCH /api/notifications/:id/read`<br>`PATCH /api/notifications/read-all` | `notification.controller.js` | `notifications` |
| **Audit Logs Page** | `/admin/audit-logs` | `auditService.getAuditLogs` | `GET /api/audit-logs` | `audit.controller.js`<br>`getAuditLogs()` | `audit_logs`, `users`, `roles` |
| **Profile Page** | `/profile`<br>`/student/profile` | `profileService.getProfile`<br>`profileService.updateProfile` | `GET /api/profile`<br>`PATCH /api/profile` | `profile.controller.js` | `users`, `roles`, `students`, `faculty`, `departments` |
| **Settings / Password** | `/settings`<br>`/student/settings` | `profileService.changePassword` | `PATCH /api/profile/password` | `profile.controller.js`<br>`changePassword()` | `users`, `audit_logs` |

---

## 4. Architectural Verification Summary

1. **Transactional Integrity:**  
   Critical operations (e.g., student course enrollment `sp_enroll_student`, exam marks batch insertion `saveMarks`, single-active academic term switching, student registration) run in ACID transactions. Concurrency bottlenecks on section capacity are resolved using row-level locking (`SELECT ... FOR UPDATE`).

2. **Automated Trigger Safety:**  
   Grade calculations and range checks (`0 <= marks_obtained <= max_marks`) occur at the database engine tier via triggers `trg_result_validate_insert` and `trg_result_validate_update`. Manual faculty override errors or invalid client payloads are prevented by MySQL engine rejection.

3. **Role-Based Security Boundary:**  
   Every incoming HTTP request traverses `authenticate` (JWT verification) followed by route-level `roleGuard(['ADMIN', ...])`. Controllers additionally enforce record-level authorization (e.g., students restricted to their own IDs; faculty restricted to assigned offerings).

4. **Health & Reliability:**  
   Dynamic backend `/api/health` performs a live round-trip query (`SELECT VERSION(), NOW()`) returning `200 ONLINE` or `503 DEGRADED` if the database becomes unreachable, providing a reliable probe for monitoring tools.
