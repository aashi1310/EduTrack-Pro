const { query, transaction } = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');

async function getResults(req, res, next) {
  try {
    const { examId, studentId, offeringId, isPublished } = req.query;
    const params = [];
    const whereClauses = [];

    // Students can only see their own published results
    if (req.user.role === 'STUDENT') {
      whereClauses.push('s.student_id = ? AND r.is_published = TRUE');
      params.push(req.user.studentId);
    } else if (studentId) {
      whereClauses.push('s.student_id = ?');
      params.push(parseInt(studentId, 10));
    }

    if (examId) {
      whereClauses.push('r.exam_id = ?');
      params.push(parseInt(examId, 10));
    }

    if (offeringId) {
      whereClauses.push('ex.offering_id = ?');
      params.push(parseInt(offeringId, 10));
    }

    if (isPublished !== undefined && req.user.role !== 'STUDENT') {
      whereClauses.push('r.is_published = ?');
      params.push(isPublished === 'true' || isPublished === '1');
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const results = await query(`
      SELECT 
        r.result_id,
        r.exam_id,
        ex.exam_name,
        ex.exam_type,
        ex.exam_date,
        ex.max_marks,
        ex.weightage_percentage,
        ex.status AS exam_status,
        c.course_code,
        c.course_name,
        co.section,
        t.term_code,
        e.enrollment_id,
        s.student_id,
        s.roll_number,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        d.department_code,
        r.marks_obtained,
        ROUND((r.marks_obtained / ex.max_marks) * 100, 2) AS percentage,
        r.grade,
        r.remarks,
        r.is_published
      FROM results r
      JOIN exams ex ON r.exam_id = ex.exam_id
      JOIN enrollments e ON r.enrollment_id = e.enrollment_id
      JOIN students s ON e.student_id = s.student_id
      JOIN departments d ON s.department_id = d.department_id
      JOIN course_offerings co ON ex.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      JOIN academic_terms t ON co.term_id = t.term_id
      ${whereSql}
      ORDER BY ex.exam_date DESC, s.roll_number ASC;
    `, params);

    return successResponse(res, results, 'Results retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Get Marksheet for a Specific Exam
 */
async function getExamMarksheet(req, res, next) {
  try {
    const examId = parseInt(req.params.id, 10);

    const [exam] = await query(`
      SELECT 
        ex.*,
        c.course_code,
        c.course_name,
        co.section,
        t.term_code,
        CONCAT(f.first_name, ' ', f.last_name) AS instructor
      FROM exams ex
      JOIN course_offerings co ON ex.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      JOIN academic_terms t ON co.term_id = t.term_id
      JOIN faculty f ON co.faculty_id = f.faculty_id
      WHERE ex.exam_id = ?
    `, [examId]);

    if (!exam) {
      return errorResponse(res, 'Exam not found', 404);
    }

    // Get all enrolled students and their results
    const marksheet = await query(`
      SELECT 
        e.enrollment_id,
        s.student_id,
        s.roll_number,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        d.department_code,
        r.result_id,
        r.marks_obtained,
        ROUND((r.marks_obtained / ? * 100), 2) AS percentage,
        r.grade,
        r.remarks,
        COALESCE(r.is_published, FALSE) AS is_published
      FROM enrollments e
      JOIN students s ON e.student_id = s.student_id
      JOIN departments d ON s.department_id = d.department_id
      LEFT JOIN results r ON e.enrollment_id = r.enrollment_id AND r.exam_id = ?
      WHERE e.offering_id = ? AND e.status = 'Enrolled'
      ORDER BY s.roll_number ASC;
    `, [exam.max_marks, examId, exam.offering_id]);

    return successResponse(res, {
      exam,
      marksheet
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Enter / Save Marks (Batch Insertion / Update)
 * Trigger trg_result_validate_insert & trg_result_validate_update enforce marks <= max_marks
 * and calculate the letter grade from grade_rules automatically.
 */
async function saveMarks(req, res, next) {
  try {
    const { examId, entries } = req.body; // Array of { enrollmentId, marksObtained, remarks }

    if (!examId || !entries || !Array.isArray(entries) || entries.length === 0) {
      return errorResponse(res, 'examId and entries array are required', 400);
    }

    const [exam] = await query('SELECT max_marks, status FROM exams WHERE exam_id = ?', [parseInt(examId, 10)]);
    if (!exam) {
      return errorResponse(res, 'Exam not found', 404);
    }

    await transaction(async (conn) => {
      for (const item of entries) {
        if (item.marksObtained !== null && item.marksObtained !== undefined && item.marksObtained !== '') {
          const marks = parseFloat(item.marksObtained);
          await conn.query(`
            INSERT INTO results (exam_id, enrollment_id, marks_obtained, remarks, is_published)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              marks_obtained = VALUES(marks_obtained),
              remarks = VALUES(remarks),
              updated_at = NOW()
          `, [
            parseInt(examId, 10),
            parseInt(item.enrollmentId, 10),
            marks,
            item.remarks || null,
            exam.status === 'Published'
          ]);
        }
      }
    });

    return successResponse(res, null, `Marks saved successfully for ${entries.length} students`);
  } catch (error) {
    next(error);
  }
}

/**
 * Update Individual Student Result
 */
async function updateSingleResult(req, res, next) {
  try {
    const resultId = parseInt(req.params.id, 10);
    const { marksObtained, remarks } = req.body;

    if (marksObtained === undefined || marksObtained === null) {
      return errorResponse(res, 'marksObtained is required', 400);
    }

    await query(`
      UPDATE results
      SET 
        marks_obtained = ?,
        remarks = COALESCE(?, remarks),
        updated_at = NOW()
      WHERE result_id = ?
    `, [parseFloat(marksObtained), remarks || null, resultId]);

    return successResponse(res, null, 'Result updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Get Student Academic Transcript & Performance
 */
async function getStudentResults(req, res, next) {
  try {
    const studentId = parseInt(req.params.id, 10);
    const { termId } = req.query;

    const publishedResults = await query(`
      SELECT * FROM v_published_results
      WHERE student_id = ?
      ORDER BY exam_date DESC;
    `, [studentId]);

    let semesterReport = [];
    if (termId) {
      const [report] = await query('CALL sp_generate_semester_report(?, ?);', [studentId, parseInt(termId, 10)]);
      semesterReport = report;
    }

    const [gpaResult] = await query(`
      SELECT 
        fn_student_gpa(?, NULL) AS cumulative_gpa,
        fn_student_gpa(?, ?) AS term_gpa;
    `, [studentId, studentId, termId ? parseInt(termId, 10) : null]);

    return successResponse(res, {
      results: publishedResults,
      semesterReport,
      cumulativeGpa: gpaResult ? gpaResult.cumulative_gpa : 0.00,
      termGpa: gpaResult ? gpaResult.term_gpa : 0.00
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getResults,
  getExamMarksheet,
  saveMarks,
  updateSingleResult,
  getStudentResults
};
