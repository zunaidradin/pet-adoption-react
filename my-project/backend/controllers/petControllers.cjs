const db = require('../config/db.cjs'); // Import the database connection

// Get all pets
exports.getAllPets = (req, res) => {
  const query = 'SELECT * FROM pets';  // Query to fetch all pets
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.status(200).json(results);  // Send the results as JSON response
  });
};

// Add a new pet
exports.addPet = (req, res) => {
  const { name, animalType, breed, age, status, image } = req.body; // Get data from request body
  const query = 'INSERT INTO pets (name, animalType, breed, age, status, image) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(query, [name, animalType, breed, age, status, image], (err, result) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.status(201).json({ id: result.insertId, name });  // Return the new pet's ID and name
  });
};
