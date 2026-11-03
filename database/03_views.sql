-- =============================================================================
-- EDUTRACK PRO — ADVANCED STUDENT ACADEMIC MANAGEMENT & ANALYTICS SYSTEM
-- SCRIPT 03: DATABASE VIEWS FOR REPORTING & ANALYTICS
-- =============================================================================

USE edutrack;

-- -----------------------------------------------------------------------------
-- 1. v_student_directory: Comprehensive Student Profile & Summary View
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_student_directory AS
SELECT 
    s.student_id,
    s.user_id,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS full_name,
    s.first_name,
    s.last_name,
    u.email,
    s.department_id,
    d.department_code,
    d.department_name,
    s.current_semester,
    s.admission_date,
    s.date_of_birth,
    s.gender,
    s.phone,
    s.academic_status,
    u.is_active AS account_active,
    COUNT(DISTINCT e.enrollment_id) AS total_enrolled_courses,
    ROUND(COALESCE(AVG(e.final_score), 0), 2) AS overall_avg_score
FROM students s
JOIN users u ON s.user_id = u.user_id
JOIN departments d ON s.department_id = d.department_id
LEFT JOIN enrollments e ON s.student_id = e.student_id AND e.status IN ('Enrolled', 'Completed')
GROUP BY s.student_id, s.user_id, s.roll_number, s.first_name, s.last_name, 
         u.email, s.department_id, d.department_code, d.department_name, 
         s.current_semester, s.admission_date, s.date_of_birth, s.gender, 
         s.phone, s.academic_status, u.is_active;

-- -----------------------------------------------------------------------------
-- 2. v_attendance_summary: Aggregated Course & Student Attendance
-- Business Rule:
-- Present counts as attended.
-- Late counts as attended.
-- Absent does not count as attended.
-- Excused is excluded from the denominator.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_attendance_summary AS
SELECT 
    e.enrollment_id,
    e.student_id,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    c.course_id,
    c.course_code,
    c.course_name,
    co.offering_id,
    co.section,
    co.faculty_id,
    CONCAT(f.first_name, ' ', f.last_name) AS faculty_name,
    t.term_id,
    t.term_code,
    COUNT(a.attendance_id) AS total_sessions,
    SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS present_count,
    SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) AS late_count,
    SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
    SUM(CASE WHEN a.status = 'Excused' THEN 1 ELSE 0 END) AS excused_count,
    SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) AS attended_sessions,
    (COUNT(a.attendance_id) - SUM(CASE WHEN a.status = 'Excused' THEN 1 ELSE 0 END)) AS applicable_sessions,
    CASE 
        WHEN (COUNT(a.attendance_id) - SUM(CASE WHEN a.status = 'Excused' THEN 1 ELSE 0 END)) > 0 
        THEN ROUND(
            (SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) * 100.0) / 
            (COUNT(a.attendance_id) - SUM(CASE WHEN a.status = 'Excused' THEN 1 ELSE 0 END)), 2
        )
        ELSE 100.00
    END AS attendance_percentage,
    CASE 
        WHEN (COUNT(a.attendance_id) - SUM(CASE WHEN a.status = 'Excused' THEN 1 ELSE 0 END)) > 0 
             AND (
                 (SUM(CASE WHEN a.status IN ('Present', 'Late') THEN 1 ELSE 0 END) * 100.0) / 
                 (COUNT(a.attendance_id) - SUM(CASE WHEN a.status = 'Excused' THEN 1 ELSE 0 END))
             ) < 75.00
        THEN 'Shortage'
        ELSE 'Normal'
    END AS attendance_status
FROM enrollments e
JOIN students s ON e.student_id = s.student_id
JOIN course_offerings co ON e.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
JOIN academic_terms t ON co.term_id = t.term_id
JOIN faculty f ON co.faculty_id = f.faculty_id
LEFT JOIN attendance a ON e.enrollment_id = a.enrollment_id
GROUP BY e.enrollment_id, e.student_id, s.roll_number, s.first_name, s.last_name, 
         c.course_id, c.course_code, c.course_name, co.offering_id, co.section, 
         co.faculty_id, f.first_name, f.last_name, t.term_id, t.term_code;

