// File: services/placesService.js
const axios = require('axios');

const SERPAPI_API_KEY = process.env.SERPAPI_KEY;
const SERPAPI_URL = 'https://serpapi.com/search';

const getPlacesData = async (lat, lon, query = 'tempat wisata', locationName = '') => {
  try {
    // Check if API key is defined
    if (!SERPAPI_API_KEY) {
      console.error('SERPAPI_KEY is not defined in environment variables');
      throw new Error('Server configuration error: API key not found');
    }

    // Get location name from coordinates if not provided
    let location = locationName;
    
    if (!location) {
      try {
        console.log(`🔍 Performing reverse geocoding for coordinates: ${lat}, ${lon}`);
        
        // Use SerpAPI for reverse geocoding
        const reverseGeoResponse = await axios.get(SERPAPI_URL, {
          params: {
            engine: 'google_maps',
            type: 'search',
            ll: `@${lat},${lon},14z`,
            hl: 'id',
            gl: 'ID',
            api_key: SERPAPI_API_KEY
          },
          timeout: 10000 // 10 second timeout
        });
        
        // Try to extract location name from response
        if (reverseGeoResponse.data && reverseGeoResponse.data.local_results && reverseGeoResponse.data.local_results.length > 0) {
          // Extract location from address data in first result
          const firstResult = reverseGeoResponse.data.local_results[0];
          if (firstResult.address) {
            // Try to extract city/area name from address
            const addressParts = firstResult.address.split(',').map(part => part.trim());
            if (addressParts.length >= 2) {
              // Address format is usually: Street, City, Province, etc.
              // Take second part as city
              location = addressParts[1];
            } else {
              location = addressParts[0]; // Use first part if no comma
            }
            console.log(`✅ Reverse geocoding successful: "${location}"`);
          } else {
            console.log('⚠️ No address found in reverse geocoding results');
            location = 'Indonesia'; // Default fallback
          }
        } else {
          console.log('⚠️ No local_results in reverse geocoding response');
          // Try to extract region from response.data.search_parameters.q if available
          if (reverseGeoResponse.data?.search_parameters?.q) {
            location = reverseGeoResponse.data.search_parameters.q;
            console.log(`✅ Using search parameter as location: "${location}"`);
          } else {
            location = 'Indonesia'; // Default fallback
          }
        }
      } catch (error) {
        console.error('Error in reverse geocoding with SerpAPI:', error);
        location = 'Indonesia'; // Default fallback if error occurs
      }
    }
    
    console.log(`🔍 Searching for ${query || 'tempat wisata'} around ${location}`);
    
    // Make the actual search request
    const response = await axios.get(SERPAPI_URL, {
      params: {
        engine: 'google_maps',
        type: 'search',
        q: query || 'tempat wisata',
        location: location || 'Indonesia',
        ll: `@${lat},${lon},14z`,
        hl: 'id',
        gl: 'ID',
        api_key: SERPAPI_API_KEY
      },
      timeout: 15000 // 15 second timeout
    });

    // Process and return the results
    if (response.data && response.data.local_results && response.data.local_results.length > 0) {
      console.log(`✅ Found ${response.data.local_results.length} places in ${location}:`);
      
      // Process places data - add thumbnails and format information
      const processedPlaces = response.data.local_results.map(place => {
        // Get photo or thumbnail if available
        let thumbnail = place.thumbnail;
        
        // Set default values for expected fields
        return {
          ...place,
          place_id: place.place_id || `place-${Math.random().toString(36).substr(2, 9)}`,
          title: place.title || 'Unnamed Location',
          address: place.address || 'No address available',
          rating: place.rating || 0,
          reviews: place.reviews || 0,
          thumbnail: thumbnail || null,
          category: place.category || 'Tourist Attraction'
        };
      });
      
      return processedPlaces;
    } else {
      console.log(`⚠️ No places found in ${location}.`);
      return [];
    }
  } catch (error) {
    console.error('❌ Error in placesService:', {
      message: error.message,
      responseData: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      params: error.config?.params,
    });
    throw new Error('Failed to fetch places data: ' + error.message);
  }
};

module.exports = { getPlacesData };