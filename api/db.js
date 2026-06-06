const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

let isPostgres = false;
let db;

if (process.env.DATABASE_URL) {
  isPostgres = true;
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  const path = require('path');
  const dbPath = path.resolve(__dirname, '../db.sqlite');
  db = new sqlite3.Database(dbPath);
}

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      let index = 1;
      const pgSql = sql.replace(/\?/g, () => `$${index++}`);
      db.query(pgSql, params, (err, res) => {
        if (err) return reject(err);
        resolve(res.rows);
      });
    } else {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    }
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      let index = 1;
      const pgSql = sql.replace(/\?/g, () => `$${index++}`);
      db.query(pgSql, params, (err, res) => {
        if (err) return reject(err);
        resolve(res.rows[0]);
      });
    } else {
      db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    }
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      let index = 1;
      const pgSql = sql.replace(/\?/g, () => `$${index++}`);
      db.query(pgSql, params, (err, res) => {
        if (err) return reject(err);
        resolve({ lastID: null, changes: res.rowCount });
      });
    } else {
      db.run(sql, params, function(err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    }
  });
}

async function initDb() {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      company TEXT,
      product TEXT,
      category TEXT,
      email TEXT UNIQUE,
      password_hash TEXT,
      created_at TEXT
    )
  `;

  const assessmentsTable = `
    CREATE TABLE IF NOT EXISTS assessments (
      user_email TEXT,
      question_id TEXT,
      response_value TEXT,
      PRIMARY KEY (user_email, question_id)
    )
  `;

  const vulnerabilitiesTable = `
    CREATE TABLE IF NOT EXISTS vulnerabilities (
      id TEXT PRIMARY KEY,
      user_email TEXT,
      cve TEXT,
      component TEXT,
      severity TEXT,
      status TEXT,
      reported TEXT,
      due TEXT
    )
  `;

  await run(usersTable);
  await run(assessmentsTable);
  await run(vulnerabilitiesTable);
}

module.exports = {
  query,
  get,
  run,
  initDb,
  isPostgres
};
