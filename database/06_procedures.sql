-- =============================================================================
-- EDUTRACK PRO — ADVANCED STUDENT ACADEMIC MANAGEMENT & ANALYTICS SYSTEM
-- SCRIPT 06: STORED PROCEDURES WITH TRANSACTIONS & CONCURRENCY CONTROLS
-- =============================================================================

USE edutrack;

DROP PROCEDURE IF EXISTS sp_enroll_student;
DROP PROCEDURE IF EXISTS sp_record_attendance;
DROP PROCEDURE IF EXISTS sp_publish_exam;
DROP PROCEDURE IF EXISTS sp_generate_semester_report;
DROP PROCEDURE IF EXISTS sp_update_student_status;

DELIMITER $$

-- -----------------------------------------------------------------------------
-- 1. sp_enroll_student: Atomic enrollment with row-level locking (SELECT FOR UPDATE)
-- -----------------------------------------------------------------------------
CREATE PROCEDURE sp_enroll_student(
    IN p_student_id INT,
    IN p_offering_id INT,
    OUT p_status VARCHAR(20),
    OUT p_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_capacity INT DEFAULT 0;
    DECLARE v_current_enrolled INT DEFAULT 0;
    DECLARE v_offering_status VARCHAR(20);
    DECLARE v_student_status VARCHAR(20);
    DECLARE v_existing_id INT DEFAULT NULL;
    DECLARE v_user_id INT DEFAULT NULL;
    DECLARE v_course_name VARCHAR(120);

    -- Declare exception handler
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status = 'ERROR';
        SET p_message = 'Database exception occurred during enrollment transaction.';
    END;

    START TRANSACTION;

    -- 1. Validate student exists and is active
    SELECT academic_status, user_id INTO v_student_status, v_user_id
    FROM students
    WHERE student_id = p_student_id;

    IF v_student_status IS NULL THEN
        ROLLBACK;
        SET p_status = 'NOT_FOUND';
        SET p_message = 'Student does not exist.';
        LEAVE proc_label;
    END IF;

    IF v_student_status != 'Active' THEN
        ROLLBACK;
        SET p_status = 'INELIGIBLE';
        SET p_message = CONCAT('Student is not eligible for enrollment. Status: ', v_student_status);
        LEAVE proc_label;
    END IF;

    -- 2. Validate duplicate enrollment
    SELECT enrollment_id INTO v_existing_id
    FROM enrollments
    WHERE student_id = p_student_id AND offering_id = p_offering_id;

    IF v_existing_id IS NOT NULL THEN
        ROLLBACK;
        SET p_status = 'DUPLICATE';
        SET p_message = 'Student is already enrolled in this course offering.';
        LEAVE proc_label;
    END IF;

    -- 3. Row-level lock on course_offerings to prevent concurrent oversubscription
    SELECT co.capacity, co.status, c.course_name 
    INTO v_capacity, v_offering_status, v_course_name
    FROM course_offerings co
    JOIN courses c ON co.course_id = c.course_id
    WHERE co.offering_id = p_offering_id
    FOR UPDATE;

    IF v_offering_status IS NULL THEN
        ROLLBACK;
        SET p_status = 'NOT_FOUND';
        SET p_message = 'Course offering does not exist.';
        LEAVE proc_label;
    END IF;

    IF v_offering_status != 'Open' THEN
        ROLLBACK;
        SET p_status = 'CLOSED';
        SET p_message = CONCAT('Course offering is not open. Status: ', v_offering_status);
        LEAVE proc_label;
    END IF;

    -- 4. Check capacity
    SELECT COUNT(*) INTO v_current_enrolled
    FROM enrollments
    WHERE offering_id = p_offering_id AND status = 'Enrolled';

    IF v_current_enrolled >= v_capacity THEN
        ROLLBACK;
        SET p_status = 'CAPACITY_REACHED';
        SET p_message = CONCAT('Enrollment capacity reached (', v_current_enrolled, '/', v_capacity, ').');
        LEAVE proc_label;
    END IF;

    -- 5. Insert enrollment
    INSERT INTO enrollments (student_id, offering_id, enrollment_date, status)
    VALUES (p_student_id, p_offering_id, CURDATE(), 'Enrolled');

    -- 6. Generate in-app notification for the student
    IF v_user_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
            v_user_id,
            'Enrollment Confirmed',
            CONCAT('You have been successfully enrolled in ', v_course_name, '.'),
            'enrollment'
        );
    END IF;

    COMMIT;
    SET p_status = 'SUCCESS';
    SET p_message = 'Enrollment successfully processed.';
END$$

-- -----------------------------------------------------------------------------
-- 2. sp_record_attendance: Record / Update attendance and check shortage
-- -----------------------------------------------------------------------------
CREATE PROCEDURE sp_record_attendance(
    IN p_session_id INT,
    IN p_enrollment_id INT,
    IN p_status VARCHAR(20),
    IN p_remarks VARCHAR(255),
    OUT p_attendance_id INT
)
BEGIN
    DECLARE v_pct DECIMAL(5,2);
    DECLARE v_user_id INT;
    DECLARE v_course_name VARCHAR(120);

    -- Insert or Update attendance
    INSERT INTO attendance (session_id, enrollment_id, status, remarks, marked_at)
    VALUES (p_session_id, p_enrollment_id, p_status, p_remarks, NOW())
    ON DUPLICATE KEY UPDATE 
        status = p_status, 
        remarks = p_remarks, 
        updated_at = NOW();

    SET p_attendance_id = LAST_INSERT_ID();

    -- Calculate updated attendance percentage
    SET v_pct = fn_attendance_percentage(p_enrollment_id);

    -- If attendance drops below 75%, trigger alert notification to student
    IF v_pct < 75.00 THEN
        SELECT s.user_id, c.course_name 
        INTO v_user_id, v_course_name
        FROM enrollments e
        JOIN students s ON e.student_id = s.student_id
        JOIN course_offerings co ON e.offering_id = co.offering_id
        JOIN courses c ON co.course_id = c.course_id
        WHERE e.enrollment_id = p_enrollment_id;

        IF v_user_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (
                v_user_id,
                'Attendance Shortage Alert',
                CONCAT('Warning: Your attendance in ', v_course_name, ' is now ', v_pct, '%, which is below the 75% required threshold.'),
                'attendance_shortage'
            );
        END IF;
    END IF;
