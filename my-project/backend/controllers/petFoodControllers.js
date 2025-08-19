const db = require('../config/db');

exports.getAllPetFood = (req, res) => {
  db.query('SELECT * FROM pet_food', (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(200).json(results);
  });
};