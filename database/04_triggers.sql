-- =============================================================================
-- EDUTRACK PRO — ADVANCED STUDENT ACADEMIC MANAGEMENT & ANALYTICS SYSTEM
-- SCRIPT 04: DATABASE TRIGGERS FOR AUDITING & INTEGRITY ENFORCEMENT
-- =============================================================================

USE edutrack;

DROP TRIGGER IF EXISTS trg_student_update_audit;
DROP TRIGGER IF EXISTS trg_result_insert_audit;
DROP TRIGGER IF EXISTS trg_result_update_audit;
DROP TRIGGER IF EXISTS trg_result_validate_insert;
DROP TRIGGER IF EXISTS trg_result_validate_update;

DELIMITER $$

-- -----------------------------------------------------------------------------
-- 1. trg_result_validate_insert: Enforce that marks_obtained <= max_marks
-- and automatically assign grade based on grade_rules
-- -----------------------------------------------------------------------------
CREATE TRIGGER trg_result_validate_insert
BEFORE INSERT ON results
FOR EACH ROW
BEGIN
    DECLARE v_max_marks DECIMAL(5,2);
    DECLARE v_percentage DECIMAL(5,2);
    DECLARE v_calculated_grade VARCHAR(5);

    SELECT max_marks INTO v_max_marks 
    FROM exams 
    WHERE exam_id = NEW.exam_id;

    IF v_max_marks IS NULL THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Integrity Error: Associated exam does not exist';
    END IF;

    IF NEW.marks_obtained > v_max_marks THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Integrity Error: Marks obtained cannot exceed exam maximum marks';
    END IF;

    IF NEW.marks_obtained < 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Integrity Error: Marks obtained cannot be negative';
    END IF;

    -- Compute percentage and look up grade if not provided
    IF v_max_marks > 0 THEN
        SET v_percentage = (NEW.marks_obtained / v_max_marks) * 100.0;
        SELECT grade INTO v_calculated_grade 
        FROM grade_rules 
        WHERE v_percentage >= min_percentage AND v_percentage <= max_percentage 
        LIMIT 1;

        IF v_calculated_grade IS NOT NULL THEN
            SET NEW.grade = v_calculated_grade;
        END IF;
    END IF;
END$$

-- -----------------------------------------------------------------------------
-- 2. trg_result_validate_update: Enforce marks validation on updates
-- -----------------------------------------------------------------------------
CREATE TRIGGER trg_result_validate_update
BEFORE UPDATE ON results
FOR EACH ROW
BEGIN
    DECLARE v_max_marks DECIMAL(5,2);
    DECLARE v_percentage DECIMAL(5,2);
    DECLARE v_calculated_grade VARCHAR(5);

    SELECT max_marks INTO v_max_marks 
    FROM exams 
    WHERE exam_id = NEW.exam_id;

    IF NEW.marks_obtained > v_max_marks THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Integrity Error: Marks obtained cannot exceed exam maximum marks';
    END IF;

    IF NEW.marks_obtained < 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Integrity Error: Marks obtained cannot be negative';
    END IF;

    -- Update grade calculation
    IF v_max_marks > 0 THEN
        SET v_percentage = (NEW.marks_obtained / v_max_marks) * 100.0;
        SELECT grade INTO v_calculated_grade 
        FROM grade_rules 
        WHERE v_percentage >= min_percentage AND v_percentage <= max_percentage 
        LIMIT 1;

        IF v_calculated_grade IS NOT NULL THEN
            SET NEW.grade = v_calculated_grade;
        END IF;
    END IF;
END$$

-- -----------------------------------------------------------------------------
-- 3. trg_student_update_audit: Track changes to student records
-- -----------------------------------------------------------------------------
CREATE TRIGGER trg_student_update_audit
AFTER UPDATE ON students
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action_type,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        action_time
    ) VALUES (
        NEW.user_id,
        'UPDATE',
        'students',
        CAST(NEW.student_id AS CHAR),
        JSON_OBJECT(
            'first_name', OLD.first_name,
            'last_name', OLD.last_name,
            'department_id', OLD.department_id,
            'current_semester', OLD.current_semester,
            'academic_status', OLD.academic_status,
            'phone', OLD.phone
        ),
        JSON_OBJECT(
            'first_name', NEW.first_name,
            'last_name', NEW.last_name,
            'department_id', NEW.department_id,
            'current_semester', NEW.current_semester,
            'academic_status', NEW.academic_status,
            'phone', NEW.phone
        ),
        '127.0.0.1',
        NOW()
    );
END$$

-- -----------------------------------------------------------------------------
-- 4. trg_result_insert_audit: Audit trail when marks are first entered
-- -----------------------------------------------------------------------------
CREATE TRIGGER trg_result_insert_audit
AFTER INSERT ON results
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action_type,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        action_time
    ) VALUES (
        NULL,
        'INSERT',
        'results',
        CAST(NEW.result_id AS CHAR),
        NULL,
        JSON_OBJECT(
            'exam_id', NEW.exam_id,
            'enrollment_id', NEW.enrollment_id,
            'marks_obtained', NEW.marks_obtained,
            'grade', NEW.grade,
            'is_published', NEW.is_published
        ),
        '127.0.0.1',
        NOW()
    );
END$$

-- -----------------------------------------------------------------------------
-- 5. trg_result_update_audit: Audit trail when marks/grade are modified
-- -----------------------------------------------------------------------------
CREATE TRIGGER trg_result_update_audit
AFTER UPDATE ON results
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action_type,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        action_time
    ) VALUES (
        NULL,
        'UPDATE',
        'results',
        CAST(NEW.result_id AS CHAR),
        JSON_OBJECT(
            'marks_obtained', OLD.marks_obtained,
            'grade', OLD.grade,
            'is_published', OLD.is_published,
            'remarks', OLD.remarks
        ),
        JSON_OBJECT(
            'marks_obtained', NEW.marks_obtained,
            'grade', NEW.grade,
            'is_published', NEW.is_published,
            'remarks', NEW.remarks
        ),
        '127.0.0.1',
        NOW()
    );
END$$

DELIMITER ;
