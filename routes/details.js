// routes/details.js
const express = require('express');
const router = express.Router();
const { getPlacesData } = require('../services/placesService');

/**
 * @route GET /api/details/:id
 * @description Get place details by ID
 * @param {string} id - Place ID
 * @returns {Object} Place details
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // For a real app, you would fetch real data from a database
    // For now, create a dummy place as a placeholder
    const dummyPlace = {
      id,
      title: `Tempat Wisata ${id}`,
      address: 'Jl. Contoh No. 123, Kota Wisata',
      location: {
        lat: -6.2088,
        lng: 106.8456
      },
      rating: 4.5,
      description: 'Tempat wisata yang indah dengan pemandangan alam yang menakjubkan. ' +
        'Lokasi ini terkenal dengan keindahan alamnya yang masih asri dan terjaga dengan baik. ' +
        'Pengunjung dapat menikmati berbagai aktivitas outdoor seperti hiking, piknik, dan fotografi.',
      price: 150000,
      thumbnail: 'https://via.placeholder.com/800x400',
      reviews: [
        { user: 'John Doe', rating: 5, comment: 'Tempat yang sangat indah!' },
        { user: 'Jane Smith', rating: 4, comment: 'Pemandangan bagus, tapi agak ramai' },
        { user: 'Ahmad', rating: 5, comment: 'Suasana yang tenang, cocok untuk liburan keluarga' }
      ],
      facilities: ['Parkir', 'Toilet', 'Warung Makan', 'Tempat Istirahat']
    };
    
    res.json({
      success: true,
      data: dummyPlace
    });
  } catch (error) {
    console.error('Place details route error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mendapatkan detail tempat',
      error: error.message 
    });
  }
});

/**
 * @route GET /api/details/search
 * @description Search places by query
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} query - Search query (optional)
 * @param {string} location - Location name (optional)
 * @returns {Array} Search results
 */
router.get('/search', async (req, res) => {
  const { lat, lon, query, location } = req.query;
  
  // Validate parameters
  if (!lat || !lon) {
    return res.status(400).json({ 
      success: false,
      message: 'Latitude dan longitude diperlukan'
    });
  }

  try {
    const places = await getPlacesData(lat, lon, query, location);
    
    res.json({
      success: true,
      data: places
    });
  } catch (error) {
    console.error('Places search route error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mencari tempat wisata', 
      error: error.message 
    });
  }
});

module.exports = router;