/**
 * EduTrack Pro — Automated Database Migration & Seed Runner
 *
 * Executes all SQL scripts in the correct order using one of two strategies:
 *   1. Native MySQL CLI (preferred): handles DELIMITER directives natively.
 *   2. mysql2 + built-in DELIMITER parser (fallback): splits stored-program
 *      blocks correctly without relying on DELIMITER as a SQL statement.
 *
 * Execution order:
 *   01_schema.sql            → Tables & database creation
 *   02_constraints_indexes.sql → FK constraints & indexes
 *   03_views.sql             → Views
 *   04_triggers.sql          → Triggers
 *   05_functions.sql         → Stored functions
 *   06_procedures.sql        → Stored procedures
 *   07_sample_data.sql       → Seed data
 *
 * NOTE: 08_analytics_queries.sql and 09_test_queries.sql are NOT migrations
 * and are intentionally excluded from this runner.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── Load .env FIRST — before anything reads process.env ─────────────────────
// This must happen before DB_CONFIG is built so credentials are available.
const envPath = path.join(__dirname, '../server/.env');
if (fs.existsSync(envPath)) {
  try {
    // dotenv lives in server/node_modules — try there first, then global
    let dotenv;
    const dotenvLocal = path.join(__dirname, '../server/node_modules/dotenv');
    if (fs.existsSync(dotenvLocal)) {
      dotenv = require(dotenvLocal);
    } else {
      dotenv = require('dotenv');
    }
    dotenv.config({ path: envPath });
    console.log(`[Config] Loaded environment from: ${envPath}`);
  } catch (e) {
    console.warn('[Config] dotenv not available — falling back to process.env / defaults');
  }
} else {
  console.warn(`[Config] Warning: .env file not found at ${envPath}`);
  console.warn('[Config] Using environment variables or defaults.');
}

let mysql;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  try {
    mysql = require(path.join(__dirname, '../server/node_modules/mysql2/promise'));
  } catch (e2) {
    console.error('mysql2 not found in current dir or server/node_modules. Please run: npm install mysql2');
    process.exit(1);
  }
}

// ─── Configuration (built AFTER dotenv.config so env vars are populated) ─────
const DB_NAME = process.env.DB_NAME || 'edutrack';

function buildDbConfig() {
  return {
    host:               process.env.DB_HOST     || '127.0.0.1',
    port:               parseInt(process.env.DB_PORT || '3306', 10),
    user:               process.env.DB_USER     || 'root',
    password:           process.env.DB_PASSWORD || '',
    multipleStatements: true,
  };
}

// All schema/data scripts executed in this exact order
// 08_analytics_queries.sql and 09_test_queries.sql are intentionally excluded
const MIGRATION_FILES = [
  '01_schema.sql',
  '02_constraints_indexes.sql',
  '03_views.sql',
  '04_triggers.sql',
  '05_functions.sql',
  '06_procedures.sql',
  '07_sample_data.sql',
];

const MYSQL_EXE_PATHS = [
  'C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysql.exe',
  'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
  'C:\\Program Files\\MySQL\\MySQL Server 8.3\\bin\\mysql.exe',
  'C:\\Program Files\\MySQL\\MySQL Server 8.2\\bin\\mysql.exe',
  'C:\\Program Files\\MySQL\\MySQL Server 8.1\\bin\\mysql.exe',
  'mysql',
];

// ─── DELIMITER-aware SQL splitter ─────────────────────────────────────────────
/**
 * Splits a SQL file into individual executable statements, correctly
 * handling DELIMITER directives used in stored procedures, functions,
 * and triggers.
 *
 * @param {string} sql - Raw SQL file content
 * @returns {string[]} Array of individual SQL statements (no trailing semicolons removed)
 */
function splitSqlStatements(sql) {
  const statements = [];
  let delimiter   = ';';
  let current     = '';
  const lines     = sql.split('\n');

  for (let rawLine of lines) {
    const trimmed = rawLine.trim();

    // Skip empty lines and full-line comments
    if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('#')) {
      current += rawLine + '\n';
      continue;
    }

    // Detect DELIMITER directive (client command, not SQL)
    const delimMatch = trimmed.match(/^DELIMITER\s+(\S+)/i);
    if (delimMatch) {
      // Push any accumulated statement before the delimiter change
      const acc = current.trim();
      if (acc && acc !== delimiter && acc.length > 0) {
        statements.push(acc);
      }
      current   = '';
      delimiter = delimMatch[1];
      continue; // Do NOT add DELIMITER line to current SQL
    }

    current += rawLine + '\n';

    // Check if current buffer ends with the active delimiter
    const normalizedCurrent = current.trimEnd();
    if (normalizedCurrent.endsWith(delimiter)) {
      let stmt = normalizedCurrent;
      // Strip the trailing delimiter before sending to mysql2
      if (delimiter !== ';') {
        stmt = stmt.slice(0, stmt.length - delimiter.length).trimEnd();
      } else {
        // Standard semicolon — strip only the final one
        stmt = stmt.slice(0, stmt.lastIndexOf(';')).trimEnd();
      }

      if (stmt.trim().length > 0) {
        statements.push(stmt);
      }
      current = '';
    }
  }

  // Flush any remaining buffer
  const remaining = current.trim();
  if (remaining && remaining !== delimiter) {
    statements.push(remaining);
  }

  return statements.filter(s => s.trim().length > 0);
}

