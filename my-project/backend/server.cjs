// backend/server.cjs
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Core middleware
app.use(express.json());
// allow reading non-file fields in multipart/form-data
app.use(express.urlencoded({ extended: true }));

// CORS for the Vite dev server
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());

// Serve uploaded images (public/uploads -> /uploads/*)
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'public', 'uploads'), {
    fallthrough: true,
  })
);

// Routes
const petRoutes = require('./routes/petRoutes.cjs');
try { app.use('/api/pet_food', require('./routes/petFoodRoutes.cjs')); } catch {}
try { app.use('/api/auth', require('./routes/authRoutes.cjs')); } catch {}
try { app.use('/api/cart', require('./routes/cartRoutes.cjs')); } catch {}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/pets', petRoutes);

// Centralized error handler (last)
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
