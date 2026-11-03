const { query } = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditEvent } = require('../../utils/audit');

async function getDepartments(req, res, next) {
  try {
    const departments = await query(`
      SELECT 
        d.department_id,
        d.department_code,
        d.department_name,
        d.description,
        COUNT(DISTINCT s.student_id) AS student_count,
        COUNT(DISTINCT f.faculty_id) AS faculty_count,
        COUNT(DISTINCT c.course_id) AS course_count,
        ROUND(COALESCE(AVG(vas.attendance_percentage), 0), 1) AS avg_attendance
      FROM departments d
      LEFT JOIN students s ON d.department_id = s.department_id AND s.academic_status = 'Active'
      LEFT JOIN faculty f ON d.department_id = f.department_id AND f.is_active = TRUE
      LEFT JOIN courses c ON d.department_id = c.department_id AND c.is_active = TRUE
      LEFT JOIN v_attendance_summary vas ON s.student_id = vas.student_id
      GROUP BY d.department_id, d.department_code, d.department_name, d.description
      ORDER BY d.department_code ASC;
    `);

    return successResponse(res, departments, 'Departments retrieved successfully');
  } catch (error) {
    next(error);
  }
}

async function createDepartment(req, res, next) {
  try {
    const { departmentCode, departmentName, description } = req.body;

    if (!departmentCode || !departmentName) {
      return errorResponse(res, 'Department code and department name are required', 400);
    }

    const [existing] = await query('SELECT department_id FROM departments WHERE department_code = ?', [departmentCode.trim().toUpperCase()]);
    if (existing) {
      return errorResponse(res, `Department with code '${departmentCode}' already exists.`, 409);
    }

    const result = await query(`
      INSERT INTO departments (department_code, department_name, description)
      VALUES (?, ?, ?)
    `, [departmentCode.trim().toUpperCase(), departmentName.trim(), description || null]);

    await logAuditEvent({
      userId: req.user.userId,
      actionType: 'INSERT',
      tableName: 'departments',
      recordId: result.insertId,
      newValues: { departmentCode, departmentName }
    });

    return successResponse(res, { departmentId: result.insertId }, 'Department created successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function updateDepartment(req, res, next) {
  try {
    const departmentId = parseInt(req.params.id, 10);
    const { departmentName, description } = req.body;

    await query(`
      UPDATE departments
      SET 
        department_name = COALESCE(?, department_name),
        description = COALESCE(?, description),
        updated_at = NOW()
      WHERE department_id = ?
    `, [departmentName ? departmentName.trim() : null, description || null, departmentId]);

    return successResponse(res, null, 'Department updated successfully');
  } catch (error) {
    next(error);
  }
}

async function deleteDepartment(req, res, next) {
  try {
    const departmentId = parseInt(req.params.id, 10);

    // Check for dependent students, faculty, or courses
    const [counts] = await query(`
      SELECT 
        (SELECT COUNT(*) FROM students WHERE department_id = ?) AS student_count,
        (SELECT COUNT(*) FROM faculty WHERE department_id = ?) AS faculty_count,
        (SELECT COUNT(*) FROM courses WHERE department_id = ?) AS course_count
    `, [departmentId, departmentId, departmentId]);

    if (counts.student_count > 0 || counts.faculty_count > 0 || counts.course_count > 0) {
      return errorResponse(
        res,
        `Cannot delete department: dependent records exist (${counts.student_count} students, ${counts.faculty_count} faculty, ${counts.course_count} courses). Reassign or archive before deletion.`,
        400
      );
    }

    await query('DELETE FROM departments WHERE department_id = ?', [departmentId]);
    return successResponse(res, null, 'Department deleted successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
