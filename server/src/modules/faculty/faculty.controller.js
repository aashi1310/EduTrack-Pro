const bcrypt = require('bcryptjs');
const { query, transaction } = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditEvent } = require('../../utils/audit');

async function getFacultyList(req, res, next) {
  try {
    const { departmentId, search = '', status } = req.query;
    const params = [];
    const whereClauses = [];

    if (search.trim()) {
      whereClauses.push('(f.first_name LIKE ? OR f.last_name LIKE ? OR f.employee_code LIKE ? OR u.email LIKE ?)');
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    if (departmentId) {
      whereClauses.push('f.department_id = ?');
      params.push(parseInt(departmentId, 10));
    }

    if (status !== undefined && status !== '') {
      whereClauses.push('f.is_active = ?');
      params.push(status === 'true' || status === '1');
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT 
        f.faculty_id,
        f.user_id,
        f.employee_code,
        CONCAT(f.first_name, ' ', f.last_name) AS full_name,
        f.first_name,
        f.last_name,
        u.email,
        f.department_id,
        d.department_code,
        d.department_name,
        f.designation,
        f.joining_date,
        f.phone,
        f.is_active,
        COUNT(DISTINCT co.offering_id) AS assigned_courses_count
      FROM faculty f
      JOIN users u ON f.user_id = u.user_id
      JOIN departments d ON f.department_id = d.department_id
      LEFT JOIN course_offerings co ON f.faculty_id = co.faculty_id AND co.status = 'Open'
      ${whereSql}
      GROUP BY f.faculty_id, f.user_id, f.employee_code, f.first_name, f.last_name, 
               u.email, f.department_id, d.department_code, d.department_name, 
               f.designation, f.joining_date, f.phone, f.is_active
      ORDER BY f.employee_code ASC;
    `;

    const faculty = await query(sql, params);
    return successResponse(res, faculty, 'Faculty list retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function getFacultyById(req, res, next) {
  try {
    const facultyId = parseInt(req.params.id, 10);
    const faculty = await query(`
      SELECT 
        f.faculty_id,
        f.user_id,
        f.employee_code,
        CONCAT(f.first_name, ' ', f.last_name) AS full_name,
        f.first_name,
        f.last_name,
        u.email,
        f.department_id,
        d.department_code,
        d.department_name,
        f.designation,
        f.joining_date,
        f.phone,
        f.is_active
      FROM faculty f
      JOIN users u ON f.user_id = u.user_id
      JOIN departments d ON f.department_id = d.department_id
      WHERE f.faculty_id = ?
    `, [facultyId]);

    if (!faculty || faculty.length === 0) {
      return errorResponse(res, 'Faculty member not found', 404);
    }

    const assignedOfferings = await query(`
      SELECT 
        co.offering_id,
        c.course_code,
        c.course_name,
        c.credits,
        co.section,
        co.capacity,
        co.status AS offering_status,
        t.term_code,
        t.term_name,
        COUNT(DISTINCT e.enrollment_id) AS enrolled_students
      FROM course_offerings co
      JOIN courses c ON co.course_id = c.course_id
      JOIN academic_terms t ON co.term_id = t.term_id
      LEFT JOIN enrollments e ON co.offering_id = e.offering_id AND e.status = 'Enrolled'
      WHERE co.faculty_id = ?
      GROUP BY co.offering_id, c.course_code, c.course_name, c.credits, 
               co.section, co.capacity, co.status, t.term_code, t.term_name
      ORDER BY t.start_date DESC;
    `, [facultyId]);

    return successResponse(res, {
      faculty: faculty[0],
      assignedOfferings
    });
  } catch (error) {
    next(error);
  }
}

async function createFaculty(req, res, next) {
  try {
    const {
      email,
      password,
      employeeCode,
      firstName,
      lastName,
      departmentId,
      designation = 'Assistant Professor',
      joiningDate,
      phone
    } = req.body;

    if (!email || !employeeCode || !firstName || !lastName || !departmentId || !joiningDate) {
      return errorResponse(res, 'Please provide all required fields: email, employeeCode, firstName, lastName, departmentId, joiningDate', 400);
    }

    const existing = await query(`
      SELECT 'email' AS duplicate_field FROM users WHERE email = ?
      UNION ALL
      SELECT 'employee_code' AS duplicate_field FROM faculty WHERE employee_code = ?
    `, [email.trim().toLowerCase(), employeeCode.trim().toUpperCase()]);

    if (existing && existing.length > 0) {
      return errorResponse(res, `Duplicate field: ${existing[0].duplicate_field} is already in use`, 409);
    }

    const defaultPassword = password || 'Faculty@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const result = await transaction(async (conn) => {
      // 1. Create User with role FACULTY (Role ID 2)
      const [userResult] = await conn.query(`
        INSERT INTO users (email, password_hash, role_id, is_active)
        VALUES (?, ?, 2, TRUE)
      `, [email.trim().toLowerCase(), passwordHash]);

      const userId = userResult.insertId;

      // 2. Create Faculty Profile
      const [facultyResult] = await conn.query(`
        INSERT INTO faculty (
          user_id, employee_code, first_name, last_name, department_id,
          designation, joining_date, phone, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
      `, [
        userId,
        employeeCode.trim().toUpperCase(),
        firstName.trim(),
        lastName.trim(),
        parseInt(departmentId, 10),
        designation.trim(),
        joiningDate,
        phone || null
      ]);

      return { userId, facultyId: facultyResult.insertId };
    });

    await logAuditEvent({
      userId: req.user.userId,
      actionType: 'INSERT',
      tableName: 'faculty',
      recordId: result.facultyId,
      newValues: { employeeCode, firstName, lastName, departmentId, designation }
    });

    return successResponse(res, result, 'Faculty created successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function updateFaculty(req, res, next) {
  try {
    const facultyId = parseInt(req.params.id, 10);
    const { firstName, lastName, departmentId, designation, phone, isActive } = req.body;

    await query(`
      UPDATE faculty
      SET 
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        department_id = COALESCE(?, department_id),
        designation = COALESCE(?, designation),
        phone = COALESCE(?, phone),
        is_active = COALESCE(?, is_active),
        updated_at = NOW()
      WHERE faculty_id = ?
    `, [
      firstName ? firstName.trim() : null,
      lastName ? lastName.trim() : null,
      departmentId ? parseInt(departmentId, 10) : null,
      designation ? designation.trim() : null,
      phone || null,
      isActive !== undefined ? Boolean(isActive) : null,
      facultyId
    ]);

    return successResponse(res, null, 'Faculty updated successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getFacultyList,
  getFacultyById,
  createFaculty,
  updateFaculty
};