-- -----------------------------------------------------------------------------
-- 3. v_course_performance: Offering Academic Performance & Pass/Fail Metrics
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_course_performance AS
SELECT 
    co.offering_id,
    c.course_code,
    c.course_name,
    c.credits,
    co.section,
    t.term_code,
    t.term_name,
    CONCAT(f.first_name, ' ', f.last_name) AS faculty_name,
    COUNT(DISTINCT e.enrollment_id) AS enrolled_students,
    COUNT(DISTINCT ex.exam_id) AS total_exams,
    ROUND(COALESCE(AVG(r.marks_obtained / ex.max_marks * 100), 0), 2) AS average_score_pct,
    COUNT(DISTINCT CASE WHEN (r.marks_obtained / ex.max_marks * 100) >= 50.0 THEN e.enrollment_id END) AS pass_count,
    COUNT(DISTINCT CASE WHEN (r.marks_obtained / ex.max_marks * 100) < 50.0 THEN e.enrollment_id END) AS fail_count,
    CASE 
        WHEN COUNT(DISTINCT e.enrollment_id) > 0 
        THEN ROUND((COUNT(DISTINCT CASE WHEN (r.marks_obtained / ex.max_marks * 100) >= 50.0 THEN e.enrollment_id END) * 100.0) / COUNT(DISTINCT e.enrollment_id), 2)
        ELSE 0.00 
    END AS pass_percentage
FROM course_offerings co
JOIN courses c ON co.course_id = c.course_id
JOIN academic_terms t ON co.term_id = t.term_id
JOIN faculty f ON co.faculty_id = f.faculty_id
LEFT JOIN enrollments e ON co.offering_id = e.offering_id AND e.status = 'Enrolled'
LEFT JOIN exams ex ON co.offering_id = ex.offering_id
LEFT JOIN results r ON ex.exam_id = r.exam_id AND e.enrollment_id = r.enrollment_id
GROUP BY co.offering_id, c.course_code, c.course_name, c.credits, co.section, 
         t.term_code, t.term_name, f.first_name, f.last_name;

-- -----------------------------------------------------------------------------
-- 4. v_academic_overview: Student Academic Summary across terms
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_academic_overview AS
SELECT 
    s.student_id,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    d.department_name,
    s.current_semester,
    s.academic_status,
    COUNT(DISTINCT e.enrollment_id) AS total_courses_enrolled,
    COALESCE(SUM(CASE WHEN e.grade IS NOT NULL AND e.grade != 'F' THEN c.credits ELSE 0 END), 0) AS total_credits_earned,
    ROUND(COALESCE(AVG(r.marks_obtained / ex.max_marks * 100), 0), 2) AS overall_avg_marks,
    ROUND(COALESCE(
        SUM(CASE 
            WHEN r.grade IS NOT NULL THEN (
                SELECT gr.grade_point FROM grade_rules gr WHERE gr.grade = r.grade LIMIT 1
            ) * c.credits
            ELSE 0 
        END) / NULLIF(SUM(CASE WHEN r.grade IS NOT NULL THEN c.credits ELSE 0 END), 0),
        0.00
    ), 2) AS calculated_gpa
FROM students s
JOIN departments d ON s.department_id = d.department_id
LEFT JOIN enrollments e ON s.student_id = e.student_id
LEFT JOIN course_offerings co ON e.offering_id = co.offering_id
LEFT JOIN courses c ON co.course_id = c.course_id
LEFT JOIN exams ex ON co.offering_id = ex.offering_id
LEFT JOIN results r ON ex.exam_id = r.exam_id AND e.enrollment_id = r.enrollment_id AND r.is_published = TRUE
GROUP BY s.student_id, s.roll_number, s.first_name, s.last_name, d.department_name, 
         s.current_semester, s.academic_status;

