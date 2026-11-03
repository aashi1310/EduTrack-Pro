# EduTrack Pro — Database Documentation

> Complete reference for all 16 tables, 7 views, 5 stored procedures, 3 stored functions, and 5 triggers.

---

## 📋 Tables (16)

### 1. `departments`
| Column | Type | Notes |
|--------|------|-------|
| department_id | INT PK AUTO_INCREMENT | |
| department_code | VARCHAR(10) UNIQUE NOT NULL | e.g., `CS`, `EE` |
| department_name | VARCHAR(100) NOT NULL | |
| description | TEXT NULL | |
| created_at / updated_at | TIMESTAMP | Auto-managed |

**Business Rules:** Each faculty member and student must belong to exactly one department.

---

### 2. `roles`
| Column | Type | Notes |
|--------|------|-------|
| role_id | INT PK AUTO_INCREMENT | |
| role_name | VARCHAR(20) UNIQUE | `ADMIN`, `FACULTY`, `STUDENT` |
| description | VARCHAR(255) NULL | |

**Business Rules:** Seeded at startup. All users must have a role.

---

### 3. `users`
| Column | Type | Notes |
|--------|------|-------|
| user_id | INT PK AUTO_INCREMENT | |
| email | VARCHAR(120) UNIQUE NOT NULL | Login identifier |
| password_hash | VARCHAR(255) NOT NULL | bcrypt, 12 rounds |
| role_id | INT FK → roles | |
| is_active | BOOLEAN DEFAULT TRUE | Deactivated users cannot log in |
| last_login | DATETIME NULL | Updated on each login |
| created_at / updated_at | TIMESTAMP | Auto-managed |

**Security:** Passwords are never stored as plaintext. JWT is issued only to active users.

---

### 4. `students`
| Column | Type | Notes |
|--------|------|-------|
| student_id | INT PK AUTO_INCREMENT | |
| user_id | INT FK → users UNIQUE | One-to-one link |
| roll_number | VARCHAR(20) UNIQUE NOT NULL | University assigned |
| first_name | VARCHAR(50) NOT NULL | |
| last_name | VARCHAR(50) NOT NULL | |
| department_id | INT FK → departments | |
| current_semester | TINYINT (1–8) | |
| admission_date | DATE NOT NULL | |
| date_of_birth | DATE NULL | |
| gender | ENUM('Male','Female','Other') NULL | |
| phone | VARCHAR(15) NULL | |
| academic_status | ENUM('Active','Suspended','Graduated','Withdrawn') DEFAULT 'Active' | |
| created_at / updated_at | TIMESTAMP | |

---

### 5. `faculty`
| Column | Type | Notes |
|--------|------|-------|
| faculty_id | INT PK AUTO_INCREMENT | |
| user_id | INT FK → users UNIQUE | |
| employee_id | VARCHAR(20) UNIQUE NOT NULL | |
| first_name | VARCHAR(50) NOT NULL | |
| last_name | VARCHAR(50) NOT NULL | |
| department_id | INT FK → departments | |
| designation | VARCHAR(100) NULL | e.g., Associate Professor |
| phone | VARCHAR(15) NULL | |
| date_of_joining | DATE NULL | |
| created_at / updated_at | TIMESTAMP | |

---

### 6. `courses`
| Column | Type | Notes |
|--------|------|-------|
| course_id | INT PK AUTO_INCREMENT | |
| course_code | VARCHAR(15) UNIQUE NOT NULL | e.g., `CS301` |
| course_name | VARCHAR(150) NOT NULL | |
| department_id | INT FK → departments | |
| credit_hours | TINYINT DEFAULT 3 | |
| course_type | ENUM('Core','Elective','Lab') DEFAULT 'Core' | |
| description | TEXT NULL | |
| created_at / updated_at | TIMESTAMP | |

---

### 7. `academic_terms`
| Column | Type | Notes |
|--------|------|-------|
| term_id | INT PK AUTO_INCREMENT | |
| term_code | VARCHAR(20) UNIQUE NOT NULL | e.g., `FALL2026` |
| term_name | VARCHAR(100) NOT NULL | |
| academic_year | VARCHAR(10) NOT NULL | e.g., `2026-27` |
| semester_type | ENUM('Fall','Spring','Summer') | |
| start_date | DATE NOT NULL | |
| end_date | DATE NOT NULL | |
| is_active | BOOLEAN DEFAULT FALSE | Only one active at a time (enforced by transaction) |
| is_completed | BOOLEAN DEFAULT FALSE | |
| created_at / updated_at | TIMESTAMP | |

---

### 8. `course_offerings`
| Column | Type | Notes |
|--------|------|-------|
| offering_id | INT PK AUTO_INCREMENT | |
| course_id | INT FK → courses | |
| term_id | INT FK → academic_terms | |
| faculty_id | INT FK → faculty NULL | Assigned instructor |
| section_name | VARCHAR(20) NOT NULL | e.g., `A`, `B` |
| max_capacity | INT DEFAULT 40 | Max enrollments enforced by procedure |
| schedule_day | VARCHAR(50) NULL | e.g., `Mon/Wed/Fri` |
| schedule_time | VARCHAR(50) NULL | |
| room | VARCHAR(50) NULL | |
| UNIQUE(course_id, term_id, section_name) | | Prevents duplicate sections |

