// services/estimateService.js
const calculateEstimation = (pricePerDay, startDate, endDate, flightCost = 0) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = (end - start) / (1000 * 60 * 60 * 24) + 1;
    const totalCost = (pricePerDay * duration) + flightCost;
  
    return { duration, totalCost };
  };
  
  module.exports = { calculateEstimation };
  