-- -----------------------------------------------------------------------------
-- 5. v_published_results: Filtered View of Published Student Exam Results
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_published_results AS
SELECT 
    r.result_id,
    r.exam_id,
    ex.exam_name,
    ex.exam_type,
    ex.exam_date,
    ex.max_marks,
    ex.weightage_percentage,
    c.course_id,
    c.course_code,
    c.course_name,
    co.offering_id,
    co.section,
    t.term_code,
    s.student_id,
    s.roll_number,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    r.marks_obtained,
    ROUND((r.marks_obtained / ex.max_marks) * 100.0, 2) AS percentage,
    r.grade,
    r.remarks,
    ex.published_at,
    r.updated_at
FROM results r
JOIN exams ex ON r.exam_id = ex.exam_id
JOIN enrollments e ON r.enrollment_id = e.enrollment_id
JOIN students s ON e.student_id = s.student_id
JOIN course_offerings co ON ex.offering_id = co.offering_id
JOIN courses c ON co.course_id = c.course_id
JOIN academic_terms t ON co.term_id = t.term_id
WHERE ex.status = 'Published' AND r.is_published = TRUE;

-- -----------------------------------------------------------------------------
-- 6. v_department_performance: Institutional Department Analytics View
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_department_performance AS
SELECT 
    d.department_id,
    d.department_code,
    d.department_name,
    COUNT(DISTINCT s.student_id) AS total_students,
    COUNT(DISTINCT f.faculty_id) AS total_faculty,
    COUNT(DISTINCT c.course_id) AS total_courses,
    ROUND(COALESCE(AVG(vas.attendance_percentage), 0), 2) AS avg_student_attendance,
    ROUND(COALESCE(AVG(r.marks_obtained / ex.max_marks * 100), 0), 2) AS avg_student_marks
FROM departments d
LEFT JOIN students s ON d.department_id = s.department_id AND s.academic_status = 'Active'
LEFT JOIN faculty f ON d.department_id = f.department_id AND f.is_active = TRUE
LEFT JOIN courses c ON d.department_id = c.department_id AND c.is_active = TRUE
LEFT JOIN course_offerings co ON c.course_id = co.course_id
LEFT JOIN exams ex ON co.offering_id = ex.offering_id
LEFT JOIN results r ON ex.exam_id = r.exam_id AND r.is_published = TRUE
LEFT JOIN v_attendance_summary vas ON s.student_id = vas.student_id
GROUP BY d.department_id, d.department_code, d.department_name;

-- -----------------------------------------------------------------------------
-- 7. v_faculty_course_summary: Course offerings by faculty with stats
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_faculty_course_summary AS
SELECT 
    f.faculty_id,
    f.employee_code,
    CONCAT(f.first_name, ' ', f.last_name) AS faculty_name,
    f.designation,
    d.department_name,
    co.offering_id,
    c.course_code,
    c.course_name,
    c.credits,
    co.section,
    co.capacity,
    t.term_id,
    t.term_code,
    t.term_name,
    co.status AS offering_status,
    COUNT(DISTINCT e.enrollment_id) AS enrolled_students,
    COUNT(DISTINCT cs.session_id) AS total_sessions_conducted,
    COUNT(DISTINCT ex.exam_id) AS total_exams_created
FROM faculty f
JOIN departments d ON f.department_id = d.department_id
JOIN course_offerings co ON f.faculty_id = co.faculty_id
JOIN courses c ON co.course_id = c.course_id
JOIN academic_terms t ON co.term_id = t.term_id
LEFT JOIN enrollments e ON co.offering_id = e.offering_id AND e.status = 'Enrolled'
LEFT JOIN class_sessions cs ON co.offering_id = cs.offering_id
LEFT JOIN exams ex ON co.offering_id = ex.offering_id
GROUP BY f.faculty_id, f.employee_code, f.first_name, f.last_name, f.designation, 
         d.department_name, co.offering_id, c.course_code, c.course_name, c.credits, 
         co.section, co.capacity, t.term_id, t.term_code, t.term_name, co.status;
