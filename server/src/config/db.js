const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'edutrack',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '20', 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  dateStrings: true,
});

/**
 * Execute parameterized query using pool
 */
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * Acquire single connection from pool
 */
async function getConnection() {
  return await pool.getConnection();
}

/**
 * Execute callback function within an ACID transaction
 */
async function transaction(callback) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Test pool connectivity
 */
async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result, NOW() AS server_time, VERSION() AS mysql_version');
    console.log(`[MySQL Pool] Connected to edutrack database successfully (v${rows[0].mysql_version})`);
    return true;
  } catch (err) {
    console.error('[MySQL Pool] Connection failed:', err.message);
    return false;
  }
}

module.exports = {
  pool,
  query,
  getConnection,
  transaction,
  testConnection
};
