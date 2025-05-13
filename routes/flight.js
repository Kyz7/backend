// routes/flight.js
const express = require('express');
const flightService = require('../services/flightService');
const router = express.Router();

router.post('/estimate', async (req, res) => {
  const { from, to } = req.body;
  
  if (!from || !to) {
    return res.status(400).json({ message: 'Departure and Arrival airports are required.' });
  }

  try {
    const flights = await flightService.getFlightData(from, to);
    res.json({ flights });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
