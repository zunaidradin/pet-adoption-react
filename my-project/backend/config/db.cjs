// backend/config/db.cjs
const mysql = require('mysql2');

// Read from .env (already loaded by server.cjs)
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'pet_adoption',
  connectionLimit: 10,
  connectTimeout: 10000,
  waitForConnections: true,
  queueLimit: 0,
});

// Optional: quick sanity check
pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
  } else {
    console.log('✅ MySQL pool ready');
    conn.release();
  }
});

module.exports = pool; // use: pool.query(sql, params, cb)
