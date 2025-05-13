// routes/weather.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

// Ramalan cuaca
router.get('/', async (req, res) => {
  const { lat, lon, date } = req.query;
  try {
    const response = await axios.get(OPEN_METEO_BASE, {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: 'temperature_2m,weathercode',
        start_date: date,
        end_date: date,
        timezone: 'auto'
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil cuaca', error: error.message });
  }
});

module.exports = router;
