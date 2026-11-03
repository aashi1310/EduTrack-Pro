-- =============================================================================
-- EDUTRACK PRO — ADVANCED STUDENT ACADEMIC MANAGEMENT & ANALYTICS SYSTEM
-- SCRIPT 05: DATABASE STORED FUNCTIONS FOR ACADEMIC COMPUTATIONS
-- =============================================================================

USE edutrack;

DROP FUNCTION IF EXISTS fn_calculate_grade;
DROP FUNCTION IF EXISTS fn_attendance_percentage;
DROP FUNCTION IF EXISTS fn_student_gpa;

DELIMITER $$

-- -----------------------------------------------------------------------------
-- 1. fn_calculate_grade: Map numeric percentage to letter grade
-- -----------------------------------------------------------------------------
CREATE FUNCTION fn_calculate_grade(p_percentage DECIMAL(5,2)) 
RETURNS VARCHAR(5)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_grade VARCHAR(5);

    IF p_percentage IS NULL OR p_percentage < 0 THEN
        RETURN 'F';
    END IF;

    SELECT grade INTO v_grade
    FROM grade_rules
    WHERE p_percentage >= min_percentage AND p_percentage <= max_percentage
    ORDER BY min_percentage DESC
    LIMIT 1;

    IF v_grade IS NULL THEN
        IF p_percentage >= 90.0 THEN
            RETURN 'A+';
        ELSE
            RETURN 'F';
        END IF;
    END IF;

    RETURN v_grade;
END$$

-- -----------------------------------------------------------------------------
-- 2. fn_attendance_percentage: Calculate safe attendance percentage
-- Rule: Present & Late count as attended; Excused is removed from denominator.
-- -----------------------------------------------------------------------------
CREATE FUNCTION fn_attendance_percentage(p_enrollment_id INT) 
RETURNS DECIMAL(5,2)
READS SQL DATA
BEGIN
    DECLARE v_attended INT DEFAULT 0;
    DECLARE v_applicable INT DEFAULT 0;
    DECLARE v_percentage DECIMAL(5,2) DEFAULT 100.00;

    SELECT 
        COALESCE(SUM(CASE WHEN status IN ('Present', 'Late') THEN 1 ELSE 0 END), 0),
        COALESCE(COUNT(attendance_id) - SUM(CASE WHEN status = 'Excused' THEN 1 ELSE 0 END), 0)
    INTO v_attended, v_applicable
    FROM attendance
    WHERE enrollment_id = p_enrollment_id;

    IF v_applicable > 0 THEN
        SET v_percentage = ROUND((v_attended * 100.0) / v_applicable, 2);
    ELSE
        SET v_percentage = 100.00;
    END IF;

    RETURN v_percentage;
END$$

-- -----------------------------------------------------------------------------
-- 3. fn_student_gpa: Compute weighted GPA for student across a term or all terms
-- Weighted GPA = SUM(credits * grade_point) / SUM(credits)
-- -----------------------------------------------------------------------------
CREATE FUNCTION fn_student_gpa(p_student_id INT, p_term_id INT) 
RETURNS DECIMAL(3,2)
READS SQL DATA
BEGIN
    DECLARE v_total_points DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_total_credits INT DEFAULT 0;
    DECLARE v_gpa DECIMAL(3,2) DEFAULT 0.00;

    SELECT 
        COALESCE(SUM(c.credits * gr.grade_point), 0.00),
        COALESCE(SUM(c.credits), 0)
    INTO v_total_points, v_total_credits
    FROM enrollments e
    JOIN course_offerings co ON e.offering_id = co.offering_id
    JOIN courses c ON co.course_id = c.course_id
    JOIN exams ex ON co.offering_id = ex.offering_id AND ex.status = 'Published'
    JOIN results r ON ex.exam_id = r.exam_id AND e.enrollment_id = r.enrollment_id AND r.is_published = TRUE
    JOIN grade_rules gr ON r.grade = gr.grade
    WHERE e.student_id = p_student_id
      AND (p_term_id IS NULL OR co.term_id = p_term_id);

    IF v_total_credits > 0 THEN
        SET v_gpa = ROUND(v_total_points / v_total_credits, 2);
    ELSE
        SET v_gpa = 0.00;
    END IF;

    RETURN v_gpa;
END$$

DELIMITER ;
