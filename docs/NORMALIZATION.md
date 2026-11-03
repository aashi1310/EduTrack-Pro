# EduTrack Pro — Database Normalization

> Demonstrating that the EduTrack Pro schema satisfies **Third Normal Form (3NF)**.

---

## Definitions

| Normal Form | Requirement |
|-------------|-------------|
| **1NF** | All attributes are atomic; no repeating groups; has a primary key |
| **2NF** | In 1NF + every non-key attribute is **fully functionally dependent** on the entire primary key (eliminates partial dependencies) |
| **3NF** | In 2NF + no non-key attribute is **transitively dependent** on the primary key (eliminates transitive dependencies) |

---

## 1NF Compliance

All 16 tables satisfy 1NF:

- ✅ Every table has a primary key (`*_id INT AUTO_INCREMENT PRIMARY KEY`)
- ✅ Every column stores a single atomic value (no comma-separated lists, no arrays)
- ✅ No repeating groups — multi-valued relationships use separate junction tables

**Examples:**
- A student's multiple course enrollments → separate `enrollments` rows (not a comma list in `students`)
- A student's multiple exam results → separate `results` rows (not stored in `enrollments`)
- Attendance records → one row per student per session in `attendance_records`

---

## 2NF Compliance

All tables with composite primary keys satisfy 2NF.

### Table: `results`
**Primary Key:** `(enrollment_id, exam_id)` — composite

| Column | Depends on | Partial? |
|--------|-----------|---------|
| marks_obtained | (enrollment_id, exam_id) | ❌ No — depends on both (a student's score on a specific exam in their specific enrollment) |
| grade_letter | (enrollment_id, exam_id) | ❌ No |
| is_finalized | (enrollment_id, exam_id) | ❌ No |
| remarks | (enrollment_id, exam_id) | ❌ No |

No partial dependencies → **2NF ✅**

### Table: `attendance_records`
**Unique Constraint:** `(session_id, student_id)` — effectively a composite natural key

| Column | Depends on | Partial? |
|--------|-----------|---------|
| status | (session_id, student_id) | ❌ No — status is for this student in this session |
| remarks | (session_id, student_id) | ❌ No |

No partial dependencies → **2NF ✅**

---

## 3NF Compliance

No transitive dependencies exist in the schema.

### Potential transitive dependency — ELIMINATED

#### Bad design (what we did NOT do):

```
❌ students(student_id, roll_number, department_code, department_name)
```

Here: `department_name` depends on `department_code`, which depends on `student_id` — **transitive dependency**.

#### Our 3NF design:

```
✅ students(student_id, roll_number, ..., department_id FK→departments)
✅ departments(department_id, department_code, department_name)
```

`department_name` is only in `departments`. Students reference departments via FK. No transitive dependency. → **3NF ✅**

---

### All 3NF Verifications

| Table | Transitive Dependency Eliminated |
|-------|--------------------------------|
| `students` | `department_name`, `email`, `role_name` removed → moved to `departments`, `users`, `roles` |
| `faculty` | Same: `department_name` → `departments` table |
| `courses` | `department_name` → `departments` FK |
| `course_offerings` | `course_name`, `term_name`, `faculty_name` → separate FKs |
| `enrollments` | `course_code`, `student_name` → separate FKs |
| `results` | `exam_name`, `course_code`, `student_name` → separate FKs |
| `attendance_records` | `session_date`, `offering_id` → via `session_id` FK |
| `notifications` | No transitive deps (simple user → message structure) |
| `audit_logs` | `user_email` not stored — only `user_id` FK |
| `system_settings` | Single-key/value pairs — fully atomic |

---

## Functional Dependencies Summary

```
departments:
  department_id → department_code, department_name, description

roles:
  role_id → role_name, description

users:
  user_id → email, password_hash, role_id, is_active, last_login
  email → user_id (candidate key)

students:
  student_id → user_id, roll_number, first_name, last_name, department_id,
               current_semester, admission_date, date_of_birth, gender, phone,
               academic_status
  roll_number → student_id (candidate key)
  user_id → student_id (candidate key — 1:1 with users)

faculty:
  faculty_id → user_id, employee_id, first_name, last_name, department_id,
               designation, phone, date_of_joining
  employee_id → faculty_id (candidate key)

courses:
  course_id → course_code, course_name, department_id, credit_hours, course_type
  course_code → course_id (candidate key)

academic_terms:
  term_id → term_code, term_name, academic_year, semester_type, start_date, end_date,
             is_active, is_completed
  term_code → term_id (candidate key)

course_offerings:
  offering_id → course_id, term_id, faculty_id, section_name, max_capacity,
                schedule_day, schedule_time, room
  (course_id, term_id, section_name) → offering_id (candidate key)

enrollments:
  enrollment_id → student_id, offering_id, enrollment_date, status
  (student_id, offering_id) → enrollment_id (candidate key)

results:
  result_id → enrollment_id, exam_id, marks_obtained, grade_letter, is_finalized
  (enrollment_id, exam_id) → result_id (candidate key)

examinations:
  exam_id → offering_id, exam_name, exam_type, exam_date, max_marks, passing_marks,
             weightage, is_published

attendance_sessions:
  session_id → offering_id, session_date, session_type, topic_covered, created_by

attendance_records:
  record_id → session_id, student_id, status, remarks
  (session_id, student_id) → record_id (candidate key)

notifications:
  notification_id → user_id, title, message, notification_type, is_read

audit_logs:
  log_id → user_id, action, entity_type, entity_id, old_values, new_values, ip_address

system_settings:
  setting_id → setting_key, setting_value, description, updated_by
  setting_key → setting_id (candidate key)
```

All functional dependencies go from a key (primary or candidate) to non-key attributes only.  
No non-key attribute determines another non-key attribute. → **3NF ✅**

---

## BCNF Note

The schema also satisfies **Boyce-Codd Normal Form (BCNF)** because in every non-trivial functional dependency `X → Y`, `X` is a superkey. The only non-trivial dependencies are from primary keys or candidate keys.

---

## Denormalization Decision Record

**Intentional denormalization:** The `grade_letter` column in `results` is computed and stored redundantly (it could be derived from `marks_obtained` and `examinations.max_marks` using `fn_get_grade_letter`). This is an accepted performance optimization — computing grade letters on every query would be expensive at scale. The trigger/procedure ensures it stays consistent when marks change.

This is a **controlled denormalization with enforced consistency** — a recognized database design pattern.

