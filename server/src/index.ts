import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
// @ts-ignore
import xss from 'xss-clean';

// Import Routes
import authRoutes from './routes/authRoutes';
import coursesRoutes from './routes/coursesRoutes';
import blogsRoutes from './routes/blogsRoutes';
import eventsRoutes from './routes/eventsRoutes';
import notificationsRoutes from './routes/notificationsRoutes';
import latestupdatesRoutes from './routes/latestupdatesRoutes';
import gallerysRoutes from './routes/gallerysRoutes';
import studymaterialsRoutes from './routes/studymaterialsRoutes';
import testimonialsRoutes from './routes/testimonialsRoutes';
import facultysRoutes from './routes/facultysRoutes';
import heroslidersRoutes from './routes/heroslidersRoutes';
import homeRoutes from './routes/homeRoutes';

import path from 'path';
import uploadRoutes from './routes/uploadRoutes';

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow images to be loaded cross-origin
}));
app.use(cors());

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate Limiting
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' })); // Limit body payload

app.use(morgan('dev'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/courses', coursesRoutes);
app.use('/api/v1/blogs', blogsRoutes);
app.use('/api/v1/events', eventsRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/latestupdates', latestupdatesRoutes);
app.use('/api/v1/gallerys', gallerysRoutes);
app.use('/api/v1/studymaterials', studymaterialsRoutes);
app.use('/api/v1/testimonials', testimonialsRoutes);
app.use('/api/v1/facultys', facultysRoutes);
app.use('/api/v1/herosliders', heroslidersRoutes);
app.use('/api/v1/home', homeRoutes);

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({ status: 'fail', message: `Can't find ${req.originalUrl} on this server!` });
});

// Start Server
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/judicial-study';

mongoose.connect(DB_URI)
  .then((conn) => {
    console.log(`DB Connection Successful! Connected to: ${conn.connection.host}`);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('DB Connection Error:', err.message);
    process.exit(1);
  });
