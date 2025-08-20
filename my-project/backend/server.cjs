// backend/server.cjs
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- core middleware
app.use(express.json());

// allow frontend to send/receive cookies
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());

// --- routes
const petRoutes = require('./routes/petRoutes.cjs');
const petFoodRoutes = require('./routes/petFoodRoutes.cjs');

// auth + cart use cookies/JWT
const authRoutes = require('./routes/authRoutes.cjs');     // <-- you created this earlier
const cartRoutes = require('./routes/cartRoutes.cjs');     // <-- uses auth middleware inside

// optional: reviews if you added them earlier
// const reviewRoutes = require('./routes/reviewRoutes.cjs');

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/pets', petRoutes);
app.use('/api/pet_food', petFoodRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);

// app.use('/api/reviews', reviewRoutes);

// --- boot
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