---

### 9. `enrollments`
| Column | Type | Notes |
|--------|------|-------|
| enrollment_id | INT PK AUTO_INCREMENT | |
| student_id | INT FK → students | |
| offering_id | INT FK → course_offerings | |
| enrollment_date | DATE NOT NULL | |
| status | ENUM('Enrolled','Dropped','Completed','Failed') DEFAULT 'Enrolled' | |
| UNIQUE(student_id, offering_id) | | Prevents duplicate enrollment |
| created_at / updated_at | TIMESTAMP | |

---

### 10. `attendance_sessions`
| Column | Type | Notes |
|--------|------|-------|
| session_id | INT PK AUTO_INCREMENT | |
| offering_id | INT FK → course_offerings | |
| session_date | DATE NOT NULL | |
| session_type | ENUM('Lecture','Lab','Tutorial') DEFAULT 'Lecture' | |
| topic_covered | VARCHAR(255) NULL | |
| created_by | INT FK → users | |
| created_at | TIMESTAMP | |

---

### 11. `attendance_records`
| Column | Type | Notes |
|--------|------|-------|
| record_id | INT PK AUTO_INCREMENT | |
| session_id | INT FK → attendance_sessions | |
| student_id | INT FK → students | |
| status | ENUM('Present','Absent','Late','Excused') DEFAULT 'Absent' | |
| remarks | VARCHAR(255) NULL | |
| UNIQUE(session_id, student_id) | | One record per student per session |

---

### 12. `examinations`
| Column | Type | Notes |
|--------|------|-------|
| exam_id | INT PK AUTO_INCREMENT | |
| offering_id | INT FK → course_offerings | |
| exam_name | VARCHAR(150) NOT NULL | |
| exam_type | ENUM('Quiz','Midterm','Final','Assignment','Lab') | |
| exam_date | DATE NULL | |
| max_marks | DECIMAL(6,2) NOT NULL | |
| passing_marks | DECIMAL(6,2) NOT NULL | |
| weightage | DECIMAL(5,2) DEFAULT 100.00 | % of final grade |
| is_published | BOOLEAN DEFAULT FALSE | Students see exam only after publishing |
| created_at / updated_at | TIMESTAMP | |

---

### 13. `results`
| Column | Type | Notes |
|--------|------|-------|
| result_id | INT PK AUTO_INCREMENT | |
| enrollment_id | INT FK → enrollments | |
| exam_id | INT FK → examinations | |
| marks_obtained | DECIMAL(6,2) NULL | |
| grade_letter | VARCHAR(3) NULL | Computed by `fn_get_grade_letter` |
| remarks | VARCHAR(255) NULL | |
| is_finalized | BOOLEAN DEFAULT FALSE | Finalized results cannot be edited |
| UNIQUE(enrollment_id, exam_id) | | One result per enrollment per exam |

---

### 14. `notifications`
| Column | Type | Notes |
|--------|------|-------|
| notification_id | INT PK AUTO_INCREMENT | |
| user_id | INT FK → users | Target recipient |
| title | VARCHAR(150) NOT NULL | |
| message | TEXT NOT NULL | |
| notification_type | ENUM('Info','Warning','Success','Error') DEFAULT 'Info' | |
| is_read | BOOLEAN DEFAULT FALSE | |
| created_at | TIMESTAMP | |

---

### 15. `audit_logs`
| Column | Type | Notes |
|--------|------|-------|
| log_id | INT PK AUTO_INCREMENT | |
| user_id | INT FK → users NULL | Null for system events |
| action | VARCHAR(100) NOT NULL | e.g., `CREATE_STUDENT` |
| entity_type | VARCHAR(50) NULL | e.g., `Student` |
| entity_id | INT NULL | The affected record's PK |
| old_values | JSON NULL | Before-state snapshot |
| new_values | JSON NULL | After-state snapshot |
| ip_address | VARCHAR(45) NULL | |
| user_agent | VARCHAR(255) NULL | |
| created_at | TIMESTAMP | |

---

### 16. `system_settings`
| Column | Type | Notes |
|--------|------|-------|
| setting_id | INT PK AUTO_INCREMENT | |
| setting_key | VARCHAR(100) UNIQUE NOT NULL | |
| setting_value | TEXT NULL | |
| description | VARCHAR(255) NULL | |
| updated_by | INT FK → users NULL | |
| updated_at | TIMESTAMP | |

---

## 👁 Views (7)

### 1. `v_student_directory`
**Purpose:** Comprehensive student listing joining `students`, `users`, `departments` — includes overall average score computed from results.  
**Used by:** Student management list, student profile, enrollment lookups.

