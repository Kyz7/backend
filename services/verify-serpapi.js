// File: scripts/verify-serpapi.js
const axios = require('axios');
require('dotenv').config(); // Make sure to have dotenv installed

// Get SerpAPI Key from environment variables
const SERPAPI_API_KEY = process.env.SERPAPI_KEY;
const SERPAPI_URL = 'https://serpapi.com/search';

/**
 * Simple test script to verify SerpAPI functionality
 */
async function verifySerpApi() {
  console.log('🔍 Verifying SerpAPI configuration...');
  
  // Check if API key exists
  if (!SERPAPI_API_KEY) {
    console.error('❌ ERROR: SERPAPI_KEY is not defined in environment variables');
    console.log('Make sure you have a .env file with SERPAPI_KEY defined.');
    process.exit(1);
  }

  console.log('✓ SERPAPI_KEY is defined');
  
  // Test #1: Geocoding with Google Maps engine
  try {
    console.log('\n🧪 TEST #1: Geocoding a location (Jakarta)');
    const geocodeResponse = await axios.get(SERPAPI_URL, {
      params: {
        engine: 'google_maps',
        q: 'Jakarta',
        type: 'search',
        hl: 'id',
        gl: 'ID',
        api_key: SERPAPI_API_KEY
      }
    });
    
    // Check if we got a response
    if (!geocodeResponse.data) {
      console.error('❌ No data received from SerpAPI');
      process.exit(1);
    }
    
    // Extract location data
    const locationString = geocodeResponse.data.search_parameters?.ll || '';
    const matches = locationString.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    
    if (matches && matches.length >= 3) {
      const lat = parseFloat(matches[1]);
      const lng = parseFloat(matches[2]);
      console.log(`✅ Geocoding successful. Jakarta coordinates: ${lat}, ${lng}`);
    } else {
      console.log('⚠️ Could not extract coordinates from response.');
      console.log('Raw response:', JSON.stringify(geocodeResponse.data.search_parameters, null, 2));
    }
  } catch (error) {
    console.error('❌ Error in geocoding test:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    process.exit(1);
  }
  
  // Test #2: Search for places
  try {
    console.log('\n🧪 TEST #2: Searching for tourist attractions in Bali');
    const placesResponse = await axios.get(SERPAPI_URL, {
      params: {
        engine: 'google_maps',
        q: 'tempat wisata',
        location: 'Bali, Indonesia',
        hl: 'id',
        gl: 'ID',
        api_key: SERPAPI_API_KEY
      }
    });
    
    if (placesResponse.data.local_results?.length > 0) {
      console.log(`✅ Found ${placesResponse.data.local_results.length} tourist attractions in Bali:`);
      placesResponse.data.local_results.slice(0, 3).forEach((place, index) => {
        console.log(`${index + 1}. ${place.title} (${place.rating || 'No rating'})`);
      });
      if (placesResponse.data.local_results.length > 3) {
        console.log(`... and ${placesResponse.data.local_results.length - 3} more places`);
      }
    } else {
      console.log('⚠️ No tourist attractions found in Bali');
      console.log('Raw response:', JSON.stringify(placesResponse.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error in places search test:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    process.exit(1);
  }
  
  console.log('\n✅ All tests passed! Your SerpAPI configuration is working correctly.');
}

// Run the verification
verifySerpApi();