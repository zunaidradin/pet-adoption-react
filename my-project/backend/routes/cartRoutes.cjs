const express = require('express');
const { getCart, addItem, removeItem } = require('../controllers/cartControllers.cjs');

const router = express.Router();

router.get('/', getCart);            // GET /api/cart?userId=123
router.post('/', addItem);           // POST /api/cart
router.delete('/:id', removeItem);   // DELETE /api/cart/55?userId=123 (or body userId)

module.exports = router;
