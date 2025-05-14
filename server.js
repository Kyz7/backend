require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const planRoutes = require('./routes/plans');
const placeRoutes = require('./routes/places');
const estimateRoutes = require('./routes/estimate');
const weatherRoutes = require('./routes/weather');
const flightRoutes = require('./routes/flight');
const cors = require('cors');

// Enable CORS for your frontend origin
app.use(cors({
  origin: 'http://localhost:3001' // Your frontend URL
}));

connectDB();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/plans', planRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/estimate', estimateRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/flight', flightRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Smart Travel Planner backend is running on port ${PORT}`);
});