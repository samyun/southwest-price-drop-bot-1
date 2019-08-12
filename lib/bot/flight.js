const mongoose = require('../mongo.js');
const Schema = mongoose.Schema;

const FlightSchema = new Schema({
  // _id is defined automatically

  IsPointsBooking: Boolean,

  from: String,
  to: String,

  bookingType: String,
  number: String,
  price: Number,
  originalPrice: Number,
  phone: String,
  toEmail: String,
  priceHistory: [],
  alertType: String,
  fetchingPrices: Boolean,

  user: String,
  date: Date
});

const Flight = mongoose.model('Flight', FlightSchema);

module.exports = Flight;
