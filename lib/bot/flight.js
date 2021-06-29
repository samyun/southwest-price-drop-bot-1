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
  passengerCount: Number,
  phone: String,
  toEmail: String,
  toDiscord: String,
  priceHistory: [],
  alertType: String,
  nonStopOnly: Boolean,
  fetchingPrices: Boolean,

  user: String,
  date: Date
});

const Flight = mongoose.model('Flight', FlightSchema);

module.exports = Flight;
