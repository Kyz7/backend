// routes/estimate.js
const express = require('express');
const estimateService = require('../services/estimateService');
const flightService = require('../services/flightService');
const weatherService = require('../services/weatherService');
const calculateDistance = require('../utils/calculateDistance');
const router = express.Router();

router.post('/', async (req, res) => {
  const { pricePerDay, startDate, endDate, flightCost, lat1, lon1, lat2, lon2 } = req.body;

  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  const estimation = estimateService.calculateEstimation(pricePerDay, startDate, endDate, flightCost);
  const weather = await weatherService.getWeatherForecast(lat2, lon2, startDate);

  res.json({
    distance,
    estimation,
    weather
  });
});

module.exports = router;
