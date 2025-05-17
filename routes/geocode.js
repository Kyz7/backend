const express = require('express');
const router = express.Router();
const axios = require('axios');

const SERPAPI_API_KEY = process.env.SERPAPI_KEY;
const SERPAPI_URL = 'https://serpapi.com/search';

router.get('/', async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ message: 'Parameter address diperlukan' });
  }

  if (!SERPAPI_API_KEY) {
    console.error('SERPAPI_KEY is not defined in environment variables');
    return res.status(500).json({ 
      message: 'Server configuration error: API key not found',
      status: 'CONFIGURATION_ERROR'
    });
  }

  try {
    console.log(`🔍 Attempting geocoding for: "${address}"`);
    
    const response = await axios.get(SERPAPI_URL, {
      params: {
        engine: 'google_maps',
        q: address,
        type: 'search',
        hl: 'id',
        gl: 'ID',
        api_key: SERPAPI_API_KEY
      },
      timeout: 15000
    });

    if (!response.data) {
      throw new Error('Empty response from SerpAPI');
    }

    if (response.data.search_metadata && response.data.search_parameters) {
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
      
      if (response.data.local_results && response.data.local_results.length > 0) {
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
      
      if (response.data.place_results) {
        const placeResults = response.data.place_results;
        
        if (placeResults.gps_coordinates && 
            placeResults.gps_coordinates.latitude && 
            placeResults.gps_coordinates.longitude) {
          
          const { latitude, longitude } = placeResults.gps_coordinates;
          
          const geocodeResult = {
            results: [{
              formatted_address: placeResults.title || address,
              geometry: {
                location: { lat: latitude, lng: longitude }
              }
            }],
            status: 'OK'
          };
          
          console.log(`✅ Geocoding for "${address}" from place_results: ${latitude}, ${longitude}`);
          return res.json(geocodeResult);
        }
        
        if (placeResults.data && placeResults.data.latitude && placeResults.data.longitude) {
          const lat = parseFloat(placeResults.data.latitude);
          const lng = parseFloat(placeResults.data.longitude);
          
          const geocodeResult = {
            results: [{
              formatted_address: placeResults.title || address,
              geometry: {
                location: { lat, lng }
              }
            }],
            status: 'OK'
          };
          
          console.log(`✅ Geocoding for "${address}" from place_results.data: ${lat}, ${lng}`);
          return res.json(geocodeResult);
        }
      }
      
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
      
      if (response.data.place_results && response.data.place_results.link) {
        const link = response.data.place_results.link;
        const linkMatches = link.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
        
        if (linkMatches && linkMatches.length >= 3) {
          const lat = parseFloat(linkMatches[1]);
          const lng = parseFloat(linkMatches[2]);
          
          const geocodeResult = {
            results: [{
              formatted_address: response.data.place_results.title || address,
              geometry: {
                location: { lat, lng }
              }
            }],
            status: 'OK'
          };
          
          console.log(`✅ Geocoding for "${address}" from place_results.link: ${lat}, ${lng}`);
          return res.json(geocodeResult);
        }
        
        const coordMatches = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        
        if (coordMatches && coordMatches.length >= 3) {
          const lat = parseFloat(coordMatches[1]);
          const lng = parseFloat(coordMatches[2]);
          
          const geocodeResult = {
            results: [{
              formatted_address: response.data.place_results.title || address,
              geometry: {
                location: { lat, lng }
              }
            }],
            status: 'OK'
          };
          
          console.log(`✅ Geocoding for "${address}" from place_results.link alternate pattern: ${lat}, ${lng}`);
          return res.json(geocodeResult);
        }
      }
      
      console.log('Response structure keys:', Object.keys(response.data));
      
      if (response.data.search_parameters) {
        console.log('Search parameters:', response.data.search_parameters);
      }
      
      if (response.data.place_results) {
        console.log('Place results keys:', Object.keys(response.data.place_results));
        console.log('Place title:', response.data.place_results.title);
        if (response.data.place_results.link) {
          console.log('Place link:', response.data.place_results.link);
        }
      }
      
      if (response.data.search_metadata && response.data.search_metadata.status === 'Success') {
        console.warn('Geocoding found no results for:', address);
        console.log('Query executed successfully but no coordinates found');
        
        const wellKnownLocations = {
          'bandung': { lat: -6.9175, lng: 107.6191 },
          'bandung, jawa barat': { lat: -6.9175, lng: 107.6191 },
          'jakarta': { lat: -6.2088, lng: 106.8456 },
          'surabaya': { lat: -7.2575, lng: 112.7521 },
          'yogyakarta': { lat: -7.7971, lng: 110.3688 },
          'bali': { lat: -8.3405, lng: 115.0920 },
          'denpasar': { lat: -8.6705, lng: 115.2126 },
        };
        
        const normalizedAddress = address.toLowerCase().trim();
        if (wellKnownLocations[normalizedAddress]) {
          const { lat, lng } = wellKnownLocations[normalizedAddress];
          
          const geocodeResult = {
            results: [{
              formatted_address: address,
              geometry: {
                location: { lat, lng }
              }
            }],
            status: 'OK'
          };
          
          console.log(`✅ Geocoding for "${address}" from hardcoded locations: ${lat}, ${lng}`);
          return res.json(geocodeResult);
        }
        
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
    console.error('Error in /api/geocode:', error);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        message: 'Koneksi ke layanan geocoding timeout',
        error: error.message,
        status: 'TIMEOUT_ERROR'
      });
    }
    
    if (error.response) {
      console.error('SerpAPI Error Response:', {
        status: error.response.status,
        data: error.response.data
      });
      
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
      console.error('No response received from SerpAPI');
      return res.status(503).json({ 
        message: 'Tidak ada respon dari layanan geocoding', 
        error: error.message,
        status: 'SERVICE_UNAVAILABLE'
      });
    } else {
      return res.status(500).json({ 
        message: 'Gagal mengkonversi alamat menjadi koordinat', 
        error: error.message,
        status: 'INTERNAL_ERROR'
      });
    }
  }
});

module.exports = router;