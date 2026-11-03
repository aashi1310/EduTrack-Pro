-- =============================================================================
-- EDUTRACK PRO — ADVANCED STUDENT ACADEMIC MANAGEMENT & ANALYTICS SYSTEM
-- SCRIPT 08: 20 ADVANCED SQL QUERIES & DBMS DEMONSTRATIONS
-- =============================================================================

USE edutrack;

-- -----------------------------------------------------------------------------
-- 1. INNER JOIN: Student Enrollment & Course Offerings
-- -----------------------------------------------------------------------------
SELECT 
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    c.course_code,
    c.course_name,
    co.section,
    CONCAT(f.first_name, ' ', f.last_name) AS instructor
FROM students s
INNER JOIN enrollments e ON s.student_id = e.student_id
INNER JOIN course_offerings co ON e.offering_id = co.offering_id
INNER JOIN courses c ON co.course_id = c.course_id
INNER JOIN faculty f ON co.faculty_id = f.faculty_id
ORDER BY c.course_code, s.roll_number;

-- -----------------------------------------------------------------------------
-- 2. LEFT JOIN: All Students with their Enrollment and Attendance Percentages
-- -----------------------------------------------------------------------------
SELECT 
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    d.department_code,
    COUNT(e.enrollment_id) AS total_courses_enrolled,
    COALESCE(ROUND(AVG(vas.attendance_percentage), 2), 100.00) AS overall_attendance_pct
FROM students s
JOIN departments d ON s.department_id = d.department_id
LEFT JOIN enrollments e ON s.student_id = e.student_id
LEFT JOIN v_attendance_summary vas ON e.enrollment_id = vas.enrollment_id
GROUP BY s.student_id, s.roll_number, s.first_name, s.last_name, d.department_code
ORDER BY overall_attendance_pct ASC;

-- -----------------------------------------------------------------------------
-- 3. RIGHT JOIN: All Departments and their enrolled active students
-- -----------------------------------------------------------------------------
SELECT 
    d.department_code,
    d.department_name,
    COUNT(s.student_id) AS total_active_students
FROM students s
RIGHT JOIN departments d ON s.department_id = d.department_id AND s.academic_status = 'Active'
GROUP BY d.department_id, d.department_code, d.department_name;

-- -----------------------------------------------------------------------------
-- 4. SELF JOIN: Faculty Mentorship / Department Peer Comparison
-- -----------------------------------------------------------------------------
SELECT 
    f1.employee_code AS senior_code,
    CONCAT(f1.first_name, ' ', f1.last_name) AS senior_faculty,
    f2.employee_code AS junior_code,
    CONCAT(f2.first_name, ' ', f2.last_name) AS colleague,
    d.department_name
FROM faculty f1
JOIN faculty f2 ON f1.department_id = f2.department_id AND f1.joining_date < f2.joining_date
JOIN departments d ON f1.department_id = d.department_id
ORDER BY d.department_name, f1.joining_date;

-- -----------------------------------------------------------------------------
-- 5 & 6. GROUP BY & HAVING: Courses with High Enrollment & Average Score
-- -----------------------------------------------------------------------------
SELECT 
    c.course_code,
    c.course_name,
    COUNT(DISTINCT e.enrollment_id) AS enrolled_students,
    ROUND(AVG(r.marks_obtained / ex.max_marks * 100), 2) AS avg_percentage
FROM courses c
JOIN course_offerings co ON c.course_id = co.course_id
JOIN enrollments e ON co.offering_id = e.offering_id
LEFT JOIN exams ex ON co.offering_id = ex.offering_id
LEFT JOIN results r ON ex.exam_id = r.exam_id AND e.enrollment_id = r.enrollment_id
GROUP BY c.course_id, c.course_code, c.course_name
HAVING COUNT(DISTINCT e.enrollment_id) >= 5
ORDER BY avg_percentage DESC;

-- -----------------------------------------------------------------------------
-- 7. NESTED SUBQUERY: Students scoring above institutional exam average
-- -----------------------------------------------------------------------------
SELECT 
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    c.course_code,
    ex.exam_name,
    r.marks_obtained,
    ex.max_marks
FROM results r
JOIN exams ex ON r.exam_id = ex.exam_id
JOIN enrollments e ON r.enrollment_id = e.enrollment_id
JOIN students s ON e.student_id = s.student_id
JOIN course_offerings co ON ex.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
WHERE r.marks_obtained > (
    SELECT AVG(inner_r.marks_obtained) 
    FROM results inner_r 
    WHERE inner_r.exam_id = ex.exam_id
);

