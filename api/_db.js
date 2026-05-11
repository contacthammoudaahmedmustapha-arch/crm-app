// api/_db.js — Shared MySQL connection (Aiven)
import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:     process.env.AIVEN_HOST,
      port:     parseInt(process.env.AIVEN_PORT || '3306'),
      user:     process.env.AIVEN_USER,
      password: process.env.AIVEN_PASSWORD,
      database: process.env.AIVEN_DATABASE,
      ssl:      { rejectUnauthorized: true },
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });
  }
  return pool;
}
