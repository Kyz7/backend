const axios = require('axios');

const SERPAPI_API_KEY = process.env.SERPAPI_KEY;
const SERPAPI_URL = 'https://serpapi.com/search';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const getPlacesData = async (lat, lon, query = 'tempat wisata', page = 1, limit = 9, locationName = '', userAgent = '') => {
  try {
    if (!SERPAPI_API_KEY) {
      console.error('SERPAPI_KEY is not defined in environment variables');
      throw new Error('Server configuration error: API key not found');
    }

    // Detect if request comes from Flutter web
    const isFlutterWeb = userAgent.includes('dart') || userAgent.includes('flutter');
    
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
    
    console.log(`🔍 Searching for ${query || 'tempat wisata'} around ${location} (Page ${page}) - Client: ${isFlutterWeb ? 'Flutter Web' : 'React/Other'}`);
    
    const start = (page - 1) * limit;
    
    const response = await axios.get(SERPAPI_URL, {
      params: {
        engine: 'google_maps',
        type: 'search',
        q: query || 'tempat wisata',
        location: location || 'Indonesia',
        ll: `@${lat},${lon},14z`,
        hl: 'id',
        gl: 'ID',
        start: start,
        num: limit * 2,
        api_key: SERPAPI_API_KEY
      },
      timeout: 15000 
    });

    if (response.data && response.data.local_results && response.data.local_results.length > 0) {
      console.log(`✅ Found ${response.data.local_results.length} places in ${location} (Page ${page}):`);
      
      const processedPlaces = response.data.local_results.map(place => {
        let thumbnail = place.thumbnail;
        
        // For Flutter web, use proxy URLs to avoid CORS
        // For React, keep original URLs (they work fine)
        if (isFlutterWeb && thumbnail && thumbnail.includes('serpapi.com')) {
          thumbnail = `${BASE_URL}/api/image/proxy-image?url=${encodeURIComponent(thumbnail)}`;
        }

        return {
          ...place,
          place_id: place.place_id || `place-${Math.random().toString(36).substr(2, 9)}`,
          title: place.title || 'Unnamed Location',
          address: place.address || 'No address available',
          rating: place.rating || 0,
          reviews: place.reviews || 0,
          thumbnail: thumbnail || null,
          // Add original URL for React frontend if needed
          originalThumbnail: place.thumbnail || null,
          category: place.category || 'Tourist Attraction'
        };
      });
      
      const startIndex = 0;
      const endIndex = limit;
      const paginatedPlaces = processedPlaces.slice(startIndex, endIndex);
      
      const totalResults = response.data.local_results.length;
      const hasNextPage = totalResults >= limit;
      const totalPages = hasNextPage ? page + 1 : page;
      
      return {
        places: paginatedPlaces,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          hasNextPage: hasNextPage,
          hasPreviousPage: page > 1,
          totalResults: totalResults,
          resultsPerPage: limit
        },
        meta: {
          isFlutterWeb: isFlutterWeb,
          userAgent: userAgent
        }
      };
    } else {
      console.log(`⚠️ No places found in ${location} (Page ${page}).`);
      return {
        places: [],
        pagination: {
          currentPage: page,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          totalResults: 0,
          resultsPerPage: limit
        },
        meta: {
          isFlutterWeb: isFlutterWeb,
          userAgent: userAgent
        }
      };
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