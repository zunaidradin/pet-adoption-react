// backend/init.cjs
// Ensures auxiliary tables and admin bootstrap user exist.
const bcrypt = require('bcrypt');
const db = require('./config/db.cjs');

function ensurePendingPetsTable() {
  const sql = `CREATE TABLE IF NOT EXISTS pending_pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    animalType VARCHAR(50) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    age VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL,
    description TEXT,
    image VARCHAR(255) NOT NULL,
    submitted_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  db.query(sql, (err) => {
    if (err) console.error('❌ pending_pets table ensure failed:', err.message);
    else console.log('✅ pending_pets table ready');
  });
}

function ensureNotificationsTable() {
  const sql = `CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pet_id INT NULL,
    message VARCHAR(255) NOT NULL,
    status ENUM('approved','rejected') NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX(user_id), INDEX(is_read)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  db.query(sql, (err) => {
    if (err) console.error('❌ notifications table ensure failed:', err.message);
    else console.log('✅ notifications table ready');
  });
}

async function ensureAdminUser() {
  const username = 'admin';
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin';
  db.query('SELECT id, is_admin FROM users WHERE username=? LIMIT 1', [username], async (err, rows) => {
    if (err) return console.error('❌ Admin lookup failed:', err.message);
    if (!rows.length) {
      try {
        const hash = await bcrypt.hash(defaultPassword, 10);
        db.query('INSERT INTO users (username, email, password_hash, is_admin) VALUES (?,?,?,1)', [username, 'admin@example.com', hash], (err2) => {
          if (err2) return console.error('❌ Admin create failed:', err2.message);
          console.log('✅ Admin user created (change the password ASAP)');
        });
      } catch (e) {
        console.error('❌ Admin hash failed:', e.message);
      }
    } else if (!rows[0].is_admin) {
      db.query('UPDATE users SET is_admin=1 WHERE id=?', [rows[0].id], (err3) => {
        if (err3) console.error('❌ Failed to elevate admin user:', err3.message);
        else console.log('✅ Existing admin user elevated');
      });
    } else {
      console.log('✅ Admin user already present');
    }
  });
}

function runInit() {
  ensurePendingPetsTable();
  ensureNotificationsTable();
  ensureAdminUser();
}

runInit();

module.exports = {}; // noop export