require('dotenv').config();
const express = require('express');
const http = require('http');
const app = express();

// Increase header size limits
http.globalAgent.maxHeaderSize = 16384; // 16KB instead of default 8KB
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plans');
const placeRoutes = require('./routes/places');
const estimateRoutes = require('./routes/estimate');
const flightRoutes = require('./routes/flight');
const weatherRoutes = require('./routes/weather');
const detailsRoutes = require('./routes/details');
const geocodeRoutes = require('./routes/geocode');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    // Izinkan localhost:3000 (frontend) dan localhost:3001 (jika perlu)
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parsing middleware (HANYA SATU KALI)
app.use(express.json({ 
  limit: '10mb',
  parameterLimit: 50000 
}));

app.use(express.urlencoded({ 
  limit: '10mb', 
  extended: true,
  parameterLimit: 50000 
}));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "blob:", "https://*.tile.openstreetmap.org"],
    },
  },
}));

// Logging middleware
app.use(morgan('dev'));

// Request logging untuk debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers size:', JSON.stringify(req.headers).length);
  next();
});

// Routes - KONSISTEN DENGAN FRONTEND
app.use('/api/geocode', geocodeRoutes); 
app.use('/api/auth', authRoutes); // UBAH dari /auth ke /api/auth
app.use('/api/plans', planRoutes); // UBAH dari /plans ke /api/plans
app.use('/api/places', placeRoutes);
app.use('/api/estimate', estimateRoutes);
app.use('/api/flight', flightRoutes);
app.use('/api/weather', weatherRoutes);

if (detailsRoutes) {
  app.use('/api/details', detailsRoutes);
}

// Static files untuk production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Handle request header too large
  if (err.code === 'HPE_HEADER_OVERFLOW') {
    return res.status(431).json({ 
      error: 'Request header fields too large. Please clear your cookies and try again.' 
    });
  }
  
  // Handle other errors
  res.status(err.status || 500).json({ 
    success: false, 
    message: 'Server Error', 
    error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message 
  });
});

// Start server function
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Sync models (create tables)
    await sequelize.sync({ force: false }); // Set true untuk drop tables
    console.log('Database synced');
    
    // Create HTTP server with increased limits
    const PORT = process.env.PORT || 3001;
    const server = http.createServer(app);
    
    // Set server timeout and header limits
    server.headersTimeout = 60000; // 60 seconds
    server.requestTimeout = 60000; // 60 seconds
    server.maxHeadersCount = 2000; // Increase max headers count
    
    server.listen(PORT, () => {
      console.log(`Smart Travel Planner backend is running on port ${PORT}`);
      console.log('Server limits:');
      console.log('- Headers timeout:', server.headersTimeout);
      console.log('- Request timeout:', server.requestTimeout);
      console.log('- Max headers count:', server.maxHeadersCount);
    });
    
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start the server
startServer();