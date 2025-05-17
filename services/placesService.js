// File: services/placesService.js (PERUBAHAN)
const axios = require('axios');

const SERPAPI_API_KEY = process.env.SERPAPI_KEY;
const SERPAPI_URL = 'https://serpapi.com/search';

const getPlacesData = async (lat, lon, query = 'tempat wisata', locationName = '') => {
  try {
    // Dapatkan nama lokasi dari koordinat jika tidak disediakan
    let location = locationName;
    
    if (!location) {
      try {
        // Gunakan SerpAPI untuk reverse geocoding
        const reverseGeoResponse = await axios.get(SERPAPI_URL, {
          params: {
            engine: 'google_maps',
            type: 'search',
            ll: `@${lat},${lon},14z`,
            hl: 'id',
            gl: 'ID',
            api_key: SERPAPI_API_KEY
          }
        });
        
        // Coba ekstrak nama lokasi dari respons
        if (reverseGeoResponse.data.local_results && reverseGeoResponse.data.local_results.length > 0) {
          // Ekstrak lokasi dari data alamat pada hasil pertama
          const firstResult = reverseGeoResponse.data.local_results[0];
          if (firstResult.address) {
            // Coba ekstrak nama kota/daerah dari alamat
            const addressParts = firstResult.address.split(',').map(part => part.trim());
            if (addressParts.length >= 2) {
              // Biasanya format alamat: Jalan, Kota, Provinsi, dll.
              // Ambil bagian kedua sebagai kota
              location = addressParts[1];
            } else {
              location = addressParts[0]; // Gunakan bagian pertama jika tidak ada koma
            }
          } else {
            location = 'Indonesia'; // Default fallback
          }
        } else {
          location = 'Indonesia'; // Default fallback
        }
      } catch (error) {
        console.error('Error in reverse geocoding with SerpAPI:', error);
        location = 'Indonesia'; // Default fallback jika terjadi error
      }
    }
    
    console.log(`🔍 Mencari ${query || 'tempat wisata'} di sekitar ${location}`);
    
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
      }
    });

    if (response.data.local_results?.length > 0) {
      console.log(`✅ Ditemukan ${response.data.local_results.length} tempat wisata di ${location}:`);
      response.data.local_results.forEach((place, index) => {
        console.log(`${index + 1}. ${place.title} (${place.rating || 'No rating'})`);
      });
    } else {
      console.log(`⚠️ Tidak ada hasil tempat wisata ditemukan di ${location}.`);
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