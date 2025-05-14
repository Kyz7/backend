const express = require('express');
const router = express.Router();
const { getPlacesData } = require('../services/placesService');

router.get('/', async (req, res) => {
  const { lat, lon, query } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: 'Missing lat or lon parameter' });
  }

  try {
    const places = await getPlacesData(lat.trim(), lon.trim(), query || '');
    res.json({ places });
  } catch (error) {
    console.error('Error in /api/places:', error);
    res.status(500).json({ message: 'Gagal mengambil tempat wisata', error: error.message });
  }
});

module.exports = router;