END$$

-- -----------------------------------------------------------------------------
-- 3. sp_publish_exam: Transactional publication of exam results with alerts
-- -----------------------------------------------------------------------------
CREATE PROCEDURE sp_publish_exam(
    IN p_exam_id INT,
    IN p_faculty_user_id INT,
    OUT p_published_count INT
)
BEGIN
    DECLARE v_exam_name VARCHAR(100);
    DECLARE v_course_name VARCHAR(120);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_published_count = -1;
    END;

    START TRANSACTION;

    SELECT ex.exam_name, c.course_name 
    INTO v_exam_name, v_course_name
    FROM exams ex
    JOIN course_offerings co ON ex.offering_id = co.offering_id
    JOIN courses c ON co.course_id = c.course_id
    WHERE ex.exam_id = p_exam_id;

    -- Update Exam Status
    UPDATE exams 
    SET status = 'Published', 
        published_at = NOW() 
    WHERE exam_id = p_exam_id;

    -- Update Results Publication Flag
    UPDATE results 
    SET is_published = TRUE,
        updated_at = NOW()
    WHERE exam_id = p_exam_id;

    SELECT ROW_COUNT() INTO p_published_count;

    -- Notify all enrolled students who took this exam
    INSERT INTO notifications (user_id, title, message, type)
    SELECT 
        s.user_id,
        'Examination Results Published',
        CONCAT('Results for ', v_exam_name, ' (', v_course_name, ') have been officially published.'),
        'result_published'
    FROM results r
    JOIN enrollments e ON r.enrollment_id = e.enrollment_id
    JOIN students s ON e.student_id = s.student_id
    WHERE r.exam_id = p_exam_id;

    -- Record Audit Log
    INSERT INTO audit_logs (user_id, action_type, table_name, record_id, new_values, ip_address, action_time)
    VALUES (
        p_faculty_user_id,
        'PUBLISH',
        'exams',
        CAST(p_exam_id AS CHAR),
        JSON_OBJECT('status', 'Published', 'published_count', p_published_count),
        '127.0.0.1',
        NOW()
    );

    COMMIT;
END$$

-- -----------------------------------------------------------------------------
-- 4. sp_generate_semester_report: Detailed Semester Performance Report
-- -----------------------------------------------------------------------------
CREATE PROCEDURE sp_generate_semester_report(
    IN p_student_id INT,
    IN p_term_id INT
)
BEGIN
    -- Query Semester Course Results & Grades
    SELECT 
        s.roll_number,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        d.department_name,
        t.term_name,
        t.academic_year,
        c.course_code,
        c.course_name,
        c.credits,
        co.section,
        ROUND(COALESCE(AVG(r.marks_obtained / ex.max_marks * 100), 0), 2) AS course_score_pct,
        fn_calculate_grade(ROUND(COALESCE(AVG(r.marks_obtained / ex.max_marks * 100), 0), 2)) AS course_grade,
        fn_attendance_percentage(e.enrollment_id) AS attendance_pct
    FROM enrollments e
    JOIN students s ON e.student_id = s.student_id
    JOIN departments d ON s.department_id = d.department_id
    JOIN course_offerings co ON e.offering_id = co.offering_id
    JOIN courses c ON co.course_id = c.course_id
    JOIN academic_terms t ON co.term_id = t.term_id
    LEFT JOIN exams ex ON co.offering_id = ex.offering_id AND ex.status = 'Published'
    LEFT JOIN results r ON ex.exam_id = r.exam_id AND e.enrollment_id = r.enrollment_id AND r.is_published = TRUE
    WHERE s.student_id = p_student_id AND co.term_id = p_term_id
    GROUP BY s.roll_number, s.first_name, s.last_name, d.department_name, 
             t.term_name, t.academic_year, c.course_code, c.course_name, 
             c.credits, co.section, e.enrollment_id;
END$$

-- -----------------------------------------------------------------------------
-- 5. sp_update_student_status: Change academic status with audit & notification
-- -----------------------------------------------------------------------------
CREATE PROCEDURE sp_update_student_status(
    IN p_student_id INT,
    IN p_new_status VARCHAR(20),
    IN p_admin_user_id INT
)
BEGIN
    DECLARE v_old_status VARCHAR(20);
    DECLARE v_user_id INT;

    SELECT academic_status, user_id INTO v_old_status, v_user_id
    FROM students
    WHERE student_id = p_student_id;

    UPDATE students 
    SET academic_status = p_new_status,
        updated_at = NOW()
    WHERE student_id = p_student_id;

    -- Notify Student
    IF v_user_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
            v_user_id,
            'Academic Status Updated',
            CONCAT('Your academic status has been updated to: ', p_new_status),
            'general'
        );
    END IF;

    -- Audit log is automatically created by trg_student_update_audit trigger!
END$$

DELIMITER ;
