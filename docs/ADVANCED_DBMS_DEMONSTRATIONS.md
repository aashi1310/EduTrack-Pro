# EduTrack Pro — Advanced DBMS Demonstrations

> SQL demonstrations suitable for DBMS viva, academic evaluation, and portfolio review.
> All queries are tested against the `edutrack` MySQL 8.0 database.

---

## 1. Schema Normalization (3NF)

See [`NORMALIZATION.md`](./NORMALIZATION.md) for full dependency analysis.

Quick verification — no partial or transitive dependencies in the student table:

```sql
-- Each non-key attribute depends ONLY on the primary key
DESCRIBE students;
-- department_name is NOT stored in students — it's in departments (no transitive dependency)
SELECT s.roll_number, s.first_name, d.department_name
FROM students s
JOIN departments d ON s.department_id = d.department_id
LIMIT 5;
```

---

## 2. Index Inspection

```sql
-- Show all indexes on the students table
SHOW INDEX FROM students;

-- Show all indexes on results (covering index for analytics queries)
SHOW INDEX FROM results;

-- Show composite index on attendance_records
SHOW INDEX FROM attendance_records;

-- View the execution plan for the student search query
EXPLAIN
SELECT s.roll_number, s.first_name, s.last_name, d.department_code
FROM students s
JOIN departments d ON s.department_id = d.department_id
WHERE s.academic_status = 'Active'
ORDER BY s.roll_number ASC
LIMIT 10;
```

Expected: `key` column shows index used; `type` shows `ref` or `range` (not `ALL` for full scan).

---

## 3. EXPLAIN Query Analysis

```sql
-- Query 1: Student directory search with multi-column filter
EXPLAIN
SELECT *
FROM v_student_directory
WHERE department_code = 'CS'
  AND academic_status = 'Active'
ORDER BY roll_number
LIMIT 20 OFFSET 0;

-- Query 2: Attendance percentage calculation
EXPLAIN
SELECT
  s.roll_number,
  fn_get_attendance_percentage(s.student_id, 3) AS attendance_pct
FROM students s
WHERE s.academic_status = 'Active';

-- Query 3: Results with joins (multi-table)
EXPLAIN
SELECT
  r.result_id,
  s.roll_number,
  e.exam_name,
  r.marks_obtained,
  r.grade_letter
FROM results r
JOIN enrollments en ON r.enrollment_id = en.enrollment_id
JOIN students s ON en.student_id = s.student_id
JOIN examinations e ON r.exam_id = e.exam_id
WHERE e.offering_id = 1
ORDER BY s.roll_number;
```

---

## 4. CTEs (Common Table Expressions)

```sql
-- Department performance summary using CTE
WITH dept_stats AS (
  SELECT
    d.department_name,
    COUNT(DISTINCT s.student_id) AS total_students,
    AVG(r.marks_obtained) AS avg_score
  FROM departments d
  LEFT JOIN students s ON s.department_id = d.department_id
  LEFT JOIN enrollments e ON e.student_id = s.student_id
  LEFT JOIN results r ON r.enrollment_id = e.enrollment_id
  WHERE r.marks_obtained IS NOT NULL
  GROUP BY d.department_id, d.department_name
),
dept_attendance AS (
  SELECT
    d.department_name,
    AVG(fn_get_attendance_percentage(s.student_id, ens.offering_id)) AS avg_attendance
  FROM departments d
  JOIN students s ON s.department_id = d.department_id
  JOIN enrollments ens ON ens.student_id = s.student_id
  GROUP BY d.department_name
)
SELECT
  ds.department_name,
  ds.total_students,
  ROUND(ds.avg_score, 2) AS avg_score,
  ROUND(da.avg_attendance, 2) AS avg_attendance_pct
FROM dept_stats ds
JOIN dept_attendance da ON ds.department_name = da.department_name
ORDER BY ds.avg_score DESC;
```

---

## 5. Window Functions — DENSE_RANK for Student Rankings

```sql
-- Student performance ranking within each department
SELECT
  s.roll_number,
  CONCAT(s.first_name, ' ', s.last_name) AS student_name,
  d.department_code,
  ROUND(AVG(r.marks_obtained), 2) AS avg_score,
  DENSE_RANK() OVER (
    PARTITION BY s.department_id
    ORDER BY AVG(r.marks_obtained) DESC
  ) AS dept_rank,
  DENSE_RANK() OVER (
    ORDER BY AVG(r.marks_obtained) DESC
  ) AS overall_rank
FROM students s
JOIN departments d ON s.department_id = d.department_id
JOIN enrollments e ON e.student_id = s.student_id
JOIN results r ON r.enrollment_id = e.enrollment_id
WHERE r.marks_obtained IS NOT NULL
GROUP BY s.student_id, s.roll_number, s.first_name, s.last_name, d.department_code, s.department_id
ORDER BY dept_rank, d.department_code;
```

---

## 6. Stored Procedure Calls

```sql
-- Enroll a student (with concurrency protection via SELECT FOR UPDATE)
CALL sp_enroll_student(1, 2, CURDATE(), @enrollment_id);
SELECT @enrollment_id AS new_enrollment_id;

-- Compute grades for an offering (batch operation)
CALL sp_compute_grades(1);

-- Update student status with audit trail
CALL sp_update_student_status(1, 'Suspended', 1);

-- Generate full academic report for student 1, current term
CALL sp_generate_student_report(1, 1);
```

