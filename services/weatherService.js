// services/weatherService.js
const axios = require('axios');

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

const getWeatherForecast = async (lat, lon, date) => {
  try {
    const response = await axios.get(OPEN_METEO_BASE, {
      params: {
        latitude: lat,
        longitude: lon,
        hourly: 'temperature_2m,weathercode',
        start_date: date,
        end_date: date,
        timezone: 'auto'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch weather data');
  }
};

module.exports = { getWeatherForecast };