// ─── Strategy 1: Native MySQL CLI ─────────────────────────────────────────────
function findMysqlClient() {
  for (const p of MYSQL_EXE_PATHS) {
    if (p === 'mysql') {
      try {
        execSync('mysql --version', { stdio: 'ignore' });
        return 'mysql';
      } catch { continue; }
    }
    if (fs.existsSync(p)) {
      return `"${p}"`;
    }
  }
  return null;
}

async function runWithMysqlClient(mysqlBin, DB_CONFIG, skipSchema = false) {
  console.log(`\n[Migration] Using native MySQL client: ${mysqlBin}`);
  const dbDir        = __dirname;
  const passwordFlag = DB_CONFIG.password ? `-p"${DB_CONFIG.password}"` : '';

  for (const file of MIGRATION_FILES) {
    if (skipSchema && (file === '01_schema.sql' || file === '07_sample_data.sql')) {
      console.log(`   ⊘ Skipped (populated DB guard): ${file}`);
      continue;
    }
    const filePath = path.join(dbDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`   ⚠ Skipped (not found): ${file}`);
      continue;
    }
    console.log(`   → Executing ${file}...`);
    const cmd = `${mysqlBin} -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} ${passwordFlag} < "${filePath}"`;
    try {
      execSync(cmd, { stdio: 'inherit', shell: 'cmd.exe' });
      console.log(`   ✓ ${file} — complete`);
    } catch (err) {
      console.error(`   ✗ ${file} — FAILED: ${err.message}`);
      throw new Error(`Migration failed at ${file}`);
    }
  }
}

// ─── Strategy 2: mysql2 with DELIMITER-aware parser ───────────────────────────
async function runWithMysql2Driver(DB_CONFIG, skipSchema = false) {
  console.log('\n[Migration] Native client not found — using mysql2 driver with DELIMITER parser.');
  console.log('[Migration] Connecting to MySQL...');

  const connection = await mysql.createConnection({ ...DB_CONFIG, multipleStatements: false });
  console.log('[Migration] Connected successfully.\n');

  for (const file of MIGRATION_FILES) {
    if (skipSchema && (file === '01_schema.sql' || file === '07_sample_data.sql')) {
      console.log(`   ⊘ Skipped (populated DB guard): ${file}`);
      continue;
    }
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`   ⚠ Skipped (not found): ${file}`);
      continue;
    }

    console.log(`   → Processing ${file}...`);
    const sql        = fs.readFileSync(filePath, 'utf8');
    const statements = splitSqlStatements(sql);

    let successCount = 0;
    let errorCount   = 0;

    for (const stmt of statements) {
      const preview = stmt.trim().replace(/\s+/g, ' ').substring(0, 80);
      try {
        await connection.query(stmt);
        successCount++;
      } catch (err) {
        // Tolerate "already exists" / "duplicate" errors for idempotent runs
        if (err.code === 'ER_TABLE_EXISTS_ERROR' ||
            err.code === 'ER_DUP_KEYNAME'        ||
            err.code === 'ER_DB_CREATE_EXISTS'   ||
            (err.errno >= 1304 && err.errno <= 1308)) { // stored program already exists
          console.warn(`      ↺ Idempotent skip: ${preview}...`);
          successCount++;
        } else {
          console.error(`      ✗ Statement failed [${err.code || err.errno}]: ${preview}...`);
          console.error(`        Full error: ${err.message}`);
          errorCount++;
          // For schema & constraint files, fail fast; for stored logic, try to continue
          if (['01_schema.sql', '02_constraints_indexes.sql'].includes(file)) {
            await connection.end();
            throw new Error(`Critical migration failure in ${file}`);
          }
        }
      }
    }

    if (errorCount === 0) {
      console.log(`   ✓ ${file} — ${successCount} statements applied`);
    } else {
      console.warn(`   ⚠ ${file} — ${successCount} ok, ${errorCount} errors (see above)`);
    }
  }

  await connection.end();
}

