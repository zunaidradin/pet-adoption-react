const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const petRoutes = require('./routes/petRoutes');
const petFoodRoutes = require('./routes/petFoodRoutes');
const cartRoutes = require('./routes/cartRoutes');

dotenv.config();  // Load environment variables

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());  // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Allow Express to handle JSON requests

// Use the petRoutes for the /api/pets endpoint
app.use('/api/pets', petRoutes);
app.use('/api/pet_food', petFoodRoutes);
app.use('/api/cart', cartRoutes);

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});