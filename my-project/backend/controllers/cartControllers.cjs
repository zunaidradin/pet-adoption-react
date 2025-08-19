const db = require('../config/db');

// Get cart items for a user
exports.getCartItems = (req, res) => {
    const userId = req.query.userId;
    const query = 'SELECT * FROM cart WHERE user_id = ?';
    
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching cart:', err);
            return res.status(500).json({ message: err.message });
        }
        res.status(200).json(results);
    });
};

// Add item to cart
exports.addToCart = (req, res) => {
    const { userId, productId, productType, price } = req.body;
    const query = 'INSERT INTO cart (user_id, product_id, product_type, price) VALUES (?, ?, ?, ?)';
    
    db.query(query, [userId, productId, productType, price], (err, result) => {
        if (err) {
            console.error('Error adding to cart:', err);
            return res.status(500).json({ message: err.message });
        }
        res.status(201).json({ id: result.insertId, message: 'Added to cart' });
    });
};

// Remove item from cart
exports.removeFromCart = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM cart WHERE id = ?';
    
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error removing from cart:', err);
            return res.status(500).json({ message: err.message });
        }
        res.status(200).json({ message: 'Removed from cart' });
    });
};
