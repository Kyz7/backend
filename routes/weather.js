// routes/weather.jsconst express = require('express');const router = express.Router();
const { getWeatherForecast } = require('../services/weatherService');

/**
 * @route
 * @description Get weather forecast for a specific location and date
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} date - Date in YYYY-MM-DD format (default: today)
 * @returns {Object} Weather forecast data
 */
router.get('/', async (req, res) => {
  const { lat, lon, date = new Date().toISOString().split('T')[0] } = req.query;

  // Validate parameters
  if (!lat || !lon) {
    return res.status(400).json({ 
      success: false,
      message: 'Latitude dan longitude diperlukan'
    });
  }

  try {
    const weatherData = await getWeatherForecast(lat, lon, date);
    
    res.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    console.error('Weather route error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Gagal mengambil data cuaca', 
      error: error.message 
    });
  }
});

module.exports = router;