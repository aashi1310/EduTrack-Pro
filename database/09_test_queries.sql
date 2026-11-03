-- =============================================================================
-- EDUTRACK PRO — ADVANCED STUDENT ACADEMIC MANAGEMENT & ANALYTICS SYSTEM
-- SCRIPT 09: SYSTEM INTEGRITY, CONSTRAINT & UNIT VERIFICATION QUERIES
-- =============================================================================

USE edutrack;

-- -----------------------------------------------------------------------------
-- TEST 1: Verify Table Count (Must be exactly 16 core tables)
-- -----------------------------------------------------------------------------
SELECT 
    table_name,
    table_rows,
    engine,
    table_collation
FROM information_schema.tables
WHERE table_schema = 'edutrack'
ORDER BY table_name;

-- -----------------------------------------------------------------------------
-- TEST 2: Foreign Key Constraint Verification
-- -----------------------------------------------------------------------------
SELECT 
    constraint_name,
    table_name,
    column_name,
    referenced_table_name,
    referenced_column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'edutrack' AND referenced_table_name IS NOT NULL
ORDER BY table_name;

-- -----------------------------------------------------------------------------
-- TEST 3: Stored Logic Verification (Functions, Procedures, Triggers)
-- -----------------------------------------------------------------------------
SELECT routine_type, routine_name, security_type
FROM information_schema.routines
WHERE routine_schema = 'edutrack'
ORDER BY routine_type, routine_name;

SELECT trigger_name, event_manipulation, event_object_table, action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'edutrack'
ORDER BY event_object_table;

-- -----------------------------------------------------------------------------
-- TEST 4: View Data Sanity Check
-- -----------------------------------------------------------------------------
SELECT 'v_student_directory' AS view_name, COUNT(*) AS row_count FROM v_student_directory
UNION ALL
SELECT 'v_attendance_summary', COUNT(*) FROM v_attendance_summary
UNION ALL
SELECT 'v_course_performance', COUNT(*) FROM v_course_performance
UNION ALL
SELECT 'v_academic_overview', COUNT(*) FROM v_academic_overview
UNION ALL
SELECT 'v_published_results', COUNT(*) FROM v_published_results
UNION ALL
SELECT 'v_department_performance', COUNT(*) FROM v_department_performance
UNION ALL
SELECT 'v_faculty_course_summary', COUNT(*) FROM v_faculty_course_summary;

-- -----------------------------------------------------------------------------
-- TEST 5: Verify Attendance Calculation Business Rule
-- Rule: Present & Late count as attended; Excused is removed from denominator.
-- -----------------------------------------------------------------------------
SELECT 
    roll_number,
    student_name,
    course_code,
    total_sessions,
    attended_sessions,
    applicable_sessions,
    attendance_percentage,
    attendance_status
FROM v_attendance_summary
WHERE student_id = 6; -- Daniel Kim (Has Excused and Absents)

-- -----------------------------------------------------------------------------
-- TEST 6: Test Stored Procedure sp_enroll_student
-- -----------------------------------------------------------------------------
SET @status = '';
SET @msg = '';
-- Attempt to enroll student 1 into offering 3 (AI301)
CALL sp_enroll_student(1, 3, @status, @msg);
SELECT @status AS enrollment_status, @msg AS enrollment_message;

-- Attempt duplicate enrollment (Must return DUPLICATE)
CALL sp_enroll_student(1, 3, @status, @msg);
SELECT @status AS duplicate_status, @msg AS duplicate_message;
