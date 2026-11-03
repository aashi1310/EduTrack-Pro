const { query } = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');

async function getAnalyticsOverview(req, res, next) {
  try {
    const [overview] = await query(`
      SELECT 
        (SELECT COUNT(*) FROM students WHERE academic_status = 'Active') AS total_active_students,
        (SELECT COUNT(*) FROM faculty WHERE is_active = TRUE) AS total_active_faculty,
        (SELECT COUNT(*) FROM courses WHERE is_active = TRUE) AS total_courses,
        (SELECT COUNT(*) FROM course_offerings WHERE status = 'Open') AS active_offerings,
        (SELECT COUNT(*) FROM exams WHERE status = 'Published') AS published_exams,
        (SELECT ROUND(AVG(attendance_percentage), 1) FROM v_attendance_summary) AS avg_institutional_attendance,
        (
          SELECT ROUND(AVG(r.marks_obtained / ex.max_marks * 100), 1)
          FROM results r
          JOIN exams ex ON r.exam_id = ex.exam_id
          WHERE r.is_published = TRUE
        ) AS avg_institutional_score,
        (
          SELECT ROUND(
            (COUNT(CASE WHEN (r.marks_obtained / ex.max_marks * 100) >= 50.0 THEN 1 END) * 100.0) / 
            NULLIF(COUNT(r.result_id), 0), 1
          )
          FROM results r
          JOIN exams ex ON r.exam_id = ex.exam_id
          WHERE r.is_published = TRUE
        ) AS overall_pass_rate
    `);

    // Top 5 courses by average score
    const topCourses = await query(`
      SELECT 
        c.course_code,
        c.course_name,
        d.department_code,
        ROUND(AVG(r.marks_obtained / ex.max_marks * 100), 1) AS avg_score,
        COUNT(DISTINCT e.enrollment_id) AS enrolled_count
      FROM courses c
      JOIN departments d ON c.department_id = d.department_id
      JOIN course_offerings co ON c.course_id = co.course_id
      JOIN exams ex ON co.offering_id = ex.offering_id
      JOIN results r ON ex.exam_id = r.exam_id AND r.is_published = TRUE
      JOIN enrollments e ON co.offering_id = e.offering_id
      GROUP BY c.course_id, c.course_code, c.course_name, d.department_code
      ORDER BY avg_score DESC
      LIMIT 5;
    `);

    return successResponse(res, {
      overview,
      topCourses
    });
  } catch (error) {
    next(error);
  }
}

async function getDepartmentAnalytics(req, res, next) {
  try {
    const departments = await query('SELECT * FROM v_department_performance ORDER BY total_students DESC;');
    return successResponse(res, departments);
  } catch (error) {
    next(error);
  }
}

async function getAttendanceAnalytics(req, res, next) {
  try {
    // 1. Attendance distribution brackets
    const brackets = await query(`
      SELECT 
        CASE 
          WHEN attendance_percentage >= 90 THEN '90% - 100%'
          WHEN attendance_percentage >= 75 THEN '75% - 89%'
          WHEN attendance_percentage >= 60 THEN '60% - 74%'
          ELSE 'Below 60%'
        END AS bracket,
        COUNT(*) AS count
      FROM v_attendance_summary
      GROUP BY bracket
      ORDER BY MIN(attendance_percentage) DESC;
    `);

    // 2. Students with Attendance Shortage (< 75%)
    const shortageStudents = await query(`
      SELECT 
        vas.student_id,
        vas.roll_number,
        vas.student_name,
        vas.course_code,
        vas.course_name,
        vas.section,
        vas.faculty_name,
        vas.total_sessions,
        vas.attended_sessions,
        vas.attendance_percentage
      FROM v_attendance_summary vas
      WHERE vas.attendance_status = 'Shortage'
      ORDER BY vas.attendance_percentage ASC;
    `);

    // 3. Course-wise average attendance
    const courseAttendance = await query(`
      SELECT 
        course_code,
        course_name,
        ROUND(AVG(attendance_percentage), 1) AS avg_attendance,
        COUNT(DISTINCT student_id) AS student_count
      FROM v_attendance_summary
      GROUP BY course_code, course_name
      ORDER BY avg_attendance DESC;
    `);

    return successResponse(res, {
      brackets,
      shortageStudents,
      courseAttendance
    });
  } catch (error) {
    next(error);
  }
}

async function getPerformanceAnalytics(req, res, next) {
  try {
    // Grade distribution from grade_rules & results
    const gradeCounts = await query(`
      SELECT 
        gr.grade,
        gr.description,
        gr.grade_point,
        COUNT(r.result_id) AS count
      FROM grade_rules gr
      LEFT JOIN results r ON gr.grade = r.grade AND r.is_published = TRUE
      GROUP BY gr.rule_id, gr.grade, gr.description, gr.grade_point
      ORDER BY gr.grade_point DESC;
    `);

    // Course offerings performance
    const coursePerformance = await query('SELECT * FROM v_course_performance;');

    return successResponse(res, {
      gradeCounts,
      coursePerformance
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Top Performing Students using Window Functions (DENSE_RANK & GPA)
 */
async function getStudentRankings(req, res, next) {
  try {
    const rankings = await query(`
      WITH StudentAggregates AS (
        SELECT 
          s.student_id,
          s.roll_number,
          CONCAT(s.first_name, ' ', s.last_name) AS full_name,
          d.department_code,
          d.department_name,
          s.current_semester,
          COUNT(DISTINCT e.enrollment_id) AS enrolled_courses,
          ROUND(COALESCE(AVG(r.marks_obtained / ex.max_marks * 100), 0), 2) AS overall_avg_marks,
          fn_student_gpa(s.student_id, NULL) AS calculated_gpa
        FROM students s
        JOIN departments d ON s.department_id = d.department_id
        LEFT JOIN enrollments e ON s.student_id = e.student_id
        LEFT JOIN course_offerings co ON e.offering_id = co.offering_id
        LEFT JOIN exams ex ON co.offering_id = ex.offering_id
        LEFT JOIN results r ON ex.exam_id = r.exam_id AND e.enrollment_id = r.enrollment_id AND r.is_published = TRUE
        WHERE s.academic_status = 'Active'
        GROUP BY s.student_id, s.roll_number, s.first_name, s.last_name, 
                 d.department_code, d.department_name, s.current_semester
      )
      SELECT 
        student_id,
        roll_number,
        full_name,
        department_code,
        department_name,
        current_semester,
        enrolled_courses,
        overall_avg_marks,
        calculated_gpa,
        DENSE_RANK() OVER (ORDER BY calculated_gpa DESC, overall_avg_marks DESC) AS institutional_rank,
        DENSE_RANK() OVER (PARTITION BY department_code ORDER BY calculated_gpa DESC, overall_avg_marks DESC) AS department_rank
      FROM StudentAggregates
      ORDER BY institutional_rank ASC
      LIMIT 20;
    `);

    return successResponse(res, rankings, 'Student academic rankings computed successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAnalyticsOverview,
  getDepartmentAnalytics,
  getAttendanceAnalytics,
  getPerformanceAnalytics,
  getStudentRankings
};
