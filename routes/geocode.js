// File: routes/geocode.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Dapatkan SerpAPI Key dari environment variables
const SERPAPI_API_KEY = process.env.SERPAPI_KEY;
const SERPAPI_URL = 'https://serpapi.com/search';

/**
 * API endpoint untuk mengkonversi alamat/nama lokasi menjadi koordinat latitude/longitude
 * Menggunakan SerpAPI dengan Google Maps engine
 */
router.get('/', async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ message: 'Parameter address diperlukan' });
  }

  try {
    // Gunakan SerpAPI dengan engine Google Maps untuk mendapatkan data lokasi
    const response = await axios.get(SERPAPI_URL, {
      params: {
        engine: 'google_maps',
        q: address,
        type: 'search',
        hl: 'id',
        gl: 'ID',
        api_key: SERPAPI_API_KEY
      }
    });

    // Ekstrak data lokasi dari respons
    if (response.data.search_metadata && response.data.search_parameters) {
      // SerpAPI biasanya menyertakan data lokasi dalam bentuk 'll' pada search_parameters
      // Format: @lat,lng,zoom
      const locationString = response.data.search_parameters.ll || '';
      const matches = locationString.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      
      if (matches && matches.length >= 3) {
        const lat = parseFloat(matches[1]);
        const lng = parseFloat(matches[2]);
        
        const geocodeResult = {
          results: [{
            formatted_address: address,
            geometry: {
              location: { lat, lng }
            }
          }],
          status: 'OK'
        };
        
        console.log(`✅ Geocoding untuk "${address}": ${lat}, ${lng}`);
        res.json(geocodeResult);
      } else {
        // Jika tidak ada data lokasi yang jelas, coba ekstrak dari local_results pertama jika ada
        if (response.data.local_results && response.data.local_results.length > 0) {
          const firstResult = response.data.local_results[0];
          // Coba ekstrak data geo jika tersedia
          if (firstResult.gps_coordinates) {
            const { latitude, longitude } = firstResult.gps_coordinates;
            
            const geocodeResult = {
              results: [{
                formatted_address: firstResult.title || address,
                geometry: {
                  location: { lat: latitude, lng: longitude }
                }
              }],
              status: 'OK'
            };
            
            console.log(`✅ Geocoding untuk "${address}" dari local_results: ${latitude}, ${longitude}`);
            res.json(geocodeResult);
            return;
          }
        }
        
        console.warn('Geocoding tidak menemukan hasil untuk:', address);
        res.status(404).json({ 
          message: 'Lokasi tidak ditemukan', 
          status: 'ZERO_RESULTS' 
        });
      }
    } else {
      console.warn('Respon SerpAPI tidak sesuai format yang diharapkan');
      res.status(404).json({ 
        message: 'Format respons tidak valid', 
        status: 'INVALID_RESPONSE' 
      });
    }
  } catch (error) {
    console.error('Error dalam /api/geocode:', error);

    // Berikan respon error yang lebih detail
    res.status(500).json({ 
      message: 'Gagal mengkonversi alamat menjadi koordinat', 
      error: error.message,
      details: error.response?.data || 'Tidak ada detail tambahan'
    });
  }
});

module.exports = router;