### 2. `v_faculty_directory`
**Purpose:** Faculty listing with department info, course load count.  
**Used by:** Faculty management list, faculty profile.

### 3. `v_attendance_summary`
**Purpose:** Per-student per-offering attendance statistics.
- `total_sessions` = all sessions for the offering
- `attended` = Present + Late  
- `excused` = Excused (excluded from denominator per university policy)
- `attendance_percentage` = (attended / (total_sessions − excused)) × 100

**Used by:** Attendance management view, student dashboard.

### 4. `v_enrollment_details`
**Purpose:** Enrollment records joined with course, term, student, faculty info.  
**Used by:** Enrollment management, student course list.

### 5. `v_exam_results`
**Purpose:** Results joined with exam, course, student info — includes grade letters and percentage.  
**Used by:** Results management, marksheet, student results page.

### 6. `v_course_offerings_detail`
**Purpose:** Course offerings with course name, term, faculty name, enrollment count vs capacity.  
**Used by:** Course management offerings tab, enrollment dropdowns.

### 7. `v_department_analytics`
**Purpose:** Aggregated analytics per department — total students, avg GPA, avg attendance.  
**Used by:** Analytics dashboard department comparison chart.

---

## ⚙️ Stored Procedures (5)

### 1. `sp_enroll_student(p_student_id, p_offering_id, p_enrollment_date, OUT p_enrollment_id)`
**Purpose:** Atomic student enrollment with capacity enforcement.  
**Key features:**
- `SELECT ... FOR UPDATE` on `course_offerings` to prevent race conditions
- Checks `max_capacity` vs current enrollment count
- Verifies student is `Active` and not already enrolled
- Inserts enrollment record inside transaction
- Returns new `enrollment_id` as OUT parameter

```sql
CALL sp_enroll_student(5, 3, CURDATE(), @eid);
SELECT @eid;
```

### 2. `sp_compute_grades(p_offering_id)`
**Purpose:** Batch-compute weighted grade letters for all enrolled students in an offering.  
**Key features:**
- Calculates weighted average across all exams (respecting `weightage`)
- Calls `fn_get_grade_letter` for each student
- Updates `results` table with computed grades
- Updates enrollment status to `Completed` for students above passing threshold

### 3. `sp_update_student_status(p_student_id, p_new_status, p_changed_by)`
**Purpose:** Update student academic status with audit trail.  
**Key features:**
- Validates allowed statuses
- Logs change to `audit_logs` with old and new values (JSON)
- Wraps in transaction

### 4. `sp_record_attendance_bulk(p_session_id, p_records JSON)`
**Purpose:** Bulk insert/update attendance records for an entire session.  
**Key features:**
- Accepts JSON array of `{student_id, status, remarks}` objects
- Uses `INSERT ... ON DUPLICATE KEY UPDATE` for idempotency
- Verifies session exists before inserting

### 5. `sp_generate_student_report(p_student_id, p_term_id)`
**Purpose:** Generate comprehensive academic report for a student in a given term.  
**Returns:** Course-wise results, attendance %, GPA, overall status.

---

## 🔧 Stored Functions (3)

### 1. `fn_get_grade_letter(p_percentage DECIMAL) RETURNS VARCHAR(3)`
| Range | Grade |
|-------|-------|
| ≥ 90 | A+ |
| ≥ 80 | A |
| ≥ 70 | B |
| ≥ 60 | C |
| ≥ 50 | D |
| < 50 | F |

### 2. `fn_calculate_gpa(p_student_id, p_term_id) RETURNS DECIMAL(3,2)`
**Purpose:** Compute GPA for a student in a specific term based on credit-weighted average of grade points.

### 3. `fn_get_attendance_percentage(p_student_id, p_offering_id) RETURNS DECIMAL(5,2)`
**Purpose:** Return attendance percentage for a student in a specific course offering (excused sessions excluded from denominator).

---

## ⚡ Triggers (5)

### 1. `trg_before_enrollment_insert`
**Event:** BEFORE INSERT on `enrollments`  
**Action:** Verifies offering capacity has not been exceeded. Raises `SIGNAL SQLSTATE '45000'` with "Enrollment capacity exceeded" if max_capacity is full.

### 2. `trg_after_enrollment_insert`
**Event:** AFTER INSERT on `enrollments`  
**Action:** Auto-creates a `results` row (null marks) for each published exam in the offering, so the marksheet always shows all enrolled students.

### 3. `trg_before_result_update`
**Event:** BEFORE UPDATE on `results`  
**Action:** Prevents editing finalized results (`is_finalized = TRUE`). Raises signal "Cannot modify a finalized result."

### 4. `trg_after_student_status_update`
**Event:** AFTER UPDATE on `students`  
**Action:** Logs status change to `audit_logs` when `academic_status` column changes.

### 5. `trg_after_user_login`
**Event:** AFTER UPDATE on `users` (when `last_login` changes)  
**Action:** Inserts audit log entry for user login events.

