const express = require('express');
const router = express.Router();
const { getPlacesData } = require('../services/placesService');

router.get('/', async (req, res) => {
  const { location } = req.query; // location = "-7.9778,112.6341"
  if (!location) return res.status(400).json({ message: 'Missing location parameter' });

  const [lat, lon] = location.split(',');

  try {
    const places = await getPlacesData(lat.trim(), lon.trim());
    res.json({ places });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil tempat wisata', error: error.message });
  }
});


module.exports = router;
