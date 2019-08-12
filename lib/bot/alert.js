const PN = require('google-libphonenumber');
const cloneDeep = require('lodash.clonedeep');

const { getPriceForFlight } = require('./get-price.js');
const { ALERT_TYPES } = require('../constants.js');
const Flight = require('./flight.js');

class Alert {
  static async get (flightId) {
    const flight = await Flight.findOne({ _id: flightId }).exec();

    if (flight) {
      return new Alert(flight);
    } else {
      return null;
    }
  }

  static async allActiveAlerts (auth = null) {
    const flights = await Flight.find({}).exec();
    return flights
      .map(v => new Alert(v))
      .filter(alert => auth === null || auth.isAdmin || alert.user === auth.user)
      .sort((a, b) => a.date - b.date);
  }

  constructor (originalData) {
    if (originalData == null) { return; }

    if (typeof originalData === 'string') {
      this.data = new Flight(JSON.parse(originalData));
    } else if (!(originalData instanceof Flight)) {
      this.data = new Flight(cloneDeep(originalData));
    } else {
      this.data = originalData;
    }

    this.data.from = this.data.from.toLocaleUpperCase();
    this.data.to = this.data.to.toLocaleUpperCase();

    if (this.data.isPointsBooking) {
      this.data.isPointsBooking = this.data.isPointsBooking;
    } else if (this.data.bookingType) {
      if (this.data.bookingType === 'cash') {
        this.data.isPointsBooking = false;
      } else if (this.data.bookingType === 'points') {
        this.data.isPointsBooking = true;
      } else {
        console.warn('Unexpected booking type, defaulting to cash: ' + this.data.bookingType);
        this.data.isPointsBooking = false;
      }
    } else {
      this.data.isPointsBooking = false;
    }

    try {
      // split by commas if the flight has more than one stop
      this.data.number = (this.data.number != null && this.data.number !== 'NaN') ? this.data.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') : 'NaN';
    } catch (err) {
      console.log(typeof (this.data.number) + this.data.number);
      throw (err);
    }

    // mongoose will convert a string to a number based on the Flight schema
    this.data.originalPrice = originalData.price;

    this.data.phone = this.data.phone ? this.data.phone.split('').filter(d => /\d/.test(d)).join('') : null;
    this.data.toEmail = this.data.toEmail ? this.data.toEmail.split('').filter(d => /\S/.test(d)).join('') : null;
    this.data.priceHistory = Alert.compactPriceHistory(this.data.priceHistory || []);
    this.data.alertType = this.data.alertType != null ? this.data.alertType : ALERT_TYPES.SINGLE; // If there's no alertType, assume Single
    this.data.fetchingPrices = this.data.fetchingPrices || false;
  }

  get user () { return this.data.user; }
  get id () { return this.data.id; }
  get date () { return new Date(this.data.date); }
  get from () { return this.data.from; }
  get to () { return this.data.to; }
  get isPointsBooking () { return this.data.isPointsBooking; }
  get number () { return this.data.number; }
  get price () { return this.data.originalPrice; }
  get phone () { return this.data.phone; }
  get toEmail () { return this.data.toEmail; }
  get priceHistory () { return this.data.priceHistory; }
  get alertType () { return this.data.alertType; }

  get fetchingPrices () { return this.data.fetchingPrices; }

  get formattedDate () {
    return this.date.toLocaleDateString('en-US', { timeZone: 'UTC' });
  }

  get formattedNumber () {
    return 'WN ' + this.number.split(',').join(', ');
  }

  get formattedPhone () {
    if (this.data.phone == null) { return null; }
    if (this.data.phone === '') { return ''; }
    const phoneUtil = PN.PhoneNumberUtil.getInstance();
    const number = phoneUtil.parse(this.data.phone, 'US');
    return phoneUtil.format(number, PN.PhoneNumberFormat.INTERNATIONAL);
  }

  get formattedEmail () {
    return this.data.toEmail;
  }

  get formattedPrice () {
    if (this.data.isPointsBooking) {
      return this.data.price + ' points';
    } else {
      return '$' + this.data.price;
    }
  }

  get formattedLatestPrice () {
    if (this.data.isPointsBooking) {
      return this.latestPrice + ' points';
    } else {
      return '$' + this.latestPrice;
    }
  }

  get formattedPriceDifference () {
    const diff = this.data.price - this.latestPrice;
    if (this.data.isPointsBooking) {
      return diff + ' points';
    } else {
      return '$' + diff;
    }
  }

  get latestPrice () {
    const ph = this.data.priceHistory;
    return ph.length ? (ph[ph.length - 1]).price : Infinity;
  }

  get priceHasDropped () {
    return this.latestPrice < this.price;
  }

  get signature () {
    return [ this.formattedDate, this.from, this.to, this.number === 'NaN' ? 'All' : this.number ].join('|');
  }

  save () {
    return this.data.save(err => { if (err) throw (err); });
  }

  update (obj) {
    // TODO this whole price vs originalPrice logic is jacked up, but I'm loosing interest
    //      and cleaning things up, so I'm going to leave this as is
    if (obj.price) {
      obj.originalPrice = obj.price;
    }

    this.data.set(obj);
    return this.data.save();
  }

  delete () {
    this.data.delete();
  }

  toJSON () {
    return JSON.stringify(this.data);
  }

  async getLatestPrice (browser = undefined, lock = undefined) {
    const time = Date.now();
    const price = await getPriceForFlight(this, browser, lock);
    const entry = { time, price };

    console.log('Got price:', this.signature, entry);

    if (price < Infinity) this.priceHistory.push(entry);
    if (!this.originalPrice) this.originalPrice = this.price;
    this.data.fetchingPrices = false;

    return price;
  }

  static compactPriceHistory (history) {
    const compact = [];

    for (let i = 0; i < history.length; i++) {
      const p = i - 1;
      const n = i + 1;

      const prevDifferent = !history[p] || history[i].price !== history[p].price;
      const nextDifferent = !history[n] || history[i].price !== history[n].price;

      if (prevDifferent || nextDifferent) compact.push(history[i]);
    }

    return compact;
  }
}

module.exports = Alert;
