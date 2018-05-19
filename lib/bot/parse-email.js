const cheerio = require('cheerio');
const loadJsonFile = require('load-json-file');
const airportCodes = require('./airportCodeValidator.js');
const chrono = require('chrono-node');

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

function parseFile (file) {
  loadJsonFile(file).then(json => {
    console.log(json['subject']);
    const $ = cheerio.load(json['body-html']);

    let data = [];

    $('table[width=490] td div').each(function (i, elem) {
      data[i] = $(this).text().replace(/\s+/g, ' ').trim();
    });

    let fares = getFare(data[43]);

    console.log('Flight 1');
    let cDate1 = chrono.parseDate(data[20]);
    console.log('Date: ' + cDate1);
    console.log('flight number: ' + data[21]);

    var airports = getAirportCodes(data[23]);
    if (airportCodes.codeIsValid(airports[0]) && airportCodes.codeIsValid(airports[1])) { console.log('city pair: ' + airports.join(', ')); } else { console.log('Invalid city pair'); }

    console.log('fare: ' + fares[0]);
    console.log();

    console.log('Flight 2');
    let cDate2 = chrono.parseDate(data[33]);
    console.log('Date: ' + cDate2);
    console.log('flight number: ' + data[34]);
    console.log('city pair: ' + getAirportCodes(data[36]).join(', '));
    console.log('fare: ' + fares[1]);
    console.log('total fare: ' + fares[2]);
    console.log();
  });
}

parseFile('message.json');
parseFile('message2.json');

/*
loadJsonFile('message2.json').then(json => {
    console.log(json["subject"]);
    const $ = cheerio.load(json["body-html"]);
    console.log($.html());
});
*/
