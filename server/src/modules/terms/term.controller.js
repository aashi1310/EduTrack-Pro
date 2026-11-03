const { query, transaction } = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');

async function getTerms(req, res, next) {
  try {
    const terms = await query(`
      SELECT 
        t.term_id,
        t.term_code,
        t.term_name,
        t.academic_year,
        t.semester_type,
        t.start_date,
        t.end_date,
        t.is_active,
        t.is_completed,
        COUNT(DISTINCT co.offering_id) AS total_offerings,
        COUNT(DISTINCT e.enrollment_id) AS total_enrollments
      FROM academic_terms t
      LEFT JOIN course_offerings co ON t.term_id = co.term_id
      LEFT JOIN enrollments e ON co.offering_id = e.offering_id
      GROUP BY t.term_id, t.term_code, t.term_name, t.academic_year, 
               t.semester_type, t.start_date, t.end_date, t.is_active, t.is_completed
      ORDER BY t.start_date DESC;
    `);

    return successResponse(res, terms, 'Academic terms retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function createTerm(req, res, next) {
  try {
    const { termCode, termName, academicYear, semesterType, startDate, endDate, isActive = false } = req.body;

    if (!termCode || !termName || !academicYear || !semesterType || !startDate || !endDate) {
      return errorResponse(res, 'All term fields are required', 400);
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return errorResponse(res, 'Term end date must be after start date', 400);
    }

    const [existing] = await query('SELECT term_id FROM academic_terms WHERE term_code = ?', [termCode.trim().toUpperCase()]);
    if (existing) {
      return errorResponse(res, `Term code '${termCode}' already exists`, 409);
    }

    const result = await transaction(async (conn) => {
      if (isActive) {
        // Deactivate other terms if this is set active
        await conn.query('UPDATE academic_terms SET is_active = FALSE');
      }

      const [insertResult] = await conn.query(`
        INSERT INTO academic_terms (term_code, term_name, academic_year, semester_type, start_date, end_date, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        termCode.trim().toUpperCase(),
        termName.trim(),
        academicYear.trim(),
        semesterType,
        startDate,
        endDate,
        Boolean(isActive)
      ]);

      return insertResult.insertId;
    });

    return successResponse(res, { termId: result }, 'Academic term created successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function updateTerm(req, res, next) {
  try {
    const termId = parseInt(req.params.id, 10);
    const { termName, startDate, endDate, isActive, isCompleted } = req.body;

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return errorResponse(res, 'End date must be after start date', 400);
    }

    await transaction(async (conn) => {
      if (isActive) {
        await conn.query('UPDATE academic_terms SET is_active = FALSE');
      }

      await conn.query(`
        UPDATE academic_terms
        SET 
          term_name = COALESCE(?, term_name),
          start_date = COALESCE(?, start_date),
          end_date = COALESCE(?, end_date),
          is_active = COALESCE(?, is_active),
          is_completed = COALESCE(?, is_completed)
        WHERE term_id = ?
      `, [
        termName ? termName.trim() : null,
        startDate || null,
        endDate || null,
        isActive !== undefined ? Boolean(isActive) : null,
        isCompleted !== undefined ? Boolean(isCompleted) : null,
        termId
      ]);
    });

    return successResponse(res, null, 'Academic term updated successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTerms,
  createTerm,
  updateTerm
};
