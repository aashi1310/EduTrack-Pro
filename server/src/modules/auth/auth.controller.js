const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditEvent } = require('../../utils/audit');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const users = await query(`
      SELECT 
        u.user_id,
        u.email,
        u.password_hash,
        u.is_active,
        r.role_id,
        r.role_name AS role,
        s.student_id,
        s.roll_number,
        s.first_name AS student_first,
        s.last_name AS student_last,
        f.faculty_id,
        f.employee_code,
        f.first_name AS faculty_first,
        f.last_name AS faculty_last
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN faculty f ON u.user_id = f.user_id
      WHERE u.email = ?
    `, [email.trim().toLowerCase()]);

    if (!users || users.length === 0) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const user = users[0];

    if (!user.is_active) {
      return errorResponse(res, 'Account is deactivated. Please contact administrator.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Update last_login
    await query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'edutrack_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const name = user.student_first 
      ? `${user.student_first} ${user.student_last}`
      : user.faculty_first 
        ? `${user.faculty_first} ${user.faculty_last}` 
        : (user.role === 'ADMIN' ? 'System Administrator' : user.email);

    const userData = {
      userId: user.user_id,
      email: user.email,
      role: user.role,
      name,
      studentId: user.student_id,
      rollNumber: user.roll_number,
      facultyId: user.faculty_id,
      employeeCode: user.employee_code
    };

    // Audit login event
    await logAuditEvent({
      userId: user.user_id,
      actionType: 'LOGIN',
      tableName: 'users',
      recordId: user.user_id,
      newValues: { email: user.email, role: user.role }
    });

    return successResponse(res, { token, user: userData }, 'Login successful');
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const userDetails = await query(`
      SELECT 
        u.user_id,
        u.email,
        u.is_active,
        u.last_login,
        r.role_name AS role,
        s.student_id,
        s.roll_number,
        s.first_name AS s_first,
        s.last_name AS s_last,
        s.current_semester,
        s.academic_status,
        sd.department_name AS student_dept,
        f.faculty_id,
        f.employee_code,
        f.first_name AS f_first,
        f.last_name AS f_last,
        f.designation,
        fd.department_name AS faculty_dept
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN departments sd ON s.department_id = sd.department_id
      LEFT JOIN faculty f ON u.user_id = f.user_id
      LEFT JOIN departments fd ON f.department_id = fd.department_id
      WHERE u.user_id = ?
    `, [req.user.userId]);

    if (!userDetails || userDetails.length === 0) {
      return errorResponse(res, 'User not found', 404);
    }

    const u = userDetails[0];
    const name = u.s_first 
      ? `${u.s_first} ${u.s_last}` 
      : u.f_first 
        ? `${u.f_first} ${u.f_last}` 
        : (u.role === 'ADMIN' ? 'System Administrator' : u.email);

    return successResponse(res, {
      userId: u.user_id,
      email: u.email,
      role: u.role,
      name,
      studentId: u.student_id,
      rollNumber: u.roll_number,
      semester: u.current_semester,
      academicStatus: u.academic_status,
      facultyId: u.faculty_id,
      employeeCode: u.employee_code,
      designation: u.designation,
      department: u.student_dept || u.faculty_dept || 'Administration',
      lastLogin: u.last_login
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  return successResponse(res, null, 'Logged out successfully');
}

module.exports = {
  login,
  getMe,
  logout
};
