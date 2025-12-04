import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import shipmentRoutes from './routes/shipment.js';
import adminRoutes from './routes/admin.js';
import submissionRoutes from './routes/submissions.js';
import emailRoutes from './routes/email.js';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars - explicitly specify path for Docker compatibility
// Note: In Docker, env_file in docker-compose.yml should handle this, but we load .env as fallback
dotenv.config({ path: join(__dirname, '.env') });

// Log email configuration on startup (for debugging)
console.log('📧 Email Configuration Check:');
console.log('  SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
console.log('  SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
console.log('  SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
console.log('  SMTP_FROM:', process.env.SMTP_FROM || process.env.SMTP_USER || 'NOT SET');
console.log('  SMTP_PASS:', process.env.SMTP_PASS ? `Set (${process.env.SMTP_PASS.length} chars)` : 'NOT SET');
console.log('  PRICING_EMAIL:', process.env.PRICING_EMAIL || 'NOT SET');
console.log('');

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\nPlease create a .env file in the backend directory with the required variables.');
  console.error('You can copy backend/env.example as a template.\n');
  process.exit(1);
}

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shipment', shipmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/email', emailRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});