-- -----------------------------------------------------------------------------
-- 8. CORRELATED SUBQUERY: Department-wise Top Scoring Student in Midterms
-- -----------------------------------------------------------------------------
SELECT 
    d.department_code,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS top_student,
    r.marks_obtained
FROM results r
JOIN exams ex ON r.exam_id = ex.exam_id AND ex.exam_type = 'Midterm'
JOIN enrollments e ON r.enrollment_id = e.enrollment_id
JOIN students s ON e.student_id = s.student_id
JOIN departments d ON s.department_id = d.department_id
WHERE r.marks_obtained = (
    SELECT MAX(sub_r.marks_obtained)
    FROM results sub_r
    JOIN exams sub_ex ON sub_r.exam_id = sub_ex.exam_id AND sub_ex.exam_type = 'Midterm'
    JOIN enrollments sub_e ON sub_r.enrollment_id = sub_e.enrollment_id
    JOIN students sub_s ON sub_e.student_id = sub_s.student_id
    WHERE sub_s.department_id = s.department_id
);

-- -----------------------------------------------------------------------------
-- 9. COMMON TABLE EXPRESSION (CTE): Multi-Stage Academic Performance Pipeline
-- -----------------------------------------------------------------------------
WITH CourseAverages AS (
    SELECT 
        co.offering_id,
        c.course_code,
        AVG(r.marks_obtained / ex.max_marks * 100) AS offering_avg_pct
    FROM course_offerings co
    JOIN courses c ON co.course_id = c.course_id
    JOIN exams ex ON co.offering_id = ex.offering_id
    JOIN results r ON ex.exam_id = r.exam_id
    GROUP BY co.offering_id, c.course_code
),
DepartmentSummary AS (
    SELECT 
        d.department_name,
        ROUND(AVG(ca.offering_avg_pct), 2) AS dept_academic_benchmark
    FROM CourseAverages ca
    JOIN course_offerings co ON ca.offering_id = co.offering_id
    JOIN courses c ON co.course_id = c.course_id
    JOIN departments d ON c.department_id = d.department_id
    GROUP BY d.department_name
)
SELECT * FROM DepartmentSummary ORDER BY dept_academic_benchmark DESC;

-- -----------------------------------------------------------------------------
-- 10. RECURSIVE CTE: Academic Semester Progression & Credit Milestones
-- -----------------------------------------------------------------------------
WITH RECURSIVE SemesterProgression AS (
    -- Anchor Member: Starting Semester 1
    SELECT 
        1 AS semester_level,
        20 AS target_credits,
        20 AS cumulative_credits,
        'Foundational Mathematics & Programming' AS curriculum_focus
    UNION ALL
    -- Recursive Member: Iterating to Semester 8
    SELECT 
        semester_level + 1,
        22,
        cumulative_credits + 22,
        CASE 
            WHEN semester_level + 1 = 2 THEN 'Data Structures & Core Hardware'
            WHEN semester_level + 1 = 3 THEN 'Object-Oriented Design & Web Systems'
            WHEN semester_level + 1 = 4 THEN 'Theory of Computation & Algorithms'
            WHEN semester_level + 1 = 5 THEN 'Database Management Systems & Operating Systems'
            WHEN semester_level + 1 = 6 THEN 'Machine Learning & Cloud Infrastructure'
            WHEN semester_level + 1 = 7 THEN 'Distributed Systems & Capstone Phase 1'
            ELSE 'Industry Practicum & Capstone Defense'
        END
    FROM SemesterProgression
    WHERE semester_level < 8
)
SELECT * FROM SemesterProgression;

-- -----------------------------------------------------------------------------
-- 11. ROW_NUMBER(): Unique sequential ranking within each course exam
-- -----------------------------------------------------------------------------
SELECT 
    c.course_code,
    ex.exam_name,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    r.marks_obtained,
    ROW_NUMBER() OVER (
        PARTITION BY ex.exam_id 
        ORDER BY r.marks_obtained DESC, s.roll_number ASC
    ) AS student_position
FROM results r
JOIN exams ex ON r.exam_id = ex.exam_id
JOIN enrollments e ON r.enrollment_id = e.enrollment_id
JOIN students s ON e.student_id = s.student_id
JOIN course_offerings co ON ex.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id;

-- -----------------------------------------------------------------------------
-- 12. RANK(): Ranking with gaps for ties in examination scores
-- -----------------------------------------------------------------------------
SELECT 
    ex.exam_name,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    r.marks_obtained,
    RANK() OVER (
        PARTITION BY ex.exam_id 
        ORDER BY r.marks_obtained DESC
    ) AS rank_with_gaps
