// backend/routes/petRoutes.cjs
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const db = require('../config/db.cjs'); // mysql2 pool

const router = express.Router();

// Ensure uploads dir exists: backend/public/uploads
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

// Multer storage + validation
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const base = file.originalname
      .replace(/\s+/g, '_')
      .replace(/[^\w.\-]/g, '');
    // Avoid duplicating extensions
    const ext = path.extname(base);
    const nameNoExt = ext ? base.slice(0, -ext.length) : base;
    cb(null, `${Date.now()}-${nameNoExt}${ext || ''}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = /^image\/(jpeg|png|webp|gif|bmp|svg\+xml)$/.test(file.mimetype);
  cb(ok ? null : new Error('Only image files are allowed'), ok);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// NOTE: We now treat public submission as PENDING unless admin user submits.
// Ensure a table exists in DB:
// CREATE TABLE IF NOT EXISTS pending_pets (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   name VARCHAR(100) NOT NULL,
//   animalType VARCHAR(50) NOT NULL,
//   breed VARCHAR(100) NOT NULL,
//   age VARCHAR(40) NOT NULL,
//   status VARCHAR(40) NOT NULL,
//   description TEXT,
//   image VARCHAR(255) NOT NULL,
//   submitted_by INT NULL,
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// POST /api/pets  (multipart/form-data with "image")
router.post('/', upload.single('image'), (req, res) => {
  const { name, animalType, breed, age, status, description } = req.body || {};
  if (!name || !animalType || !breed || !age || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Image is required' });
  }
  const imagePath = `/uploads/${req.file.filename}`;

  // Determine if requester is admin via JWT cookie
  const token = req.cookies?.token;
  let userId = null;
  let isAdminDirect = false;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      userId = payload.userId;
    } catch {}
  }
  const finalize = () => {
  const table = isAdminDirect ? 'pets' : 'pending_pets';
  const sql = `INSERT INTO ${table} (name, animalType, breed, age, status, description, image${userId ? ', submitted_by' : ''}) VALUES (?,?,?,?,?,?,?${userId ? ',?' : ''})`;
    const paramsBase = [String(name).trim(), animalType, String(breed).trim(), String(age).trim(), status, (description ?? '').trim(), imagePath];
    const params = userId ? [...paramsBase, userId] : paramsBase;
    db.query(sql, params, (err, result) => {
      if (err) {
        console.error('Insert error:', err);
        return res.status(500).json({ error: 'Failed to insert pet' });
      }
      // If pending, notify all admins of new submission
      if (!isAdminDirect) {
        db.query('SELECT id FROM users WHERE is_admin=1', (e, admins) => {
          if (!e && admins?.length) {
            const rows = admins.map(a => [a.id, null, 'A new pet submission is pending approval.', 'pending']);
            db.query('INSERT INTO notifications (user_id, pet_id, message, status) VALUES ?', [rows], ()=>{});
          }
        });
      }
      res.status(201).json({
        id: result.insertId,
        table,
        pending: !isAdminDirect,
        message: isAdminDirect ? 'Pet added' : 'Submission received and pending approval'
      });
    });
  };

  if (userId) {
    db.query('SELECT is_admin FROM users WHERE id=? LIMIT 1', [userId], (err, rows) => {
      if (!err && rows.length && rows[0].is_admin) isAdminDirect = true;
      finalize();
    });
  } else {
    finalize();
  }
});

// Quick list (helps verify UI)
router.get('/', (_req, res) => {
  db.query('SELECT * FROM pets ORDER BY id DESC', (err, rows) => {
    if (err) {
      console.error('Select error:', err);
      return res.status(500).json({ error: 'Failed to load pets' });
    }
    res.json(rows);
  });
});

module.exports = router;
