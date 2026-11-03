const { query } = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditEvent } = require('../../utils/audit');

async function getExams(req, res, next) {
  try {
    const { offeringId, status, examType, facultyId } = req.query;
    const params = [];
    const whereClauses = [];

    if (offeringId) {
      whereClauses.push('ex.offering_id = ?');
      params.push(parseInt(offeringId, 10));
    }

    if (status) {
      whereClauses.push('ex.status = ?');
      params.push(status);
    }

    if (examType) {
      whereClauses.push('ex.exam_type = ?');
      params.push(examType);
    }

    if (req.user.role === 'FACULTY') {
      whereClauses.push('co.faculty_id = ?');
      params.push(req.user.facultyId);
    } else if (facultyId) {
      whereClauses.push('co.faculty_id = ?');
      params.push(parseInt(facultyId, 10));
    }

    // Students can only see Published exams
    if (req.user.role === 'STUDENT') {
      whereClauses.push("ex.status = 'Published'");
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const exams = await query(`
      SELECT 
        ex.exam_id,
        ex.offering_id,
        ex.exam_name,
        ex.exam_type,
        ex.exam_date,
        ex.max_marks,
        ex.weightage_percentage,
        ex.status,
        ex.published_at,
        c.course_code,
        c.course_name,
        co.section,
        t.term_code,
        t.term_name,
        CONCAT(f.first_name, ' ', f.last_name) AS instructor,
        COUNT(DISTINCT e.enrollment_id) AS total_eligible_students,
        COUNT(DISTINCT r.result_id) AS marks_entered_count,
        ROUND(COALESCE(AVG(r.marks_obtained / ex.max_marks * 100), 0), 1) AS exam_average_pct
      FROM exams ex
      JOIN course_offerings co ON ex.offering_id = co.offering_id
      JOIN courses c ON co.course_id = c.course_id
      JOIN academic_terms t ON co.term_id = t.term_id
      JOIN faculty f ON co.faculty_id = f.faculty_id
      LEFT JOIN enrollments e ON co.offering_id = e.offering_id AND e.status = 'Enrolled'
      LEFT JOIN results r ON ex.exam_id = r.exam_id
      ${whereSql}
      GROUP BY ex.exam_id, ex.offering_id, ex.exam_name, ex.exam_type, ex.exam_date, 
               ex.max_marks, ex.weightage_percentage, ex.status, ex.published_at, 
               c.course_code, c.course_name, co.section, t.term_code, t.term_name, 
               f.first_name, f.last_name
      ORDER BY ex.exam_date DESC;
    `, params);

    return successResponse(res, exams, 'Exams retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function createExam(req, res, next) {
  try {
    const { offeringId, examName, examType, examDate, maxMarks = 100, weightagePercentage = 20 } = req.body;

    if (!offeringId || !examName || !examType || !examDate) {
      return errorResponse(res, 'offeringId, examName, examType, and examDate are required', 400);
    }

    if (maxMarks <= 0) {
      return errorResponse(res, 'Maximum marks must be greater than 0', 400);
    }

    const result = await query(`
      INSERT INTO exams (offering_id, exam_name, exam_type, exam_date, max_marks, weightage_percentage, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Draft')
    `, [
      parseInt(offeringId, 10),
      examName.trim(),
      examType,
      examDate,
      parseFloat(maxMarks),
      parseFloat(weightagePercentage)
    ]);

    await logAuditEvent({
      userId: req.user.userId,
      actionType: 'INSERT',
      tableName: 'exams',
      recordId: result.insertId,
      newValues: { offeringId, examName, examType, maxMarks }
    });

    return successResponse(res, { examId: result.insertId }, 'Exam created successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function updateExam(req, res, next) {
  try {
    const examId = parseInt(req.params.id, 10);
    const { examName, examType, examDate, maxMarks, weightagePercentage } = req.body;

    const [existing] = await query('SELECT status FROM exams WHERE exam_id = ?', [examId]);
    if (!existing) {
      return errorResponse(res, 'Exam not found', 404);
    }

    if (existing.status === 'Published') {
      return errorResponse(res, 'Cannot modify published exam directly. Reopening requires administrative approval.', 403);
    }

    await query(`
      UPDATE exams
      SET 
        exam_name = COALESCE(?, exam_name),
        exam_type = COALESCE(?, exam_type),
        exam_date = COALESCE(?, exam_date),
        max_marks = COALESCE(?, max_marks),
        weightage_percentage = COALESCE(?, weightage_percentage),
        updated_at = NOW()
      WHERE exam_id = ?
    `, [
      examName ? examName.trim() : null,
      examType || null,
      examDate || null,
      maxMarks ? parseFloat(maxMarks) : null,
      weightagePercentage ? parseFloat(weightagePercentage) : null,
      examId
    ]);

    return successResponse(res, null, 'Exam updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Publish Exam via Stored Procedure sp_publish_exam
 */
async function publishExam(req, res, next) {
  try {
    const examId = parseInt(req.params.id, 10);

    // Call stored procedure sp_publish_exam
    await query('SET @p_published_count = 0;');
    await query('CALL sp_publish_exam(?, ?, @p_published_count);', [examId, req.user.userId]);
    const [result] = await query('SELECT @p_published_count AS publishedCount;');

    if (result.publishedCount === -1) {
      return errorResponse(res, 'Failed to publish exam transaction', 500);
    }

    return successResponse(res, { examId, publishedResultsCount: result.publishedCount }, 'Exam and results published successfully to students');
  } catch (error) {
    next(error);
  }
}

async function deleteExam(req, res, next) {
  try {
    const examId = parseInt(req.params.id, 10);

    const [existing] = await query('SELECT status FROM exams WHERE exam_id = ?', [examId]);
    if (!existing) {
      return errorResponse(res, 'Exam not found', 404);
    }

    if (existing.status === 'Published') {
      return errorResponse(res, 'Cannot delete an exam that has already been published', 400);
    }

    await query('DELETE FROM exams WHERE exam_id = ?', [examId]);
    return successResponse(res, null, 'Draft exam deleted successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getExams,
  createExam,
  updateExam,
  publishExam,
  deleteExam
};
