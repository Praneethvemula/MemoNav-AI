require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { seedUserData } = require('./utils/seedData');

// Route handlers
const authRoutes = require('./routes/authRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const journeyRoutes = require('./routes/journeyRoutes');
const preferenceRoutes = require('./routes/preferenceRoutes');
const savedPlaceRoutes = require('./routes/savedPlaceRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const aiRoutes = require('./routes/aiRoutes');
const navigationRoutes = require('./routes/navigationRoutes');
const visionRoutes = require('./routes/visionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-user']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'MemoNav AI',
    tagline: 'Remember the Journey. Learn the User. Guide Better.',
    timestamp: new Date()
  });
});

// Seed demo data route for hackathon judging convenience
app.post('/api/demo/seed', async (req, res) => {
  try {
    const demoUserId = req.body.userId || 'demo_user_123';
    await seedUserData(demoUserId);
    res.json({ success: true, message: 'Demo data successfully seeded for MemoNav AI' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/journeys', journeyRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/places', savedPlaceRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/vision', visionRoutes);

// Serve static frontend in production if built
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

// Connect DB and Start Server
async function startServer() {
  await connectDB();

  // Initialize demo user seed data
  await seedUserData('demo_user_123');

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 MEMONAV AI SERVER RUNNING ON PORT ${PORT}`);
    console.log(`   Remember the Journey. Learn the User. Guide Better.`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

startServer();

module.exports = app;
