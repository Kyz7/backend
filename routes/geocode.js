// File: routes/geocode.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get SerpAPI Key from environment variables
const SERPAPI_API_KEY = process.env.SERPAPI_KEY;
const SERPAPI_URL = 'https://serpapi.com/search';

/**
 * API endpoint to convert address/location name to latitude/longitude coordinates
 * Using SerpAPI with Google Maps engine
 */
router.get('/', async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ message: 'Parameter address diperlukan' });
  }

  // Validate API key exists
  if (!SERPAPI_API_KEY) {
    console.error('SERPAPI_KEY is not defined in environment variables');
    return res.status(500).json({ 
      message: 'Server configuration error: API key not found',
      status: 'CONFIGURATION_ERROR'
    });
  }

  try {
    console.log(`🔍 Attempting geocoding for: "${address}"`);
    
    // Use SerpAPI with Google Maps engine to get location data
    const response = await axios.get(SERPAPI_URL, {
      params: {
        engine: 'google_maps',
        q: address,
        type: 'search',
        hl: 'id',
        gl: 'ID',
        api_key: SERPAPI_API_KEY
      },
      // Add timeout to prevent hanging requests
      timeout: 10000
    });

    // Verify we got a valid response
    if (!response.data) {
      throw new Error('Empty response from SerpAPI');
    }

    // Extract location data from response
    if (response.data.search_metadata && response.data.search_parameters) {
      // First attempt: Look for coordinates in 'data_locations' if available
      if (response.data.data_locations && response.data.data_locations.length > 0) {
        for (const location of response.data.data_locations) {
          if (location && location.latitude && location.longitude) {
            const lat = parseFloat(location.latitude);
            const lng = parseFloat(location.longitude);
            
            const geocodeResult = {
              results: [{
                formatted_address: address,
                geometry: {
                  location: { lat, lng }
                }
              }],
              status: 'OK'
            };
            
            console.log(`✅ Geocoding for "${address}" from data_locations: ${lat}, ${lng}`);
            return res.json(geocodeResult);
          }
        }
      }
      
      // Second attempt: SerpAPI usually includes location data as 'll' in search_parameters
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
        
        console.log(`✅ Geocoding for "${address}": ${lat}, ${lng}`);
        return res.json(geocodeResult);
      } 
      
      // Third attempt: Try to extract from local_results if available
      if (response.data.local_results && response.data.local_results.length > 0) {
        // Try first result, then go through all results looking for gps_coordinates
        for (const result of response.data.local_results) {
          if (result.gps_coordinates) {
            const { latitude, longitude } = result.gps_coordinates;
            
            const geocodeResult = {
              results: [{
                formatted_address: result.title || address,
                geometry: {
                  location: { lat: latitude, lng: longitude }
                }
              }],
              status: 'OK'
            };
            
            console.log(`✅ Geocoding for "${address}" from local_results: ${latitude}, ${longitude}`);
            return res.json(geocodeResult);
          }
        }
      }
      
      // Fourth attempt: Try maps_results if available
      if (response.data.maps_results && response.data.maps_results.length > 0) {
        for (const result of response.data.maps_results) {
          if (result.gps_coordinates) {
            const { latitude, longitude } = result.gps_coordinates;
            
            const geocodeResult = {
              results: [{
                formatted_address: result.title || address,
                geometry: {
                  location: { lat: latitude, lng: longitude }
                }
              }],
              status: 'OK'
            };
            
            console.log(`✅ Geocoding for "${address}" from maps_results: ${latitude}, ${longitude}`);
            return res.json(geocodeResult);
          }
        }
      }
      
      // Fifth attempt: Try knowledge_graph as a last resort
      if (response.data.knowledge_graph && response.data.knowledge_graph.gps_coordinates) {
        const { latitude, longitude } = response.data.knowledge_graph.gps_coordinates;
        
        const geocodeResult = {
          results: [{
            formatted_address: response.data.knowledge_graph.title || address,
            geometry: {
              location: { lat: latitude, lng: longitude }
            }
          }],
          status: 'OK'
        };
        
        console.log(`✅ Geocoding for "${address}" from knowledge_graph: ${latitude}, ${longitude}`);
        return res.json(geocodeResult);
      }
      
      // Last attempt: If all else failed but we have search information, try to get coordinates from it
      if (response.data.search_information && response.data.search_information.location) {
        const locationInfo = response.data.search_information.location;
        if (locationInfo.coordinates && locationInfo.coordinates.latitude && locationInfo.coordinates.longitude) {
          const geocodeResult = {
            results: [{
              formatted_address: address,
              geometry: {
                location: { 
                  lat: locationInfo.coordinates.latitude, 
                  lng: locationInfo.coordinates.longitude 
                }
              }
            }],
            status: 'OK'
          };
          
          console.log(`✅ Geocoding for "${address}" from search_information: ${locationInfo.coordinates.latitude}, ${locationInfo.coordinates.longitude}`);
          return res.json(geocodeResult);
        }
      }
      
      // If we get here, no usable location was found
      // First, log the structure to help debugging
      console.log('Response structure keys:', Object.keys(response.data));
      
      if (response.data.search_parameters) {
        console.log('Search parameters:', response.data.search_parameters);
      }
      
      // Check if we at least got search metadata that indicates search was performed
      if (response.data.search_metadata && response.data.search_metadata.status === 'Success') {
        console.warn('Geocoding found no results for:', address);
        console.log('Query executed successfully but no coordinates found');
        
        return res.status(404).json({ 
          message: 'Lokasi tidak ditemukan. Coba masukkan nama lokasi yang lebih spesifik.', 
          status: 'ZERO_RESULTS',
          searchQuery: address
        });
      } else {
        console.warn('SerpAPI response does not match expected format');
        console.log('Received response:', JSON.stringify(response.data, null, 2));
        
        return res.status(404).json({ 
          message: 'Format respons tidak valid', 
          status: 'INVALID_RESPONSE' 
        });
      }
    } else {
      console.warn('SerpAPI response missing required metadata and parameters');
      console.log('Received response keys:', Object.keys(response.data));
      
      return res.status(404).json({ 
        message: 'Format respons tidak valid', 
        status: 'INVALID_RESPONSE' 
      });
    }
  } catch (error) {
    // Handle common errors
    console.error('Error in /api/geocode:', error);
    
    // Check for specific error types
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        message: 'Koneksi ke layanan geocoding timeout',
        error: error.message,
        status: 'TIMEOUT_ERROR'
      });
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('SerpAPI Error Response:', {
        status: error.response.status,
        data: error.response.data
      });
      
      // Check for specific error status codes
      if (error.response.status === 401 || error.response.status === 403) {
        return res.status(500).json({
          message: 'API key tidak valid atau kuota habis',
          status: 'AUTHENTICATION_ERROR'
        });
      }
      
      return res.status(error.response.status).json({ 
        message: 'Gagal mengkonversi alamat menjadi koordinat', 
        error: error.message,
        details: error.response.data || 'Tidak ada detail tambahan',
        status: error.response.status
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from SerpAPI');
      return res.status(503).json({ 
        message: 'Tidak ada respon dari layanan geocoding', 
        error: error.message,
        status: 'SERVICE_UNAVAILABLE'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      return res.status(500).json({ 
        message: 'Gagal mengkonversi alamat menjadi koordinat', 
        error: error.message,
        status: 'INTERNAL_ERROR'
      });
    }
  }
});

module.exports = router;