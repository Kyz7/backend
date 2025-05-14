// services/weatherService.js
const axios = require('axios');

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

/**
 * Get weather forecast data for a specific location and date
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} Weather forecast data
 */
const getWeatherForecast = async (lat, lon, date) => {
  try {
    // Validate inputs
    if (!lat || !lon || !date) {
      throw new Error('Missing required parameters: latitude, longitude, or date');
    }
    
    const response = await axios.get(OPEN_METEO_BASE, {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: 'temperature_2m,weathercode,precipitation,windspeed_10m',
        daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum',
        start_date: date,
        end_date: date,
        timezone: 'auto'
      }
    });
    
    // Add some processing to make the data more usable in the frontend
    const processedData = {
      ...response.data,
      formatted: {
        date: date,
        location: response.data.timezone,
        temperature: {
          current: response.data.hourly.temperature_2m[new Date().getHours()] || null,
          min: Math.min(...response.data.hourly.temperature_2m),
          max: Math.max(...response.data.hourly.temperature_2m)
        },
        weathercode: response.data.hourly.weathercode[new Date().getHours()] || 0,
        conditions: getWeatherCondition(response.data.hourly.weathercode[new Date().getHours()] || 0)
      }
    };
    
    return processedData;
  } catch (error) {
    console.error('Weather service error:', error);
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
};

/**
 * Convert weather code to human-readable condition
 * @param {number} code - Weather code from Open-Meteo API
 * @returns {string} Human-readable weather condition
 */
const getWeatherCondition = (code) => {
  // WMO Weather interpretation codes (WW)
  // https://open-meteo.com/en/docs
  if (code === 0) return 'Cerah';
  if (code === 1) return 'Cerah Berawan';
  if (code >= 2 && code <= 3) return 'Berawan';
  if (code === 45 || code === 48) return 'Berkabut';
  if (code >= 51 && code <= 55) return 'Gerimis';
  if (code >= 56 && code <= 57) return 'Gerimis Beku';
  if (code >= 61 && code <= 65) return 'Hujan';
  if (code >= 66 && code <= 67) return 'Hujan Beku';
  if (code >= 71 && code <= 77) return 'Salju';
  if (code >= 80 && code <= 82) return 'Hujan Lebat';
  if (code >= 85 && code <= 86) return 'Salju Lebat';
  if (code === 95) return 'Badai Petir';
  if (code >= 96 && code <= 99) return 'Badai Petir dengan Hujan Es';
  return 'Tidak Diketahui';
};

module.exports = { getWeatherForecast };