FROM results r
JOIN exams ex ON r.exam_id = ex.exam_id
JOIN enrollments e ON r.enrollment_id = e.enrollment_id
JOIN students s ON e.student_id = s.student_id;

-- -----------------------------------------------------------------------------
-- 13. DENSE_RANK(): Ranking without score gaps for official grade percentiles
-- -----------------------------------------------------------------------------
SELECT 
    ex.exam_name,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    r.marks_obtained,
    DENSE_RANK() OVER (
        PARTITION BY ex.exam_id 
        ORDER BY r.marks_obtained DESC
    ) AS dense_rank_position
FROM results r
JOIN exams ex ON r.exam_id = ex.exam_id
JOIN enrollments e ON r.enrollment_id = e.enrollment_id
JOIN students s ON e.student_id = s.student_id;

-- -----------------------------------------------------------------------------
-- 14. LAG() & LEAD(): Score comparison against next higher and lower student
-- -----------------------------------------------------------------------------
SELECT 
    ex.exam_name,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    r.marks_obtained,
    LAG(r.marks_obtained, 1) OVER (
        PARTITION BY ex.exam_id 
        ORDER BY r.marks_obtained DESC
    ) AS score_above_me,
    LEAD(r.marks_obtained, 1) OVER (
        PARTITION BY ex.exam_id 
        ORDER BY r.marks_obtained DESC
    ) AS score_below_me,
    ROUND(
        r.marks_obtained - LEAD(r.marks_obtained, 1) OVER (
            PARTITION BY ex.exam_id 
            ORDER BY r.marks_obtained DESC
        ), 2
    ) AS margin_over_peer
FROM results r
JOIN exams ex ON r.exam_id = ex.exam_id
JOIN enrollments e ON r.enrollment_id = e.enrollment_id
JOIN students s ON e.student_id = s.student_id;

-- -----------------------------------------------------------------------------
-- 15. AGGREGATE WINDOW FUNCTION: Comparing student marks against Course Average
-- -----------------------------------------------------------------------------
SELECT 
    c.course_code,
    ex.exam_name,
    s.roll_number,
    r.marks_obtained,
    ROUND(AVG(r.marks_obtained) OVER (PARTITION BY ex.exam_id), 2) AS exam_mean,
    ROUND(r.marks_obtained - AVG(r.marks_obtained) OVER (PARTITION BY ex.exam_id), 2) AS deviation_from_mean
FROM results r
JOIN exams ex ON r.exam_id = ex.exam_id
JOIN enrollments e ON r.enrollment_id = e.enrollment_id
JOIN students s ON e.student_id = s.student_id
JOIN course_offerings co ON ex.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id;

-- -----------------------------------------------------------------------------
-- 16. STORED PROCEDURE INVOCATION: sp_generate_semester_report
-- -----------------------------------------------------------------------------
CALL sp_generate_semester_report(1, 1);

-- -----------------------------------------------------------------------------
-- 17. STORED FUNCTION INVOCATION: Grade calculation & GPA
-- -----------------------------------------------------------------------------
SELECT 
    fn_calculate_grade(95.5) AS grade_top,
    fn_calculate_grade(74.2) AS grade_mid,
    fn_calculate_grade(42.0) AS grade_fail,
    fn_attendance_percentage(1) AS student1_course1_attendance,
    fn_student_gpa(1, 1) AS student1_fall_gpa;

-- -----------------------------------------------------------------------------
-- 18. TRIGGER VALIDATION TEST: Attempting invalid marks > max_marks
-- (Expected result: SIGNAL 45000 Integrity Error)
-- -----------------------------------------------------------------------------
-- INSERT INTO results (exam_id, enrollment_id, marks_obtained) VALUES (1, 1, 999.00);

-- -----------------------------------------------------------------------------
-- 19. TRANSACTION DEMO: Rollback on constraint failure
-- -----------------------------------------------------------------------------
START TRANSACTION;
UPDATE students SET current_semester = 6 WHERE student_id = 1;
-- Verify in transaction:
SELECT student_id, current_semester FROM students WHERE student_id = 1;
ROLLBACK;
-- Verify rollback restored previous semester:
SELECT student_id, current_semester FROM students WHERE student_id = 1;

-- -----------------------------------------------------------------------------
-- 20. EXPLAIN & EXPLAIN ANALYZE: Query Execution Plan Assessment
-- -----------------------------------------------------------------------------
EXPLAIN SELECT * FROM v_attendance_summary WHERE student_id = 1;
EXPLAIN ANALYZE SELECT * FROM v_student_directory WHERE department_code = 'CSE';
