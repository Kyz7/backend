
const calculateEstimation = (pricePerDay, startDate, endDate, flightCost = 0, adults = 1, children = 0) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = (end - start) / (1000 * 60 * 60 * 24) + 1;
  
  const accommodationCost = pricePerDay * duration * (parseInt(adults) + parseInt(children) * 0.5);
  

  const totalFlightCost = flightCost > 0 ? 
    flightCost * (parseInt(adults) + parseInt(children) * 0.75) : 0;
  

  const totalCost = accommodationCost + totalFlightCost;
  
  return { 
    duration, 
    accommodationCost, 
    flightCost: totalFlightCost,
    totalCost, 
    breakdown: {
      pricePerDay,
      days: duration,
      adults: parseInt(adults),
      children: parseInt(children),
      flightCostPerAdult: flightCost,
      flightCostPerChild: flightCost > 0 ? flightCost * 0.75 : 0
    }
  };
};

module.exports = { calculateEstimation };