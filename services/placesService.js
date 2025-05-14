const axios = require('axios');

const SERPAPI_API_KEY = process.env.SERPAPI_KEY;
const SERPAPI_URL = 'https://serpapi.com/search';

const getPlacesData = async (lat, lon, query = 'tempat wisata', locationName = '') => {
  try {
    const response = await axios.get(SERPAPI_URL, {
      params: {
        engine: 'google_maps',
        type: 'search',
        q: query || 'tempat wisata',                                 // Bisa diganti berdasarkan input pengguna
        location: locationName || 'Indonesia',    // Jika tidak ada, fallback ke Indonesia
        ll: `@${lat},${lon},14z`,                 
        hl: 'id',
        gl: 'ID',
        api_key: SERPAPI_API_KEY
      }
    });

    if (response.data.local_results?.length > 0) {
      console.log('✅ Tempat wisata ditemukan:');
      response.data.local_results.forEach((place, index) => {
        console.log(`${index + 1}. ${place.title} (${place.rating || 'No rating'})`);
      });
    } else {
      console.log('⚠️ Tidak ada hasil tempat wisata ditemukan.');
    }

    return response.data.local_results || [];
  } catch (error) {
    console.error('❌ Axios Error:', {
      message: error.message,
      responseData: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      params: error.config?.params,
    });
    throw new Error('Failed to fetch places data');
  }
};

module.exports = { getPlacesData };
