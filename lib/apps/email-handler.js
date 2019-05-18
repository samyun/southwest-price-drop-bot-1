const express = require('express');
const cheerio = require('cheerio');
const airportCodes = require('../bot/validate-airport.js');
const chrono = require('chrono-node');
const Alert = require('../bot/alert.js');
const mgEmail = require('../bot/send-email.js');
const crypto = require('crypto');

const { MAILGUN_API_KEY } = require('../constants.js');

const app = express();

// HANDLE INCOMING EMAIL
app.post('/email', async (req, res) => {
  console.log('req on email hit');
  console.log(req.body.subject);
  if (req && req.body && req.body.timestamp && req.body.token && req.body.signature) {
    if (verifySignature(req.body.timestamp, req.body.token, req.body.signature)) {
      parseEmailJSON(req.body);
      res.status(200).send(req.body);
    } else {
      console.log('Signature failure!');
      res.status(403).send().end();
    }
  } else {
    console.log('Request missing timestamp, token and signature redirecting to login');
    console.log(req.body);
    res.status(303).location('/sign-in').end();
  }
});

app.use((req, res, next) => {
  next();
});

function getAirportCodes (str) {
  const regex = /\(([A-Z]{3})\)/g;
  let m;
  let codes = [];
  while ((m = regex.exec(str)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    // Since we are matching the same pattern multiple times we want the capture group of each match
    m.forEach((match, groupIndex) => {
      if (groupIndex === 1) { codes.push(match); }
    });
  }
  return codes;
}

function getFare (str) {
  const regex = /Fare Rule.*WN [A-Z]{3}(\d+\.?\d*)WN [A-Z]{3}(\d+\.?\d*)USD(\d+\.?\d*)END/g;
  let m;
  let fares = [];
  while ((m = regex.exec(str)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    // Since we are matching the whole string the 0 match is the string.
    m.forEach((match, groupIndex) => {
      if (groupIndex > 0) { fares.push(match); }
    });
  }
  return fares;
}

function verifySignature (timestamp, token, signature) {
  const timestampToken = timestamp + token;
  const hmac = crypto.createHmac('sha256', MAILGUN_API_KEY.toString());
  hmac.update(timestampToken);
  const digest = hmac.digest('hex');
  console.log('hmac digest: ' + digest + ' | signature: ' + signature + ' | eq? ' + (digest === signature));
  return (digest === signature);
}

async function parseEmailJSON (json) {
  const $ = cheerio.load(json['body-html']);

  let data = [];
  let flightDataRowStart = -1;
  const startRegex = /AIR Confirmation:/;

  let flightDataRowEnd = -1;
  const stopRegex = /Useful Tools/;

  $('table[width=490] td div').each(function (i, elem) {
    let text = $(this).text().replace(/\s+/g, ' ').trim();
    if (text && text.length > 0) {
      if (flightDataRowStart < 0) {
        // check for startRegex
        if (startRegex.test(text)) {
          flightDataRowStart = i;
        }
      } else {
        // start looking for stopRegex
        if (stopRegex.test(text)) {
          flightDataRowEnd = i;
        } else {
          data.push(text);
        }
      }
    }
  });

  let flights = [];
  let fares = [];
  // Iterate the data looking for flights
  for (var i = 0; i < data.length; i++) {
    const FLIGHT_KEY = 'Departure/Arrival';
    const FARE_KEY = 'Fare Rule';
    if (data[i].indexOf(FLIGHT_KEY) !== -1) {
      // Next row is the date of this leg
      let flightDate = chrono.parseDate(data[i + 1]);
      // The following row i+2 is the flight number
      let flightNumber = parseInt(data[i + 2]);
      // Third is a description of the flight
      let airports = getAirportCodes(data[i + 3]);

      // Validate everything
      if (flightDate && flightNumber && airportCodes.codeIsValid(airports[0]) && airportCodes.codeIsValid(airports[1])) {
        flights.push({ user: json.sender, toEmail: json.sender, date: flightDate, number: flightNumber + ',', from: airports[0], to: airports[1] });
      } else {
        console.log("Couldn't parse flight! Date: " + flightDate + ', ' + data[i + 1] + '; number: ' + flightNumber + ', ' + data[i + 2] + '; airports: ' + airports.join(', ') + ', ' + data[i + 3]);
      }
    }
    if (data[i].indexOf(FARE_KEY) !== -1) {
      fares = getFare(data[i]);
    }
  }
  for (i = 0; i < fares.length; i++) {
    if (fares[i] && flights[i]) {
      flights[i].price = fares[i];
    }
  }

  console.log(flights);
  console.log(fares);

  for (i = 0; i < flights.length; i++) {
    const alert = new Alert(flights[i]);

    const message = [
      `Alert created for Southwest flight #${alert.number} from `,
      `${alert.from} to ${alert.to} on ${alert.formattedDate}. `,
      `We'll alert you if the price drops below ${alert.formattedPrice}.`
    ].join('');
    const subject = [
      `✈ Alert created for WN ${alert.number} `,
      `${alert.from} → ${alert.to} on ${alert.formattedDate}. `
    ].join('');

    console.log('Sending email: ' + alert.toEmail + ', ' + subject + ', ' + message);
    mgEmail.sendEmail(alert.toEmail, subject, message);

    alert.getLatestPrice().then(() => alert.save());
  }
}

module.exports = app;
