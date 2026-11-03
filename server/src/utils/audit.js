const { query } = require('../config/db');

async function logAuditEvent({ userId, actionType, tableName, recordId, oldValues = null, newValues = null, ipAddress = '127.0.0.1' }) {
  try {
    await query(`
      INSERT INTO audit_logs (
        user_id, action_type, table_name, record_id, old_values, new_values, ip_address, action_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      userId || null,
      actionType,
      tableName,
      String(recordId),
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      ipAddress
    ]);
  } catch (error) {
    console.error('Audit Logging Failed:', error.message);
  }
}

module.exports = {
  logAuditEvent
};
