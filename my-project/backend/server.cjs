// backend/server.cjs
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// One-time initialization (tables, admin user)
try { require('./init.cjs'); } catch (e) { console.warn('Init script error:', e.message); }

const app = express();
const PORT = process.env.PORT || 5000;

// Core middleware
app.use(express.json());
// allow reading non-file fields in multipart/form-data
app.use(express.urlencoded({ extended: true }));

// CORS for Vite dev/preview on localhost/127.0.0.1 and common ports
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'http://localhost:4173', // vite preview
  'http://127.0.0.1:4173',
]);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow non-browser clients
    if (allowedOrigins.has(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));
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
try { app.use('/api/pet_food', require('./routes/petFoodRoutes.cjs')); }
catch (e) { console.error('Failed to mount /api/pet_food:', e); }
try { app.use('/api/auth', require('./routes/authRoutes.cjs')); }
catch (e) { console.error('Failed to mount /api/auth:', e); }
try { app.use('/api/cart', require('./routes/cartRoutes.cjs')); }
catch (e) { console.error('Failed to mount /api/cart:', e); }
try { app.use('/api/admin', require('./routes/adminPetRoutes.cjs')); }
catch (e) { console.error('Failed to mount /api/admin:', e); }
try { app.use('/api/donations', require('./routes/donationRoutes.cjs')); }
catch (e) { console.error('Failed to mount /api/donations:', e); }

// Mount pets routes BEFORE the generic /api 404 catch-all
app.use('/api/pets', petRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
// Optional: route check for debugging missing endpoints
app.use('/api', (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  // If no previous route handled it and path starts with /api, give a clearer 404
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});

// Centralized error handler (last)
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
