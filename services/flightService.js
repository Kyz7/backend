// services/flightService.js
const axios = require('axios');

const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY;
const AVIATIONSTACK_URL = 'http://api.aviationstack.com/v1/';

const getFlightData = async (from, to) => {
    try {
      const response = await axios.get(`${AVIATIONSTACK_URL}flights`, {
        params: {
          access_key: AVIATIONSTACK_API_KEY,
          dep_iata: from,
          arr_iata: to,
        }
      });
  
      return response.data.data.map(flight => ({
        flight_number: flight.flight?.iata,
        airline: flight.airline?.name,
        departure: flight.departure,
        arrival: flight.arrival,
        aircraft: flight.aircraft?.model,
        status: flight.flight_status
      }));
    } catch (error) {
      console.error('❌ Flight API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        params: error.config?.params,
      });
      throw new Error('Failed to fetch flight data');
    }
  };
  
module.exports = { getFlightData };
