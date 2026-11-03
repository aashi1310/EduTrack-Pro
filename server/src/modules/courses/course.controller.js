const { query } = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditEvent } = require('../../utils/audit');

// --- COURSES CATALOGUE ---

async function getCourses(req, res, next) {
  try {
    const { departmentId, search = '', credits } = req.query;
    const params = [];
    const whereClauses = [];

    if (search.trim()) {
      whereClauses.push('(c.course_code LIKE ? OR c.course_name LIKE ?)');
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern);
    }

    if (departmentId) {
      whereClauses.push('c.department_id = ?');
      params.push(parseInt(departmentId, 10));
    }

    if (credits) {
      whereClauses.push('c.credits = ?');
      params.push(parseInt(credits, 10));
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const courses = await query(`
      SELECT 
        c.course_id,
        c.course_code,
        c.course_name,
        c.department_id,
        d.department_code,
        d.department_name,
        c.credits,
        c.description,
        c.is_active,
        COUNT(DISTINCT co.offering_id) AS total_offerings_count
      FROM courses c
      JOIN departments d ON c.department_id = d.department_id
      LEFT JOIN course_offerings co ON c.course_id = co.course_id
      ${whereSql}
      GROUP BY c.course_id, c.course_code, c.course_name, c.department_id, 
               d.department_code, d.department_name, c.credits, c.description, c.is_active
      ORDER BY c.course_code ASC;
    `, params);

    return successResponse(res, courses, 'Course catalogue retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function createCourse(req, res, next) {
  try {
    const { courseCode, courseName, departmentId, credits, description } = req.body;

    if (!courseCode || !courseName || !departmentId || !credits) {
      return errorResponse(res, 'Course code, name, department, and credits (1-6) are required', 400);
    }

    const [existing] = await query('SELECT course_id FROM courses WHERE course_code = ?', [courseCode.trim().toUpperCase()]);
    if (existing) {
      return errorResponse(res, `Course code '${courseCode}' is already registered.`, 409);
    }

    const result = await query(`
      INSERT INTO courses (course_code, course_name, department_id, credits, description, is_active)
      VALUES (?, ?, ?, ?, ?, TRUE)
    `, [
      courseCode.trim().toUpperCase(),
      courseName.trim(),
      parseInt(departmentId, 10),
      parseInt(credits, 10),
      description || null
    ]);

    await logAuditEvent({
      userId: req.user.userId,
      actionType: 'INSERT',
      tableName: 'courses',
      recordId: result.insertId,
      newValues: { courseCode, courseName, departmentId, credits }
    });

    return successResponse(res, { courseId: result.insertId }, 'Course created successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function updateCourse(req, res, next) {
  try {
    const courseId = parseInt(req.params.id, 10);
    const { courseName, departmentId, credits, description, isActive } = req.body;

    await query(`
      UPDATE courses
      SET 
        course_name = COALESCE(?, course_name),
        department_id = COALESCE(?, department_id),
        credits = COALESCE(?, credits),
        description = COALESCE(?, description),
        is_active = COALESCE(?, is_active),
        updated_at = NOW()
      WHERE course_id = ?
    `, [
      courseName ? courseName.trim() : null,
      departmentId ? parseInt(departmentId, 10) : null,
      credits ? parseInt(credits, 10) : null,
      description || null,
      isActive !== undefined ? Boolean(isActive) : null,
      courseId
    ]);

    return successResponse(res, null, 'Course updated successfully');
  } catch (error) {
    next(error);
  }
}

// --- COURSE OFFERINGS ---

async function getCourseOfferings(req, res, next) {
  try {
    const { termId, facultyId, departmentId, status } = req.query;
    const params = [];
    const whereClauses = [];

    if (termId) {
      whereClauses.push('co.term_id = ?');
      params.push(parseInt(termId, 10));
    }

    if (facultyId) {
      whereClauses.push('co.faculty_id = ?');
      params.push(parseInt(facultyId, 10));
    }

    if (departmentId) {
      whereClauses.push('c.department_id = ?');
      params.push(parseInt(departmentId, 10));
    }

    if (status) {
      whereClauses.push('co.status = ?');
      params.push(status);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const offerings = await query(`
      SELECT 
        co.offering_id,
        co.course_id,
        c.course_code,
        c.course_name,
        c.credits,
        c.department_id,
        d.department_code,
        d.department_name,
        co.term_id,
        t.term_code,
        t.term_name,
        t.academic_year,
        co.faculty_id,
        f.employee_code,
        CONCAT(f.first_name, ' ', f.last_name) AS faculty_name,
        co.section,
        co.capacity,
        co.status AS offering_status,
        COUNT(DISTINCT e.enrollment_id) AS enrolled_count,
        (co.capacity - COUNT(DISTINCT e.enrollment_id)) AS available_seats,
        COUNT(DISTINCT cs.session_id) AS total_sessions,
        COUNT(DISTINCT ex.exam_id) AS total_exams
      FROM course_offerings co
      JOIN courses c ON co.course_id = c.course_id
      JOIN departments d ON c.department_id = d.department_id
      JOIN academic_terms t ON co.term_id = t.term_id
      JOIN faculty f ON co.faculty_id = f.faculty_id
      LEFT JOIN enrollments e ON co.offering_id = e.offering_id AND e.status = 'Enrolled'
      LEFT JOIN class_sessions cs ON co.offering_id = cs.offering_id
      LEFT JOIN exams ex ON co.offering_id = ex.offering_id
      ${whereSql}
      GROUP BY co.offering_id, co.course_id, c.course_code, c.course_name, c.credits, 
               c.department_id, d.department_code, d.department_name, co.term_id, 
               t.term_code, t.term_name, t.academic_year, co.faculty_id, f.employee_code, 
               f.first_name, f.last_name, co.section, co.capacity, co.status
      ORDER BY t.start_date DESC, c.course_code ASC;
    `, params);

    return successResponse(res, offerings, 'Course offerings retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function createCourseOffering(req, res, next) {
  try {
    const { courseId, termId, facultyId, section = 'A', capacity = 40 } = req.body;

    if (!courseId || !termId || !facultyId) {
      return errorResponse(res, 'Course, Term, and Faculty are required', 400);
    }

    // Check unique course offering (course_id, term_id, section)
    const [existing] = await query(`
      SELECT offering_id FROM course_offerings 
      WHERE course_id = ? AND term_id = ? AND section = ?
    `, [parseInt(courseId, 10), parseInt(termId, 10), section.trim().toUpperCase()]);

    if (existing) {
      return errorResponse(res, `Offering already exists for this course, term, and section (${section}).`, 409);
    }

    const result = await query(`
      INSERT INTO course_offerings (course_id, term_id, faculty_id, section, capacity, status)
      VALUES (?, ?, ?, ?, ?, 'Open')
    `, [
      parseInt(courseId, 10),
      parseInt(termId, 10),
      parseInt(facultyId, 10),
      section.trim().toUpperCase(),
      parseInt(capacity, 10)
    ]);

    await logAuditEvent({
      userId: req.user.userId,
      actionType: 'INSERT',
      tableName: 'course_offerings',
      recordId: result.insertId,
      newValues: { courseId, termId, facultyId, section, capacity }
    });

    return successResponse(res, { offeringId: result.insertId }, 'Course offering created successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function updateCourseOffering(req, res, next) {
  try {
    const offeringId = parseInt(req.params.id, 10);
    const { facultyId, capacity, status } = req.body;

    await query(`
      UPDATE course_offerings
      SET 
        faculty_id = COALESCE(?, faculty_id),
        capacity = COALESCE(?, capacity),
        status = COALESCE(?, status)
      WHERE offering_id = ?
    `, [
      facultyId ? parseInt(facultyId, 10) : null,
      capacity ? parseInt(capacity, 10) : null,
      status || null,
      offeringId
    ]);

    return successResponse(res, null, 'Course offering updated successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCourses,
  createCourse,
  updateCourse,
  getCourseOfferings,
  createCourseOffering,
  updateCourseOffering
};
