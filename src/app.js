import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import vitalsRoutes from './routes/vitalsRoutes.js';
import timelineRoutes from './routes/timelineRoutes.js';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();

// ============ MIDDLEWARE ============
// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [
  'https://health-mate-frontend-five.vercel.app',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Static files (for uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============ ROUTES ============
// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'HealthMate API is running 🚀',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      files: '/api/files',
      ai: '/api/ai',
      vitals: '/api/vitals',
      timeline: '/api/timeline',
    },
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/timeline', timelineRoutes);

// ============ ERROR HANDLING ============
// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;