const db = require('../config/db.cjs');

/**
 * GET /api/cart?userId=123
 * Returns this user's cart items.
 */
exports.getCart = (req, res) => {
  const userId = parseInt(req.query.userId, 10);
  if (!Number.isInteger(userId)) return res.status(400).json({ error: 'userId required' });

  const sql = `
    SELECT id, user_id, product_id, product_type, quantity, price, created_at
    FROM cart_items
    WHERE user_id = ?
    ORDER BY id DESC
  `;
  db.query(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

/**
 * POST /api/cart
 * { userId, productId, productType }  // price looked up server-side
 * Adds item to cart or increases quantity if it already exists.
 */
exports.addItem = (req, res) => {
  const { userId, productId, productType } = req.body;
  if (!userId || !productId || !productType) {
    return res.status(400).json({ error: 'userId, productId, productType required' });
  }

  // For now we only support pet_food; price comes from pet_food table
  if (productType !== 'pet_food') {
    return res.status(400).json({ error: 'Unsupported productType' });
  }

  // Look up price from DB to avoid trusting client
  const getPriceSql = `SELECT price FROM pet_food WHERE id = ?`;
  db.query(getPriceSql, [productId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    const price = rows[0].price;

    const insertSql = `
      INSERT INTO cart_items (user_id, product_id, product_type, quantity, price)
      VALUES (?, ?, ?, 1, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + 1
    `;
    db.query(insertSql, [userId, productId, productType, price], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      // Return updated cart
      const cartSql = `
        SELECT id, user_id, product_id, product_type, quantity, price, created_at
        FROM cart_items WHERE user_id = ? ORDER BY id DESC
      `;
      db.query(cartSql, [userId], (err3, rows2) => {
        if (err3) return res.status(500).json({ error: err3.message });
        res.json(rows2);
      });
    });
  });
};

/**
 * DELETE /api/cart/:id  (only deletes item that belongs to user)
 * Requires ?userId=123 or body { userId } for safety
 */
exports.removeItem = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const userId = parseInt(req.query.userId ?? req.body?.userId, 10);
  if (!Number.isInteger(id) || !Number.isInteger(userId)) {
    return res.status(400).json({ error: 'id and userId required' });
  }

  const delSql = `DELETE FROM cart_items WHERE id = ? AND user_id = ?`;
  db.query(delSql, [id, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
    // Return updated cart
    const cartSql = `
      SELECT id, user_id, product_id, product_type, quantity, price, created_at
      FROM cart_items WHERE user_id = ? ORDER BY id DESC
    `;
    db.query(cartSql, [userId], (err2, rows2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json(rows2);
    });
  });
};
