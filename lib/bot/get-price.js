const cheerio = require('cheerio');
const dateFormat = require('dateformat');
const { ALERT_TYPES, MAX_PAGES, CHROME_DEBUG } = require('../constants.js');
const createBrowser = require('../browser.js');
const urlUtil = require('url');

async function getPriceForFlight ({ from, to, date, number, isPointsBooking, alertType }, browser, lock) {
  const flights = (await getFlights({
    from,
    to,
    departDate: date,
    isPointsBooking: isPointsBooking,
    browser,
    lock
  })).outbound;

  let options;
  if (alertType === ALERT_TYPES.SINGLE) {
    options = flights.filter(f => f.number === number);
  } else if (alertType === ALERT_TYPES.DAY) {
    options = flights;
  } else if (alertType === ALERT_TYPES.RANGE) {
    return;
  }
  const prices = options.map(f => f.price);
  console.log('Min price: ' + Math.min(...prices));
  return Math.min(...prices);
}

async function getFlights ({ from, to, departDate, returnDate, isPointsBooking, browser, lock }) {
  const twoWay = Boolean(departDate && returnDate);
  const fares = { outbound: [] };

  if (twoWay) fares.return = [];

  let html = '';

  if (browser === undefined) {
    browser = await createBrowser();
  }

  try {
    if (lock) {
      console.debug('lock has available permits: ' + lock.getPermits());
      await lock.wait();
      console.debug('Entered lock, available permits: ' + lock.getPermits());
      html = await getPage(from, to, departDate, returnDate, isPointsBooking, browser);
      await lock.signal();
      console.debug('Exited lock, available permits: ' + lock.getPermits());
    } else {
      html = await getPage(from, to, departDate, returnDate, isPointsBooking, browser);
    }
  } catch (e) {
    if (e.message.includes('ERR_INTERNET_DISCONNECTED')) {
      console.error('Bot was unable to connect to the internet while checking Southwest. Check your connection and try again later.');
    } else {
      console.error(e);
    }
    if (lock) {
      const numPermits = lock.getPermits();
      if (numPermits !== MAX_PAGES) { await lock.signal(); }
    }
  }

  const $ = cheerio.load(html);

  const departingFlights = $(`#air-booking-product-0`).find(`li.air-booking-select-detail`);
  if (departingFlights.length) {
    departingFlights.toArray().forEach(e => parseTrip(e, fares.outbound));
  } else {
    console.error('No flights found!');
  }

  if (twoWay) {
    const returningFlights = $(`#air-booking-product-1`).find(`li.air-booking-select-detail`);
    if (returningFlights.length) {
      returningFlights.toArray().forEach(e => parseTrip(e, fares.return));
    }
  }

  return fares;

  function parseTrip (e, dest, international = false) {
    console.log('------------------ New trip price ---------------');

    const flights = $(e).find('.select-detail--flight-numbers').find('.actionable--text')
      .text()
      .substr(2) // remove "# "
      .split(' / ')
      .join(',');
    console.log('flights: ', flights);

    const durationAndStops = $(e).find('.flight-stops--duration')
      .text();
    const duration = $(e).find('.flight-stops--duration-time').text();
    const stops_ = durationAndStops
      .split(duration)[1] // split on the duration -> eg 'Duration8h 5m1stop' -> ['Duration', '1 stop']
      .split(' '); // '1 stop' -> ['1', 'stop']

    const stops = stops_[0] === '' ? 0 : parseInt(stops_[0], 10);
    console.log('stops: ', stops);

    const priceStrDict = {};
    const classes = ['Business Select', 'Anytime', 'Wanna Get Away'];
    $(e).find('.fare-button--text').each(function (i, elem) {
      if ($(this).text() === 'Sold out') { priceStrDict[classes[i]] = 'Infinity'; } else { priceStrDict[classes[i]] = $(this).find('.fare-button--value-total').text(); }
    });

    let price = Infinity;
    if (Object.keys(priceStrDict).length > 0) {
      for (var key in priceStrDict) {
        let price_ = parseInt(priceStrDict[key].replace(/,/g, ''), 10);
        if (price_ < price) { price = price_; }
      }
    } else { console.error('There were no prices found!'); }
    console.log('Price: ', price);

    dest.push({
      number: flights,
      stops,
      price
    });
  }
}

