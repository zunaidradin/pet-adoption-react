const jwt = require('jsonwebtoken');
const db = require('../config/db.cjs');

// Middleware: verifies JWT then checks users.is_admin flag
module.exports = function isAdmin(req, res, next) {
	try {
		const token = req.cookies?.token;
		if (!token) return res.status(401).json({ error: 'Not authenticated' });
		let payload;
		try { payload = jwt.verify(token, process.env.JWT_SECRET); } catch { return res.status(401).json({ error: 'Invalid token' }); }
		const userId = payload.userId;
		db.query('SELECT id, username, is_admin FROM users WHERE id=? LIMIT 1', [userId], (err, rows) => {
			if (err) return res.status(500).json({ error: 'DB error' });
			if (!rows.length) return res.status(401).json({ error: 'User missing' });
			const user = rows[0];
			if (!user.is_admin) return res.status(403).json({ error: 'Admin only' });
			req.user = { id: user.id, username: user.username, is_admin: !!user.is_admin };
			next();
		});
	} catch (e) {
		console.error('isAdmin middleware error', e);
		res.status(500).json({ error: 'Internal error' });
	}
};