---

## 7. Stored Function Calls

```sql
-- Get grade letter for a score
SELECT fn_get_grade_letter(87.5) AS grade;   -- Returns 'A'
SELECT fn_get_grade_letter(45.0) AS grade;   -- Returns 'F'

-- Get GPA for student 1, term 1
SELECT fn_calculate_gpa(1, 1) AS gpa;

-- Get attendance percentage for student 1, offering 1
SELECT fn_get_attendance_percentage(1, 1) AS attendance_pct;
```

---

## 8. Trigger Demonstration

### Trigger 1: Capacity Check on Enrollment

```sql
-- First, fill an offering to max capacity
UPDATE course_offerings SET max_capacity = 1 WHERE offering_id = 5;

-- Attempt to enroll a second student — trigger fires, raises error
INSERT INTO enrollments (student_id, offering_id, enrollment_date, status)
VALUES (999, 5, CURDATE(), 'Enrolled');
-- Expected: ERROR 1644 (45000): Enrollment capacity exceeded for this section.
```

### Trigger 2: Block finalized result modification

```sql
-- Mark a result as finalized
UPDATE results SET is_finalized = TRUE WHERE result_id = 1;

-- Attempt to change marks — trigger prevents it
UPDATE results SET marks_obtained = 99 WHERE result_id = 1;
-- Expected: ERROR 1644 (45000): Cannot modify a finalized result.
```

### Trigger 3: Audit trail on student status change

```sql
-- Update status
UPDATE students SET academic_status = 'Graduated' WHERE student_id = 1;

-- Check audit log
SELECT * FROM audit_logs WHERE entity_type = 'Student' ORDER BY created_at DESC LIMIT 5;
```

---

## 9. Transaction with ROLLBACK Demonstration (ACID)

```sql
START TRANSACTION;

-- Step 1: Deactivate all terms
UPDATE academic_terms SET is_active = FALSE;

-- Step 2: Activate the new term
UPDATE academic_terms SET is_active = TRUE WHERE term_code = 'FALL2026';

-- Verify
SELECT term_code, is_active FROM academic_terms;

-- If something is wrong:
ROLLBACK;  -- Returns both tables to original state

-- If correct:
COMMIT;
```

This demonstrates **Atomicity** — either both updates commit or neither does.

---

## 10. ACID Compliance Evidence

| Property | Mechanism in EduTrack Pro |
|----------|--------------------------|
| **Atomicity** | All writes use `transaction()` helper (wraps in `BEGIN`/`COMMIT`/`ROLLBACK`) |
| **Consistency** | FK constraints, CHECK constraints, trigger validations enforce business rules |
| **Isolation** | `SELECT ... FOR UPDATE` in `sp_enroll_student` prevents phantom reads during concurrent enrollment |
| **Durability** | InnoDB write-ahead log ensures committed transactions survive crashes |

---

## 11. Concurrency Control — SELECT FOR UPDATE

```sql
-- This is what sp_enroll_student does internally to prevent race conditions:
START TRANSACTION;

-- Lock the course offering row exclusively
SELECT offering_id, max_capacity,
       (SELECT COUNT(*) FROM enrollments WHERE offering_id = 3 AND status = 'Enrolled') AS current_count
FROM course_offerings
WHERE offering_id = 3
FOR UPDATE;

-- Only proceed with insert if current_count < max_capacity
INSERT INTO enrollments (student_id, offering_id, enrollment_date, status)
VALUES (7, 3, CURDATE(), 'Enrolled');

COMMIT;
-- Any concurrent transaction trying the same offering_id waits until this COMMIT
```

---

## 12. Normalization Query (1NF → 3NF Verification)

```sql
-- Verify no repeating groups (1NF): Each cell is atomic
-- attendance_records stores one status per student per session (UNIQUE constraint)
SELECT COUNT(*) AS unique_combinations
FROM attendance_records
GROUP BY session_id, student_id
HAVING COUNT(*) > 1;  -- Should return 0 rows

-- Verify 2NF: No partial dependencies
-- results table: marks depend on (enrollment_id, exam_id) composite PK — not just one column
DESCRIBE results;

-- Verify 3NF: No transitive dependencies
-- department_name is NOT in students table — accessed via FK JOIN
SHOW COLUMNS FROM students LIKE '%name%';  -- Only first_name, last_name for the student

-- department_code is NOT in courses — accessed via FK JOIN to departments
SHOW COLUMNS FROM courses LIKE '%department%';  -- Only department_id (FK)
```

---

## 13. View Business Logic

```sql
-- The attendance view excludes EXCUSED from the denominator (university policy)
-- This demonstrates meaningful business logic in a view

-- View definition (simplified):
-- attendance_pct = attended / (total_sessions - excused_sessions) * 100

-- Test with data:
SELECT
  student_id,
  offering_id,
  total_sessions,
  attended_sessions,
  excused_sessions,
  absent_sessions,
  attendance_percentage
FROM v_attendance_summary
WHERE student_id = 1
ORDER BY offering_id;
```

---

## 14. Performance Optimization — Covering Index

```sql
-- The results table has a covering index on (enrollment_id, exam_id)
-- This means the query can be satisfied from the index alone (no table lookup)

EXPLAIN
SELECT enrollment_id, exam_id, marks_obtained
FROM results
WHERE enrollment_id = 5;
-- Expected: Extra column shows "Using index" — data read from index only
```

