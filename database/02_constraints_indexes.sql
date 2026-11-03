-- =============================================================================
-- EDUTRACK PRO — ADVANCED STUDENT ACADEMIC MANAGEMENT & ANALYTICS SYSTEM
-- SCRIPT 02: PERFORMANCE INDEXES & INTEGRITY CONSTRAINTS
-- =============================================================================

USE edutrack;

-- -----------------------------------------------------------------------------
-- PERFORMANCE INDEXES (Based on Workload & Query Pattern Analysis)
-- -----------------------------------------------------------------------------

-- 1. Student Queries: Department filtering & Academic Status queries
CREATE INDEX idx_students_dept ON students (department_id);
CREATE INDEX idx_students_status ON students (academic_status);
CREATE INDEX idx_students_semester ON students (current_semester);

-- 2. Faculty Queries: Department filtering & active status
CREATE INDEX idx_faculty_dept ON faculty (department_id);
CREATE INDEX idx_faculty_active ON faculty (is_active);

-- 3. Course Offerings: Term, Faculty, Status
CREATE INDEX idx_offerings_term ON course_offerings (term_id);
CREATE INDEX idx_offerings_faculty ON course_offerings (faculty_id);
CREATE INDEX idx_offerings_status ON course_offerings (status);

-- 4. Enrollments: Fast lookup by Student, Offering & Status
CREATE INDEX idx_enrollments_student ON enrollments (student_id);
CREATE INDEX idx_enrollments_offering ON enrollments (offering_id);
CREATE INDEX idx_enrollments_student_status ON enrollments (student_id, status);

-- 5. Class Sessions: Offering & Date
CREATE INDEX idx_sessions_offering_date ON class_sessions (offering_id, session_date);

-- 6. Attendance: Session lookup & Status aggregation
CREATE INDEX idx_attendance_session ON attendance (session_id);
CREATE INDEX idx_attendance_enrollment ON attendance (enrollment_id);
CREATE INDEX idx_attendance_status ON attendance (status);
CREATE INDEX idx_attendance_enrollment_status ON attendance (enrollment_id, status);

-- 7. Exams & Results: Fast aggregation for Grade & Marks
CREATE INDEX idx_exams_offering ON exams (offering_id);
CREATE INDEX idx_exams_status ON exams (status);
CREATE INDEX idx_results_exam ON results (exam_id);
CREATE INDEX idx_results_enrollment ON results (enrollment_id);
CREATE INDEX idx_results_published ON results (is_published);

-- 8. Notifications: User Inbox & Unread filtering
CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications (created_at DESC);

-- 9. Audit Logs: Time-series queries & Entity filtering
CREATE INDEX idx_audit_time ON audit_logs (action_time DESC);
CREATE INDEX idx_audit_table_record ON audit_logs (table_name, record_id);
CREATE INDEX idx_audit_user ON audit_logs (user_id);
