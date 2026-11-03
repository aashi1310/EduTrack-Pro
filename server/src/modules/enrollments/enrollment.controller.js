const { query } = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditEvent } = require('../../utils/audit');

async function getEnrollments(req, res, next) {
  try {
    const { studentId, offeringId, termId, status } = req.query;
    const params = [];
    const whereClauses = [];

    // Students can only view their own enrollments
    if (req.user.role === 'STUDENT') {
      whereClauses.push('e.student_id = ?');
      params.push(req.user.studentId);
    } else if (studentId) {
      whereClauses.push('e.student_id = ?');
      params.push(parseInt(studentId, 10));
    }

    if (offeringId) {
      whereClauses.push('e.offering_id = ?');
      params.push(parseInt(offeringId, 10));
    }

    if (termId) {
      whereClauses.push('co.term_id = ?');
      params.push(parseInt(termId, 10));
    }

    if (status) {
      whereClauses.push('e.status = ?');
      params.push(status);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT 
        e.enrollment_id,
        e.student_id,
        s.roll_number,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        d.department_code AS student_dept,
        e.offering_id,
        c.course_code,
        c.course_name,
        c.credits,
        co.section,
        t.term_code,
        t.term_name,
        CONCAT(f.first_name, ' ', f.last_name) AS instructor,
        e.enrollment_date,
        e.status,
        e.grade,
        e.final_score,
        vas.attendance_percentage,
        vas.attendance_status
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      JOIN departments d ON s.department_id = d.department_id
      JOIN course_offerings co ON e.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      JOIN academic_terms t ON co.term_id = t.term_id
      JOIN faculty f ON co.faculty_id = f.faculty_id
      LEFT JOIN v_attendance_summary vas ON e.enrollment_id = vas.enrollment_id
      ${whereSql}
      ORDER BY e.enrollment_date DESC, c.course_code;
    `;

    const enrollments = await query(sql, params);
    return successResponse(res, enrollments, 'Enrollments retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Enroll Student using Stored Procedure sp_enroll_student
 * (Demonstrates ACID Transactions & SELECT FOR UPDATE Concurrency Lock)
 */
async function enrollStudent(req, res, next) {
  try {
    const { studentId, offeringId } = req.body;

    const targetStudentId = req.user.role === 'STUDENT' ? req.user.studentId : parseInt(studentId, 10);
    const targetOfferingId = parseInt(offeringId, 10);

    if (!targetStudentId || !targetOfferingId) {
      return errorResponse(res, 'Student ID and Offering ID are required', 400);
    }

    // Call stored procedure sp_enroll_student
    await query('SET @p_status = "", @p_message = "";');
    await query('CALL sp_enroll_student(?, ?, @p_status, @p_message);', [targetStudentId, targetOfferingId]);
    const [statusResult] = await query('SELECT @p_status AS status, @p_message AS message;');

    const { status, message } = statusResult;

    if (status === 'SUCCESS') {
      await logAuditEvent({
        userId: req.user.userId,
        actionType: 'INSERT',
        tableName: 'enrollments',
        recordId: `${targetStudentId}-${targetOfferingId}`,
        newValues: { studentId: targetStudentId, offeringId: targetOfferingId }
      });
      return successResponse(res, { status, message }, message, 201);
    } else if (status === 'DUPLICATE') {
      return errorResponse(res, message, 409);
    } else if (status === 'CAPACITY_REACHED') {
      return errorResponse(res, message, 400);
    } else {
      return errorResponse(res, message, 400);
    }
  } catch (error) {
    next(error);
  }
}

async function updateEnrollmentStatus(req, res, next) {
  try {
    const enrollmentId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!['Enrolled', 'Dropped', 'Completed', 'Failed'].includes(status)) {
      return errorResponse(res, 'Invalid enrollment status. Allowed: Enrolled, Dropped, Completed, Failed', 400);
    }

    await query(`
      UPDATE enrollments 
      SET status = ?, updated_at = NOW()
      WHERE enrollment_id = ?
    `, [status, enrollmentId]);

    return successResponse(res, null, 'Enrollment status updated successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getEnrollments,
  enrollStudent,
  updateEnrollmentStatus
};
