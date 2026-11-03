const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ---------------------------------------------------------------------------
// Cross-Origin Resource Sharing — explicit trusted origins only
//
// CLIENT_URL accepts a comma-separated list of origins, e.g.:
//   http://localhost:5173,http://localhost:5174,https://myapp.vercel.app
//
// The hardcoded DEV_ORIGINS guarantee localhost dev always works even if
// the environment variable is missing or misconfigured.
// ---------------------------------------------------------------------------
const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Merge dev origins + env origins, deduplicate
const ALLOWED_ORIGINS = [...new Set([...DEV_ORIGINS, ...envOrigins])];

// Log allowed origins once at startup for debugging
console.log('[CORS] Allowed origins:', ALLOWED_ORIGINS);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, Postman, same-origin SSR, server-to-server)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    console.warn(`[CORS] Blocked origin: ${origin}`);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // some legacy browsers choke on 204
};

// Handle OPTIONS preflight for all routes BEFORE any other middleware
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[API] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Master API Routes
app.use('/api', routes);

// 404 & Global Error Middleware
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