// ─── Verification ─────────────────────────────────────────────────────────────
async function verifyDatabase(DB_CONFIG) {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  VERIFICATION — EduTrack Pro Database Object Inventory');
  console.log('═══════════════════════════════════════════════════════\n');

  const conn = await mysql.createConnection({ ...DB_CONFIG, database: 'edutrack' });

  const [tables] = await conn.query(`
    SELECT TABLE_NAME AS \`Table\`, ENGINE, TABLE_ROWS AS \`Est. Rows\`,
           TABLE_COLLATION AS Collation
    FROM   information_schema.TABLES
    WHERE  TABLE_SCHEMA = 'edutrack' AND TABLE_TYPE = 'BASE TABLE'
    ORDER  BY TABLE_NAME;
  `);
  console.log(`Tables found: ${tables.length}`);
  console.table(tables);

  const [views] = await conn.query(`
    SELECT TABLE_NAME AS \`View\`
    FROM   information_schema.VIEWS
    WHERE  TABLE_SCHEMA = 'edutrack'
    ORDER  BY TABLE_NAME;
  `);
  console.log(`Views found: ${views.length}`);
  console.table(views);

  const [routines] = await conn.query(`
    SELECT ROUTINE_TYPE AS Type, ROUTINE_NAME AS Name
    FROM   information_schema.ROUTINES
    WHERE  ROUTINE_SCHEMA = 'edutrack'
    ORDER  BY ROUTINE_TYPE, ROUTINE_NAME;
  `);
  console.log(`Stored routines found: ${routines.length}`);
  console.table(routines);

  const [triggers] = await conn.query(`
    SELECT TRIGGER_NAME AS \`Trigger\`, EVENT_MANIPULATION AS Event,
           EVENT_OBJECT_TABLE AS \`Table\`, ACTION_TIMING AS Timing
    FROM   information_schema.TRIGGERS
    WHERE  TRIGGER_SCHEMA = 'edutrack'
    ORDER  BY EVENT_OBJECT_TABLE, TRIGGER_NAME;
  `);
  console.log(`Triggers found: ${triggers.length}`);
  console.table(triggers);

  await conn.end();
}

// ─── Main Entry Point ─────────────────────────────────────────────────────────
async function main() {
  // DB_CONFIG must be built here (after dotenv loaded at top of file)
  const DB_CONFIG = buildDbConfig();

  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   EDUTRACK PRO — DATABASE INITIALIZATION PIPELINE     ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log(`Host: ${DB_CONFIG.host}:${DB_CONFIG.port}  User: ${DB_CONFIG.user}  DB: ${DB_NAME}\n`);

  // ── Guard: detect populated database before running DROP TABLE scripts ──────
  let skipSchema = false;
  try {
    const probe = await mysql.createConnection({ ...DB_CONFIG, database: DB_NAME });
    const [[row]] = await probe.query(
      `SELECT COUNT(*) AS tbl_count
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'`,
      [DB_NAME]
    );
    const [[dataRow]] = await probe.query(
      `SELECT COALESCE(SUM(TABLE_ROWS), 0) AS est_rows
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'`,
      [DB_NAME]
    );
    await probe.end();

    const tableCount = row.tbl_count;
    const estRows    = dataRow.est_rows;

    if (tableCount > 0) {
      console.log(`[Guard] Database '${DB_NAME}' already contains ${tableCount} table(s) (~${estRows} estimated rows).`);
      if (estRows > 0) {
        console.warn('[Guard] *** POPULATED DATABASE DETECTED ***');
        console.warn('[Guard] 01_schema.sql contains DROP TABLE statements that will DESTROY existing data.');
        console.warn('[Guard] Skipping 01_schema.sql and 07_sample_data.sql to protect existing data.');
        console.warn('[Guard] Pass --force flag to override: node run_migrations.js --force');
        if (!process.argv.includes('--force')) {
          skipSchema = true;
        }
      } else {
        console.log('[Guard] Database exists but appears empty — safe to initialize.');
      }
    } else {
      console.log(`[Guard] Database '${DB_NAME}' is empty — full initialization will run.`);
    }
  } catch (probeErr) {
    // Database does not exist yet — fine, 01_schema.sql will create it
    if (probeErr.code === 'ER_BAD_DB_ERROR' || probeErr.code === 'ECONNREFUSED') {
      console.log(`[Guard] Database '${DB_NAME}' does not exist yet — will be created by migration.`);
    } else {
      console.warn('[Guard] Could not probe database state:', probeErr.message);
    }
  }

  const mysqlClient = findMysqlClient();

  try {
    if (mysqlClient) {
      await runWithMysqlClient(mysqlClient, DB_CONFIG, skipSchema);
    } else {
      await runWithMysql2Driver(DB_CONFIG, skipSchema);
    }
  } catch (err) {
    console.error('\n✗ Migration pipeline failed:', err.message);
    process.exit(1);
  }

  try {
    await verifyDatabase(DB_CONFIG);
  } catch (err) {
    console.warn('\n⚠ Verification step encountered an error:', err.message);
    console.warn('  This may happen if the database name was not yet created.');
  }

  console.log('\n✓ EduTrack database migration completed.\n');
}

main().catch((err) => {
  console.error('\n✗ Unhandled error:', err);
  process.exit(1);
});
