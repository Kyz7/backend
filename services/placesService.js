const axios = require('axios');

const SERPAPI_API_KEY = process.env.SERPAPI_KEY;
const SERPAPI_URL = 'https://serpapi.com/search';

const getPlacesData = async (lat, lon, query = 'tempat wisata', locationName = '') => {
  try {

    if (!SERPAPI_API_KEY) {
      console.error('SERPAPI_KEY is not defined in environment variables');
      throw new Error('Server configuration error: API key not found');
    }

    let location = locationName;
    
    if (!location) {
      try {
        console.log(`🔍 Performing reverse geocoding for coordinates: ${lat}, ${lon}`);
        
        const reverseGeoResponse = await axios.get(SERPAPI_URL, {
          params: {
            engine: 'google_maps',
            type: 'search',
            ll: `@${lat},${lon},14z`,
            hl: 'id',
            gl: 'ID',
            api_key: SERPAPI_API_KEY
          },
          timeout: 10000
        });
        
        if (reverseGeoResponse.data && reverseGeoResponse.data.local_results && reverseGeoResponse.data.local_results.length > 0) {
          const firstResult = reverseGeoResponse.data.local_results[0];
          if (firstResult.address) {
            const addressParts = firstResult.address.split(',').map(part => part.trim());
            if (addressParts.length >= 2) {

              location = addressParts[1];
            } else {
              location = addressParts[0]; 
            }
            console.log(`✅ Reverse geocoding successful: "${location}"`);
          } else {
            console.log('⚠️ No address found in reverse geocoding results');
            location = 'Indonesia'; 
          }
        } else {
          console.log('⚠️ No local_results in reverse geocoding response');
          if (reverseGeoResponse.data?.search_parameters?.q) {
            location = reverseGeoResponse.data.search_parameters.q;
            console.log(`✅ Using search parameter as location: "${location}"`);
          } else {
            location = 'Indonesia'; 
          }
        }
      } catch (error) {
        console.error('Error in reverse geocoding with SerpAPI:', error);
        location = 'Indonesia'; 
      }
    }
    
    console.log(`🔍 Searching for ${query || 'tempat wisata'} around ${location}`);
    
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
      timeout: 15000 
    });


    if (response.data && response.data.local_results && response.data.local_results.length > 0) {
      console.log(`✅ Found ${response.data.local_results.length} places in ${location}:`);
      

      const processedPlaces = response.data.local_results.map(place => {

        let thumbnail = place.thumbnail;

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