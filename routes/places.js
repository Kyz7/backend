const express = require('express');
const router = express.Router();
const { getPlacesData } = require('../services/placesService');

router.get('/', async (req, res) => {
  const { lat, lon, query, page = 1, limit = 9 } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: 'Missing lat or lon parameter' });
  }

  // Validate pagination parameters
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
    return res.status(400).json({ 
      message: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1-50' 
    });
  }

  try {
    const result = await getPlacesData(
      lat.trim(), 
      lon.trim(), 
      query || '', 
      pageNum, 
      limitNum
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error in /api/places:', error);
    res.status(500).json({ message: 'Gagal mengambil tempat wisata', error: error.message });
  }
});

module.exports = router;