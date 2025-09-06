const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const isAdmin = require('../middleware/isAdmin.cjs');
const db = require('../config/db.cjs');
const router = express.Router();
const petFoodController = require('../controllers/petFoodControllers.cjs');

router.get('/', petFoodController.getAllPetFood);

// Upload setup (reuse uploads folder)
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, uploadsDir),
	filename: (_req, file, cb) => {
		const safe = file.originalname.replace(/\s+/g,'_').replace(/[^\w.\-]/g,'');
		const ext = path.extname(safe);
		const base = ext ? safe.slice(0, -ext.length) : safe;
		cb(null, `${Date.now()}-${base}${ext}`);
	}
});
const fileFilter = (_req, file, cb) => cb(/^image\//.test(file.mimetype) ? null : new Error('Only image files'), /^image\//.test(file.mimetype));
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/pet_food (admin only) multipart/form-data: fields name, price, expiry_date (YYYY-MM-DD), image file in "image"
function ensureColumns(cb) {
	// Ensure 'stock' and 'expiry_date' columns exist
	db.query("SHOW COLUMNS FROM pet_food LIKE 'stock'", (e1, r1) => {
		const addStock = (!e1 && r1.length === 0);
		const doAddStock = addStock ? (next) => db.query('ALTER TABLE pet_food ADD COLUMN stock INT NOT NULL DEFAULT 0 AFTER image', next) : (next) => next();
		db.query("SHOW COLUMNS FROM pet_food LIKE 'expiry_date'", (e2, r2) => {
			const addExp = (!e2 && r2.length === 0);
			const doAddExp = addExp ? (next) => db.query('ALTER TABLE pet_food ADD COLUMN expiry_date DATE NULL AFTER stock', next) : (next) => next();
			doAddStock((errA) => {
				if (errA) return cb(errA);
				doAddExp((errB) => cb(errB));
			});
		});
	});
}

router.post('/', isAdmin, upload.single('image'), (req, res) => {
	const { name, price, expiry_date, stock } = req.body || {};
	if (!name || !price || !req.file) return res.status(400).json({ error: 'name, price, image are required' });
	const imagePath = `/uploads/${req.file.filename}`;
	const p = Number(price);
	if (!Number.isFinite(p) || p < 0) return res.status(400).json({ error: 'Invalid price' });
	const s = stock === undefined ? 0 : Math.max(0, Math.min(20, parseInt(stock, 10) || 0));
	const insertBase = 'INSERT INTO pet_food (name, price, image, stock, expiry_date) VALUES (?,?,?,?,?)';
	const insertWithType = 'INSERT INTO pet_food (name, animalType, price, image, stock, expiry_date) VALUES (?,?,?,?,?,?)';
	const animalType = (req.body?.animalType && String(req.body.animalType).trim()) || 'Other';

	// Ensure new columns exist first, then check legacy schema for animalType
	ensureColumns((alterErr) => {
		if (alterErr) return res.status(500).json({ error: alterErr.message || 'Migration error' });
		db.query("SHOW COLUMNS FROM pet_food LIKE 'animalType'", (e3, r3) => {
			const hasType = !e3 && r3.length > 0;
			const sql = hasType ? insertWithType : insertBase;
			const params = hasType
				? [String(name).trim(), animalType, p, imagePath, s, expiry_date || null]
				: [String(name).trim(), p, imagePath, s, expiry_date || null];
			db.query(sql, params, (err, result) => {
				if (err) return res.status(500).json({ error: err.sqlMessage || err.message || 'DB error' });
				res.status(201).json({ id: result.insertId, name, price: p, image: imagePath, stock: s, expiry_date: expiry_date || null, animalType: hasType ? animalType : undefined });
			});
		});
	});
});

// DELETE /api/pet_food/:id (admin)
router.delete('/:id', isAdmin, (req, res) => {
	const id = parseInt(req.params.id, 10);
	if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
	db.query('SELECT image FROM pet_food WHERE id = ?', [id], (e1, rows) => {
		if (e1) return res.status(500).json({ error: e1.message });
		if (!rows.length) return res.status(404).json({ error: 'Not found' });
		const imagePath = rows[0].image;
		db.query('DELETE FROM pet_food WHERE id = ?', [id], (e2, result) => {
			if (e2) return res.status(500).json({ error: e2.message });
			// Best-effort delete file if under uploads
			try {
				if (imagePath && imagePath.startsWith('/uploads/')) {
					const fpath = path.join(uploadsDir, path.basename(imagePath));
					fs.unlink(fpath, ()=>{});
				}
			} catch {}
			res.json({ ok: true, deleted: result.affectedRows });
		});
	});
});

module.exports = router;
