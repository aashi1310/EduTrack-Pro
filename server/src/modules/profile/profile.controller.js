const bcrypt = require('bcryptjs');
const { query } = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');
const { logAuditEvent } = require('../../utils/audit');

async function getProfile(req, res, next) {
  try {
    const userId = req.user.userId;

    const [user] = await query(`
      SELECT 
        u.user_id,
        u.email,
        u.is_active,
        u.last_login,
        u.created_at,
        r.role_name AS role,
        s.student_id,
        s.roll_number,
        s.first_name AS student_first,
        s.last_name AS student_last,
        s.current_semester,
        s.admission_date,
        s.date_of_birth,
        s.gender,
        s.phone AS student_phone,
        s.academic_status,
        sd.department_name AS student_dept,
        f.faculty_id,
        f.employee_code,
        f.first_name AS faculty_first,
        f.last_name AS faculty_last,
        f.designation,
        f.joining_date,
        f.phone AS faculty_phone,
        fd.department_name AS faculty_dept
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN departments sd ON s.department_id = sd.department_id
      LEFT JOIN faculty f ON u.user_id = f.user_id
      LEFT JOIN departments fd ON f.department_id = fd.department_id
      WHERE u.user_id = ?;
    `, [userId]);

    if (!user) {
      return errorResponse(res, 'User profile not found', 404);
    }

    return successResponse(res, user);
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const userId = req.user.userId;
    const { phone } = req.body;

    if (req.user.role === 'STUDENT' && req.user.studentId) {
      await query('UPDATE students SET phone = ?, updated_at = NOW() WHERE student_id = ?', [phone || null, req.user.studentId]);
    } else if (req.user.role === 'FACULTY' && req.user.facultyId) {
      await query('UPDATE faculty SET phone = ?, updated_at = NOW() WHERE faculty_id = ?', [phone || null, req.user.facultyId]);
    }

    return successResponse(res, null, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Current and new password are required', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters long', 400);
    }

    const [user] = await query('SELECT password_hash FROM users WHERE user_id = ?', [userId]);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Current password verification failed', 400);
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?', [newHash, userId]);

    await logAuditEvent({
      userId,
      actionType: 'UPDATE_PASSWORD',
      tableName: 'users',
      recordId: userId,
      newValues: { passwordChanged: true }
    });

    return successResponse(res, null, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};
