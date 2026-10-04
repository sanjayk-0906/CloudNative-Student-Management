const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

async function initDatabase() {
  console.log('---------------------------------------------------------');
  console.log('🔄 Initializing MySQL Database for CloudNative Platform...');
  console.log('---------------------------------------------------------');

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'student_management';

  console.log(`Connecting to MySQL server at ${host}:${port} as ${user}...`);

  let connection;
  try {
    // 1. Connect without database first to ensure database exists
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL server.');

    // 2. Read and run schema.sql
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log(`Executing Schema from: ${schemaPath}`);
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('✅ Schema tables created successfully (students, attendance, marks).');
    } else {
      console.error(`❌ schema.sql not found at ${schemaPath}`);
    }

    // 3. Read and run seed.sql
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log(`Executing Seed Data from: ${seedPath}`);
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await connection.query(seedSql);
      console.log('✅ Seed data inserted successfully (12 students, attendance logs, subject marks).');
    } else {
      console.error(`❌ seed.sql not found at ${seedPath}`);
    }

    console.log('---------------------------------------------------------');
    console.log('🎉 Database initialization complete!');
    console.log(`Database '${database}' is ready on ${host}:${port}.`);
    console.log('---------------------------------------------------------');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
