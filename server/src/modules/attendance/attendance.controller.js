const { query, transaction } = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');

/**
 * Get Sessions for an offering along with attendance status
 */
async function getOfferingSessions(req, res, next) {
  try {
    const { offeringId } = req.query;
    if (!offeringId) {
      return errorResponse(res, 'offeringId query parameter is required', 400);
    }

    const sessions = await query(`
      SELECT 
        cs.session_id,
        cs.offering_id,
        cs.session_date,
        cs.start_time,
        cs.end_time,
        cs.topic,
        cs.room_number,
        COUNT(a.attendance_id) AS attendance_marked_count,
        SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) AS late_count,
        SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS absent_count,
        SUM(CASE WHEN a.status = 'Excused' THEN 1 ELSE 0 END) AS excused_count
      FROM class_sessions cs
      LEFT JOIN attendance a ON cs.session_id = a.session_id
      WHERE cs.offering_id = ?
      GROUP BY cs.session_id, cs.offering_id, cs.session_date, cs.start_time, 
               cs.end_time, cs.topic, cs.room_number
      ORDER BY cs.session_date DESC, cs.start_time DESC;
    `, [parseInt(offeringId, 10)]);

    return successResponse(res, sessions, 'Sessions retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new Class Session
 */
async function createSession(req, res, next) {
  try {
    const { offeringId, sessionDate, startTime, endTime, topic, roomNumber } = req.body;

    if (!offeringId || !sessionDate || !startTime || !endTime) {
      return errorResponse(res, 'offeringId, sessionDate, startTime, and endTime are required', 400);
    }

    const result = await query(`
      INSERT INTO class_sessions (offering_id, session_date, start_time, end_time, topic, room_number)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      parseInt(offeringId, 10),
      sessionDate,
      startTime,
      endTime,
      topic || null,
      roomNumber || null
    ]);

    return successResponse(res, { sessionId: result.insertId }, 'Class session created successfully', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Get Students & Attendance Records for a specific Session
 */
async function getSessionAttendance(req, res, next) {
  try {
    const sessionId = parseInt(req.params.id, 10);

    const [session] = await query(`
      SELECT 
        cs.*,
        c.course_code,
        c.course_name,
        co.section
      FROM class_sessions cs
      JOIN course_offerings co ON cs.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      WHERE cs.session_id = ?
    `, [sessionId]);

    if (!session) {
      return errorResponse(res, 'Session not found', 404);
    }

    // Get all enrolled students in this course offering + their attendance if marked
    const attendanceRecords = await query(`
      SELECT 
        e.enrollment_id,
        e.student_id,
        s.roll_number,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        s.gender,
        a.attendance_id,
        COALESCE(a.status, 'Present') AS current_status,
        a.remarks,
        a.marked_at,
        fn_attendance_percentage(e.enrollment_id) AS current_overall_attendance_pct
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      LEFT JOIN attendance a ON e.enrollment_id = a.enrollment_id AND a.session_id = ?
      WHERE e.offering_id = ? AND e.status = 'Enrolled'
      ORDER BY s.roll_number ASC;
    `, [sessionId, session.offering_id]);

    return successResponse(res, {
      session,
      records: attendanceRecords
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Record / Submit Attendance for a Session (Batch Processing)
 */
async function recordSessionAttendance(req, res, next) {
  try {
    const sessionId = parseInt(req.params.id, 10);
    const { records } = req.body; // Array of { enrollmentId, status, remarks }

    if (!records || !Array.isArray(records) || records.length === 0) {
      return errorResponse(res, 'Attendance records array is required', 400);
    }

    // Process each attendance record using sp_record_attendance procedure
    await transaction(async (conn) => {
      for (const rec of records) {
        await conn.query('SET @p_att_id = 0;');
        await conn.query('CALL sp_record_attendance(?, ?, ?, ?, @p_att_id);', [
          sessionId,
          parseInt(rec.enrollmentId, 10),
          rec.status || 'Present',
          rec.remarks || null
        ]);
      }
    });

    return successResponse(res, null, `Attendance marked successfully for ${records.length} students`);
  } catch (error) {
    next(error);
  }
}

/**
 * Attendance Summary View (Supports Student, Faculty, Admin filtering)
 */
async function getAttendanceSummary(req, res, next) {
  try {
    const { offeringId, studentId, termId, status } = req.query;
    const params = [];
    const whereClauses = [];

    // Students only see their own attendance
    if (req.user.role === 'STUDENT') {
      whereClauses.push('student_id = ?');
      params.push(req.user.studentId);
    } else if (studentId) {
      whereClauses.push('student_id = ?');
      params.push(parseInt(studentId, 10));
    }

    // Faculty filtering by their courses
    if (req.user.role === 'FACULTY' && !offeringId) {
      whereClauses.push('faculty_id = ?');
      params.push(req.user.facultyId);
    } else if (offeringId) {
      whereClauses.push('offering_id = ?');
      params.push(parseInt(offeringId, 10));
    }

    if (termId) {
      whereClauses.push('term_id = ?');
      params.push(parseInt(termId, 10));
    }

    if (status) {
      whereClauses.push('attendance_status = ?');
      params.push(status);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const summary = await query(`
      SELECT * FROM v_attendance_summary
      ${whereSql}
      ORDER BY attendance_percentage ASC, student_name ASC;
    `, params);

    return successResponse(res, summary, 'Attendance summary retrieved successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOfferingSessions,
  createSession,
  getSessionAttendance,
  recordSessionAttendance,
  getAttendanceSummary
};