function createUrl (from, to, departDate, returnDate, isPointsBooking) {
  const fareType = (isPointsBooking) ? 'POINTS' : 'USD';

  return 'https://www.southwest.com/air/booking/select.html' +
    '?originationAirportCode=' + from +
    '&destinationAirportCode=' + to +
    '&returnAirportCode=' +
    '&departureDate=' + dateFormat(departDate, 'yyyy-mm-dd', true) +
    '&departureTimeOfDay=ALL_DAY' +
    '&returnDate=' +
    '&returnTimeOfDay=ALL_DAY' +
    '&adultPassengersCount=1' +
    '&seniorPassengersCount=0' +
    '&fareType=' + fareType +
    '&passengerType=ADULT' +
    '&tripType=oneway' +
    '&promoCode=' +
    '&reset=true' +
    '&redirectToVision=true' +
    '&int=HOMEQBOMAIR' +
    '&leapfrogRequest=true';
}

async function getPage (from, to, departDate, returnDate, isPointsBooking, browser) {
  const page = await browser.newPage();

  await page.setJavaScriptEnabled(true);

  // long timeouts prevent page load from failing via proxies or slow connections
  await page.setDefaultTimeout(1000 * 120);

  await page.setViewport({ width: 1280, height: 800 });

  await page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // allows the request callback below to fire
  await page.setRequestInterception(true);

  // don't load images and css to reduce bandwidth usage.
  // many hosted proxies make you pay for bandwidth, this helps lower the cost.
  // https://github.com/GoogleChrome/puppeteer/issues/1913
  page.on('request', request => {
    const resourceType = request.resourceType();
    const url = request.url();

    if (CHROME_DEBUG) {
      console.log(`attempting to load: ${resourceType}; ${url}`);
      request.continue();
      return;
    }

    if (['font', 'image', 'stylesheet'].indexOf(resourceType) !== -1) {
      if (url.startsWith('data:image')) {
        request.continue();
      } else {
        request.abort();
      }
    } else if (['script', 'document', 'xhr', 'other'].indexOf(resourceType) !== -1) {
      // there are lots of tracking and ad stuff loaded, let's skip that
      if (!urlUtil.parse(url).hostname.includes('southwest.com')) {
        request.abort();
      } else {
        // "other" => favicon
        request.continue();
      }
    } else {
      console.log(`Unknown request type: ${resourceType}; URL: ${url}`);
      request.continue();
    }
  });

  if (CHROME_DEBUG) {
    page.goto('https://infosimples.github.io/detect-headless/');
    debugger;
  }

  try {
    const url = createUrl(from, to, departDate, returnDate, isPointsBooking);
    console.log('Retrieving URL: ', url);

    const response = await page.goto(url);

    if (response.status() !== 200) {
      console.log(`response code is not 200: ${response.status()}`);
    }

    // TODO huh? Are we seriously just retrying the same code twice? This should be pulled
    //      out into a separate method to more easily retry and be DRY

    try {
      await page.waitForSelector('.price-matrix--details-titles');
      await page.waitForSelector('.flight-stops');
      console.debug('Got flight page!');
    } catch (err) {
      // TODO assert that  "Sorry, we found some errors" does not exist

      console.error('Unable to get flights - trying again');
      console.error(await page.content());
      console.error(response.headers());
      console.error(response.status());

      try {
        await page.goto(url);
        await page.waitForSelector('.price-matrix--details-titles');
        await page.waitForSelector('.flight-stops');
      } catch (err) {
        const currentUrl = page.url();
        const errHtml = await page.evaluate(() => document.body.outerHTML);
        await page.goto('about:blank');
        await page.close();

        if (errHtml.includes('Access Denied')) {
          throw new Error('ERROR! Access Denied Error! Unable to find flight information on page: ' + currentUrl + '\nhtml: ' + errHtml);
        } else {
          throw new Error('ERROR! Unknown error! Unable to find flight information on page: ' + currentUrl + '\nhtml: ' + errHtml);
        }
      }
    }

    const html = await page.evaluate(() => document.body.outerHTML);
    await page.goto('about:blank');
    await page.close();
    return html.toString();
  } catch (e) {
    try {
      await page.goto('about:blank');
      await page.close();
    } catch (err) { }
    throw e;
  }
}

module.exports = {
  getPriceForFlight,
  getFlights
};
