require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('./config/db');
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

app.use(cors({
  origin: 'http://localhost:3001'
}));

app.use(express.urlencoded({ extended: false }));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "blob:", "https://*.tile.openstreetmap.org"],
    },
  },
}));
app.use(morgan('dev'));

connectDB();
app.use(express.json());

app.use('/api/geocode', geocodeRoutes); 
app.use('/auth', authRoutes);
app.use('/plans', planRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/estimate', estimateRoutes);
app.use('/api/flight', flightRoutes);
app.use('/api/weather', weatherRoutes);
if (detailsRoutes) {
  app.use('/api/details', detailsRoutes);
}

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Server Error', 
    error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Smart Travel Planner backend is running on port ${PORT}`);
});