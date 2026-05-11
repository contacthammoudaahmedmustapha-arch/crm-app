const mysql = require('mysql2/promise');
let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:     process.env.AIVEN_HOST,
      port:     parseInt(process.env.AIVEN_PORT || '3306'),
      user:     process.env.AIVEN_USER,
      password: process.env.AIVEN_PASSWORD,
      database: process.env.AIVEN_DATABASE,
      ssl:      { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });
  }
  return pool;
}
module.exports = { getPool };