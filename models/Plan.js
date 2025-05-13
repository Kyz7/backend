const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  place: {
    name: String,
    address: String,
    location: {
      lat: Number,
      lng: Number
    },
    rating: Number,
    photo: String
  },
  dateRange: {
    from: Date,
    to: Date
  },
  estimatedCost: Number,
  weather: String,
  flight: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plan', planSchema);
