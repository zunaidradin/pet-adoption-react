require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const pool = require('./config/db.cjs');

const app = express();

// Allow JSON (for optional JSON route below)
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Serve uploaded images
app.use('/uploads', express.static(uploadsDir));

// Multer storage (keeps original extension)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, `pet-${unique}${ext}`);
  },
});
const upload = multer({ storage });

// INSERT with photo (field name MUST be "image")
app.post('/api/pets', upload.single('image'), async (req, res) => {
  try {
    const { name, animalType, breed, age, status } = req.body;

    // minimal validation
    if (!name || !animalType || !breed || !age || !status) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const db = pool.promise();
    const [result] = await db.execute(
      'INSERT INTO pets (name, animalType, breed, age, status, image) VALUES (?,?,?,?,?,?)',
      [name, animalType, breed, age, status, imagePath]
    );

    res.status(201).json({
      id: result.insertId,
      name, animalType, breed, age, status,
      image: imagePath,
      message: 'Pet added.',
    });
  } catch (err) {
    console.error('POST /api/pets failed:', err);
    res.status(500).json({ error: 'Server failed to add pet.' });
  }
});

// (Optional) DB-only route with no file upload — great for quick sanity tests
app.post('/api/pets-json', async (req, res) => {
  try {
    const { name, animalType, breed, age, status } = req.body || {};
    if (!name || !animalType || !breed || !age || !status) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const image = '/images/dog-image.jpg'; // placeholder
    const db = pool.promise();
    const [result] = await db.execute(
      'INSERT INTO pets (name, animalType, breed, age, status, image) VALUES (?,?,?,?,?,?)',
      [name, animalType, breed, age, status, image]
    );
    res.status(201).json({ id: result.insertId, name, animalType, breed, age, status, image });
  } catch (err) {
    console.error('POST /api/pets-json failed:', err);
    res.status(500).json({ error: 'Server failed to add pet.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ API up on http://localhost:${PORT}`));
