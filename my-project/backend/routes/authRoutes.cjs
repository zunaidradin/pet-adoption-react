const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db.cjs');

const router = express.Router();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',  // use 'none' + secure:true on HTTPS
  secure: false,    // set true in production w/ HTTPS
};

// SIGNUP  (POST /api/auth/signup)  body: {username, email, password}
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });

  const hash = await bcrypt.hash(password, 10);
  db.query(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, hash],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already registered' });
        return res.status(500).json({ error: err.message });
      }
      const userId = result.insertId;
      const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ id: userId, username, email });
    }
  );
});

// LOGIN  (POST /api/auth/login)  body: {identifier, password}  // identifier = email OR username
router.post('/login', (req, res) => {
  const identifier = req.body.identifier || req.body.email || req.body.username;
  const { password } = req.body || {};
  if (!identifier || !password) return res.status(400).json({ error: 'identifier and password required' });

  db.query(
    'SELECT id, username, email, password_hash FROM users WHERE email = ? OR username = ? LIMIT 1',
    [identifier, identifier],
    async (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

      const user = rows[0];
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ id: user.id, username: user.username, email: user.email });
    }
  );
});

// LOGOUT  (POST /api/auth/logout)
router.post('/logout', (req, res) => {
  res.clearCookie('token', COOKIE_OPTS);
  res.json({ ok: true });
});

// ME  (GET /api/auth/me)  -> returns {id, username, email} if logged in
router.get('/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.json(null);
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    db.query('SELECT id, username, email FROM users WHERE id=? LIMIT 1', [userId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!rows.length) return res.json(null);
      res.json(rows[0]);
    });
  } catch {
    res.json(null);
  }
});

module.exports = router;

