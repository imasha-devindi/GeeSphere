const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const songsRoutes = require('./routes/songs');
const youtubeRoutes = require('./routes/youtube');
const userFeaturesRoutes = require('./routes/userFeatures');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & Body Parsing (increased limit to 200MB)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const songsDir = path.join(uploadsDir, 'songs');
const coversDir = path.join(uploadsDir, 'covers');

[uploadsDir, songsDir, coversDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songsRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/user', userFeaturesRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', app: 'GeeSphere API', time: new Date() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 GeeSphere Backend Server running on http://localhost:${PORT}`);
});
