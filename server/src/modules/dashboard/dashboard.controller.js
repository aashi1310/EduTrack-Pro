const { query } = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * Admin Institutional Dashboard API
 */
async function getAdminDashboard(req, res, next) {
  try {
    const { departmentId, termId } = req.query;

    // 1. Core Statistics
    const [stats] = await query(`
      SELECT 
        (SELECT COUNT(*) FROM students WHERE academic_status = 'Active') AS total_students,
        (SELECT COUNT(*) FROM faculty WHERE is_active = TRUE) AS total_faculty,
        (SELECT COUNT(*) FROM courses WHERE is_active = TRUE) AS total_courses,
        (SELECT COUNT(*) FROM departments) AS total_departments,
        (SELECT COUNT(*) FROM course_offerings WHERE status = 'Open') AS active_offerings,
        COALESCE(
          (SELECT ROUND(AVG(attendance_percentage), 1) FROM v_attendance_summary), 
          85.4
        ) AS average_attendance
    `);

    // 2. Department-wise Student Distribution
    const departmentDistribution = await query(`
      SELECT 
        d.department_code,
        d.department_name,
        COUNT(s.student_id) AS student_count
      FROM departments d
      LEFT JOIN students s ON d.department_id = s.department_id AND s.academic_status = 'Active'
      GROUP BY d.department_id, d.department_code, d.department_name
      ORDER BY student_count DESC;
    `);

    // 3. Grade Distribution across all published results
    const gradeDistribution = await query(`
      SELECT 
        gr.grade,
        gr.description,
        COUNT(r.result_id) AS count
      FROM grade_rules gr
      LEFT JOIN results r ON gr.grade = r.grade AND r.is_published = TRUE
      GROUP BY gr.rule_id, gr.grade, gr.description
      ORDER BY gr.min_percentage DESC;
    `);

    // 4. Term Enrollment Trends
    const enrollmentTrends = await query(`
      SELECT 
        t.term_code,
        t.term_name,
        COUNT(DISTINCT e.student_id) AS enrolled_students,
        COUNT(e.enrollment_id) AS total_course_enrollments
      FROM academic_terms t
      LEFT JOIN course_offerings co ON t.term_id = co.term_id
      LEFT JOIN enrollments e ON co.offering_id = e.offering_id
      GROUP BY t.term_id, t.term_code, t.term_name, t.start_date
      ORDER BY t.start_date ASC;
    `);

    // 5. Attendance Distribution Summary
    const attendanceTrends = await query(`
      SELECT 
        CASE 
          WHEN vas.attendance_percentage >= 90 THEN '90% - 100%'
          WHEN vas.attendance_percentage >= 75 THEN '75% - 89%'
          WHEN vas.attendance_percentage >= 60 THEN '60% - 74%'
          ELSE 'Below 60%'
        END AS attendance_bracket,
        COUNT(*) AS student_count
      FROM v_attendance_summary vas
      GROUP BY attendance_bracket
      ORDER BY MIN(vas.attendance_percentage) DESC;
    `);

    // 6. Recent Activities from Audit Logs & Registrations
    const recentActivities = await query(`
      SELECT 
        a.audit_id,
        a.action_type,
        a.table_name,
        a.record_id,
        a.action_time,
        u.email AS user_email,
        r.role_name AS user_role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.user_id
      LEFT JOIN roles r ON u.role_id = r.role_id
      ORDER BY a.action_time DESC
      LIMIT 8;
    `);

    // 7. Recent Student Registrations
    const recentStudents = await query(`
      SELECT 
        s.student_id,
        s.roll_number,
        CONCAT(s.first_name, ' ', s.last_name) AS full_name,
        d.department_code,
        s.current_semester,
        s.admission_date,
        s.academic_status
      FROM students s
      JOIN departments d ON s.department_id = d.department_id
      ORDER BY s.student_id DESC
      LIMIT 5;
    `);

    return successResponse(res, {
      statistics: stats,
      departmentDistribution,
      gradeDistribution,
      enrollmentTrends,
      attendanceTrends,
      recentActivities,
      recentStudents
    }, 'Admin dashboard loaded successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Faculty Dashboard API
 */
async function getFacultyDashboard(req, res, next) {
  try {
    const facultyId = req.user.facultyId;
    if (!facultyId) {
      return errorResponse(res, 'No associated faculty profile found for user', 400);
    }

    // 1. Faculty Details & Assigned Offerings
    const offerings = await query(`
      SELECT 
        co.offering_id,
        c.course_code,
        c.course_name,
        c.credits,
        co.section,
        co.capacity,
        t.term_code,
        t.term_name,
        COUNT(DISTINCT e.enrollment_id) AS enrolled_students,
        COUNT(DISTINCT cs.session_id) AS sessions_conducted,
        ROUND(COALESCE(AVG(vas.attendance_percentage), 100), 1) AS avg_course_attendance
      FROM course_offerings co
      JOIN courses c ON co.course_id = c.course_id
      JOIN academic_terms t ON co.term_id = t.term_id
      LEFT JOIN enrollments e ON co.offering_id = e.offering_id AND e.status = 'Enrolled'
      LEFT JOIN class_sessions cs ON co.offering_id = cs.offering_id
      LEFT JOIN v_attendance_summary vas ON e.enrollment_id = vas.enrollment_id
      WHERE co.faculty_id = ?
      GROUP BY co.offering_id, c.course_code, c.course_name, c.credits, co.section, 
               co.capacity, t.term_code, t.term_name;
    `, [facultyId]);

    // 2. Aggregate metrics for this faculty
    const [facultyStats] = await query(`
      SELECT 
        COUNT(DISTINCT co.offering_id) AS assigned_courses,
        COUNT(DISTINCT e.student_id) AS total_students_taught,
        COUNT(DISTINCT cs.session_id) AS total_sessions_held,
        COUNT(DISTINCT CASE WHEN ex.status = 'Draft' THEN ex.exam_id END) AS pending_evaluations,
        ROUND(COALESCE(AVG(vas.attendance_percentage), 90), 1) AS overall_avg_attendance
      FROM course_offerings co
      LEFT JOIN enrollments e ON co.offering_id = e.offering_id
      LEFT JOIN class_sessions cs ON co.offering_id = cs.offering_id
      LEFT JOIN exams ex ON co.offering_id = ex.offering_id
      LEFT JOIN v_attendance_summary vas ON e.enrollment_id = vas.enrollment_id
      WHERE co.faculty_id = ?;
    `, [facultyId]);

    // 3. Upcoming & Recent Exams
    const exams = await query(`
      SELECT 
        ex.exam_id,
        ex.exam_name,
        ex.exam_type,
        ex.exam_date,
        ex.max_marks,
        ex.status,
        c.course_code,
        c.course_name,
        co.section,
        COUNT(r.result_id) AS marks_entered_count
      FROM exams ex
      JOIN course_offerings co ON ex.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      LEFT JOIN results r ON ex.exam_id = r.exam_id
      WHERE co.faculty_id = ?
      GROUP BY ex.exam_id, ex.exam_name, ex.exam_type, ex.exam_date, ex.max_marks, 
               ex.status, c.course_code, c.course_name, co.section
      ORDER BY ex.exam_date DESC;
    `, [facultyId]);

    // 4. Students Requiring Attention (Shortage below 75%)
    const atRiskStudents = await query(`
      SELECT 
        vas.student_id,
        vas.roll_number,
        vas.student_name,
        vas.course_code,
        vas.section,
        vas.total_sessions,
        vas.attended_sessions,
        vas.attendance_percentage
      FROM v_attendance_summary vas
      WHERE vas.faculty_id = ? AND vas.attendance_status = 'Shortage'
      ORDER BY vas.attendance_percentage ASC
      LIMIT 10;
    `, [facultyId]);

    return successResponse(res, {
      statistics: facultyStats,
      offerings,
      exams,
      atRiskStudents
    }, 'Faculty dashboard loaded successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Student Dashboard API
 */
async function getStudentDashboard(req, res, next) {
  try {
    const studentId = req.user.studentId;
    if (!studentId) {
      return errorResponse(res, 'No associated student profile found for user', 400);
    }

    // 1. Student Personal & Academic Details
    const [studentProfile] = await query(`
      SELECT 
        s.student_id,
        s.roll_number,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        d.department_code,
        d.department_name,
        s.current_semester,
        s.academic_status,
        fn_student_gpa(s.student_id, NULL) AS cumulative_gpa
      FROM students s
      JOIN departments d ON s.department_id = d.department_id
      WHERE s.student_id = ?;
    `, [studentId]);

    // 2. Enrolled Courses in Active Term
    const enrolledCourses = await query(`
      SELECT 
        e.enrollment_id,
        c.course_code,
        c.course_name,
        c.credits,
        co.section,
        CONCAT(f.first_name, ' ', f.last_name) AS faculty_name,
        vas.total_sessions,
        vas.attended_sessions,
        vas.attendance_percentage,
        vas.attendance_status
      FROM enrollments e
      JOIN course_offerings co ON e.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      JOIN faculty f ON co.faculty_id = f.faculty_id
      LEFT JOIN v_attendance_summary vas ON e.enrollment_id = vas.enrollment_id
      WHERE e.student_id = ? AND e.status = 'Enrolled'
      ORDER BY c.course_code;
    `, [studentId]);

    // 3. Published Examination Results
    const results = await query(`
      SELECT 
        r.result_id,
        ex.exam_name,
        ex.exam_type,
        ex.exam_date,
        c.course_code,
        c.course_name,
        r.marks_obtained,
        ex.max_marks,
        ROUND((r.marks_obtained / ex.max_marks) * 100, 2) AS percentage,
        r.grade,
        r.remarks
      FROM results r
      JOIN exams ex ON r.exam_id = ex.exam_id
      JOIN enrollments e ON r.enrollment_id = e.enrollment_id
      JOIN course_offerings co ON ex.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      WHERE e.student_id = ? AND r.is_published = TRUE
      ORDER BY ex.exam_date DESC;
    `, [studentId]);

    // 4. Overall Attendance & Metrics
    const [overallMetrics] = await query(`
      SELECT 
        ROUND(COALESCE(AVG(vas.attendance_percentage), 100), 1) AS overall_attendance,
        COUNT(e.enrollment_id) AS enrolled_courses_count,
        COALESCE(SUM(c.credits), 0) AS total_term_credits
      FROM enrollments e
      JOIN course_offerings co ON e.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      LEFT JOIN v_attendance_summary vas ON e.enrollment_id = vas.enrollment_id
      WHERE e.student_id = ? AND e.status = 'Enrolled';
    `, [studentId]);

    // 5. Recent In-App Notifications
    const notifications = await query(`
      SELECT 
        notification_id,
        title,
        message,
        type,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5;
    `, [req.user.userId]);

    return successResponse(res, {
      profile: studentProfile,
      overallMetrics,
      enrolledCourses,
      results,
      notifications
    }, 'Student dashboard loaded successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminDashboard,
  getFacultyDashboard,
  getStudentDashboard
};
