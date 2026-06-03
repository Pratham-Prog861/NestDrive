import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import { searchDrive } from './controllers/imageController.js';
import auth from './middleware/auth.js';

// Load environment variables
dotenv.config({ override: true });

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/images', imageRoutes);
app.get('/api/search', auth, searchDrive); // Global search route

// Default fallback route for checking API health
app.get('/', (req, res) => {
  res.json({ message: 'NestDrive API is running successfully.' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  
  // Handle Multer file size errors gracefully
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File is too large. Max size allowed is 10MB.' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
