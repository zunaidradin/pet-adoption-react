const express = require('express');
const db = require('../config/db.cjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth.cjs');
const isAdmin = require('../middleware/isAdmin.cjs');

const router = express.Router();

// POST /api/donations - create a donation (anonymous allowed)
router.post('/', (req, res) => {
  // try optional user from cookie if present
  let userId = null;
  const token = req.cookies?.token;
  if (token) {
    try { const payload = jwt.verify(token, process.env.JWT_SECRET); userId = payload.userId; } catch { /* ignore */ }
  }
  const { amount, animalType, method, note, walletNumber, trxId, cardNumber, donorName, donorEmail } = req.body || {};
  const amt = Number(amount);
  if (!amt || amt <= 0) return res.status(400).json({ error: 'Invalid amount' });
  if (amt > 10000) return res.status(400).json({ error: 'Maximum donation is 10000 BDT' });
  if (!['card','bkash','nagad'].includes(method)) return res.status(400).json({ error: 'Invalid method' });
  const card_last4 = method === 'card' && cardNumber ? String(cardNumber).replace(/\s+/g,'').slice(-4) : null;
  const sql = `INSERT INTO donations (user_id, donor_name, donor_email, amount, animalType, method, wallet_number, trx_id, card_last4, note)
               VALUES (?,?,?,?,?,?,?,?,?,?)`;
  const params = [userId, donorName||null, donorEmail||null, amt, animalType||null, method, walletNumber||null, trxId||null, card_last4, note||null];
  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.status(201).json({ id: result.insertId, ok: true });
  });
});

// GET /api/donations/me - my donations
router.get('/me', auth, (req, res) => {
  const userId = req.user.id;
  db.query('SELECT * FROM donations WHERE user_id=? ORDER BY id DESC', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

// Admin aggregates
router.get('/stats', isAdmin, (_req, res) => {
  const sql = `SELECT COUNT(*) AS count, COALESCE(SUM(amount),0) AS total FROM donations`;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows[0] || { count: 0, total: 0 });
  });
});

router.get('/', isAdmin, (_req, res) => {
  db.query('SELECT * FROM donations ORDER BY id DESC LIMIT 200', (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

module.exports = router;
