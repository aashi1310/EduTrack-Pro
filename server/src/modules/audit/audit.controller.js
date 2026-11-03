const { query } = require('../../config/db');
const { successResponse, errorResponse } = require('../../utils/response');

async function getAuditLogs(req, res, next) {
  try {
    const {
      actionType,
      tableName,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    const whereClauses = [];

    if (actionType) {
      whereClauses.push('a.action_type = ?');
      params.push(actionType);
    }

    if (tableName) {
      whereClauses.push('a.table_name = ?');
      params.push(tableName);
    }

    if (startDate) {
      whereClauses.push('a.action_time >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereClauses.push('a.action_time <= ?');
      params.push(endDate);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM audit_logs a ${whereSql}`;
    const [countResult] = await query(countSql, params);
    const total = countResult ? countResult.total : 0;

    const dataSql = `
      SELECT 
        a.audit_id,
        a.user_id,
        u.email AS user_email,
        r.role_name AS user_role,
        a.action_type,
        a.table_name,
        a.record_id,
        a.old_values,
        a.new_values,
        a.ip_address,
        a.action_time
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.user_id
      LEFT JOIN roles r ON u.role_id = r.role_id
      ${whereSql}
      ORDER BY a.action_time DESC
      LIMIT ? OFFSET ?;
    `;

    const logs = await query(dataSql, [...params, parseInt(limit, 10), parseInt(offset, 10)]);

    return successResponse(res, logs, 'Audit logs retrieved successfully', 200, {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10))
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAuditLogs
};
