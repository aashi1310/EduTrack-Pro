const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { errorResponse } = require('../utils/response');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token missing or malformed', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'edutrack_secret');
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Session token has expired. Please log in again.', 401);
      }
      return errorResponse(res, 'Invalid authentication token.', 401);
    }

    // Lookup user in MySQL
    const users = await query(`
      SELECT 
        u.user_id,
        u.email,
        u.is_active,
        r.role_name AS role,
        s.student_id,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        f.faculty_id,
        CONCAT(f.first_name, ' ', f.last_name) AS faculty_name
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN students s ON u.user_id = s.user_id
      LEFT JOIN faculty f ON u.user_id = f.user_id
      WHERE u.user_id = ?
    `, [decoded.userId]);

    if (!users || users.length === 0) {
      return errorResponse(res, 'User account no longer exists.', 401);
    }

    const user = users[0];

    if (!user.is_active) {
      return errorResponse(res, 'User account is deactivated. Contact administrator.', 403);
    }

    req.user = {
      userId: user.user_id,
      email: user.email,
      role: user.role,
      studentId: user.student_id,
      facultyId: user.faculty_id,
      name: user.student_name || user.faculty_name || (user.role === 'ADMIN' ? 'System Administrator' : user.email)
    };

    next();
  } catch (error) {
    console.error('Authentication Middleware Error:', error);
    return errorResponse(res, 'Internal authentication error', 500);
  }
}

module.exports = {
  authenticate
};
