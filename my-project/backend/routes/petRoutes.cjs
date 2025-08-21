// backend/routes/petRoutes.cjs
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// POST /api/pets  (multipart/form-data with "image")
router.post('/', upload.single('image'), (req, res) => {
  try {
    const { name, animalType, breed, age, status, description } = req.body;

    if (!name || !animalType || !breed || !age || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // path that the server will serve at GET /uploads/<filename>
    const imagePath = `/uploads/${req.file.filename}`;

    const sql = `
      INSERT INTO pets (name, animalType, breed, age, status, description, image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      String(name).trim(),
      animalType,
      String(breed).trim(),
      String(age).trim(),
      status,
      (description ?? '').trim(),
      imagePath,
    ];

    db.query(sql, params, (err, result) => {
      if (err) {
        console.error('Insert error:', err);
        return res.status(500).json({ error: 'Failed to insert pet' });
      }

      res.status(201).json({
        id: result.insertId,
        name,
        animalType,
        breed,
        age,
        status,
        description: (description ?? '').trim(),
        image: imagePath,
        message: 'Pet added successfully',
      });
    });
  } catch (e) {
    console.error('Unexpected error in POST /api/pets:', e);
    res.status(500).json({ error: 'Internal server error' });
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
