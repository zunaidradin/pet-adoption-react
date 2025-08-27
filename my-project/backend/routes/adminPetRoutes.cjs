const express = require('express');
const db = require('../config/db.cjs');
const jwt = require('jsonwebtoken');
const isAdmin = require('../middleware/isAdmin.cjs');

const router = express.Router();

// GET /api/admin/pending-pets
router.get('/pending-pets', isAdmin, (_req, res) => {
	db.query('SELECT * FROM pending_pets ORDER BY id DESC', (err, rows) => {
		if (err) return res.status(500).json({ error: 'DB error' });
		res.json(rows);
	});
});

// POST /api/admin/pending-pets/:id/approve
router.post('/pending-pets/:id/approve', isAdmin, (req, res) => {
	const { id } = req.params;
		db.query('SELECT * FROM pending_pets WHERE id=? LIMIT 1', [id], (err, rows) => {
		if (err) return res.status(500).json({ error: 'DB error' });
		if (!rows.length) return res.status(404).json({ error: 'Not found' });
		const p = rows[0];
		const insertSql = 'INSERT INTO pets (name, animalType, breed, age, status, description, image) VALUES (?,?,?,?,?,?,?)';
		db.query(insertSql, [p.name, p.animalType, p.breed, p.age, p.status, p.description, p.image], (err2, result) => {
			if (err2) return res.status(500).json({ error: 'Insert failed' });
				db.query('DELETE FROM pending_pets WHERE id=?', [id], () => {});
				if (p.submitted_by) {
					db.query('INSERT INTO notifications (user_id, pet_id, message, status) VALUES (?,?,?,?)', [p.submitted_by, result.insertId, 'Your pet submission has been approved.', 'approved'], ()=>{});
				}
			res.json({ approved: true, newId: result.insertId });
		});
	});
});

// POST /api/admin/pending-pets/:id/reject
router.post('/pending-pets/:id/reject', isAdmin, (req, res) => {
	const { id } = req.params;
		db.query('SELECT submitted_by FROM pending_pets WHERE id=? LIMIT 1', [id], (e, rows) => {
			const submittedBy = (!e && rows.length) ? rows[0].submitted_by : null;
			db.query('DELETE FROM pending_pets WHERE id=?', [id], (err, result) => {
		if (err) return res.status(500).json({ error: 'DB error' });
		if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
				if (submittedBy) {
					db.query('INSERT INTO notifications (user_id, pet_id, message, status) VALUES (?,?,?,?)', [submittedBy, id, 'Your pet submission has been rejected.', 'rejected'], ()=>{});
				}
		res.json({ rejected: true });
	});
		});
});

module.exports = router;
// Separate user notification endpoints (no admin restriction) could be placed in a different file; quick add here:
router.get('/me/notifications', (req, res) => {
	const token = req.cookies?.token;
	if (!token) return res.json([]);
	let userId = null;
	try { userId = jwt.verify(token, process.env.JWT_SECRET).userId; } catch { return res.json([]); }
	db.query('SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 50', [userId], (err, rows) => {
		if (err) return res.status(500).json({ error: 'DB error' });
		res.json(rows);
	});
});

router.post('/me/notifications/:id/read', (req, res) => {
	const token = req.cookies?.token;
	if (!token) return res.status(401).json({ error: 'Not auth' });
	let userId; try { userId = jwt.verify(token, process.env.JWT_SECRET).userId; } catch { return res.status(401).json({ error: 'Invalid token' }); }
	const { id } = req.params;
	db.query('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?', [id, userId], (err, result) => {
		if (err) return res.status(500).json({ error: 'DB error' });
		if (!result.affectedRows) return res.status(404).json({ error: 'Not found' });
		res.json({ ok: true });
	});
});
