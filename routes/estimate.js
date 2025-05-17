// routes/estimate.js
const express = require('express');
const router = express.Router();
const { calculateEstimation } = require('../services/estimateService');

router.post('/', (req, res) => {
  const { pricePerDay, startDate, endDate, flightCost, adults, children } = req.body;
  
  if (!pricePerDay || !startDate || !endDate) {
    return res.status(400).json({ message: 'Required parameters missing' });
  }
  
  try {
    const estimation = calculateEstimation(
      pricePerDay, 
      startDate, 
      endDate, 
      flightCost || 0,
      adults || 1,
      children || 0
    );
    
    res.json(estimation);
  } catch (error) {
    console.error('Error calculating estimation:', error);
    res.status(500).json({ message: 'Error calculating estimation' });
  }
});

module.exports = router;