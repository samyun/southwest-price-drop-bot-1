const cheerio = require('cheerio');
const dateFormat = require('dateformat');
const { ALERT_TYPES, MAX_PAGES, CHROME_DEBUG } = require('../constants.js');
const createBrowser = require('../browser.js');
const urlUtil = require('url');

async function getPriceForFlight ({ from, to, date, passengers, number, isPointsBooking, alertType }, browser, lock) {
  const flights = (await getFlights({
    from,
    to,
    departDate: date,
    passengers,
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

async function getFlights ({ from, to, departDate, passengers, isPointsBooking, browser, lock }) {
  const fares = { outbound: [] };

  let html = '';

  if (browser === undefined) {
    browser = await createBrowser();
  }

  try {
    if (lock) {
      console.debug('lock has available permits: ' + lock.getPermits());
      await lock.wait();
      console.debug('Entered lock, available permits: ' + lock.getPermits());
      html = await getPage(from, to, departDate, passengers, isPointsBooking, browser);
      await lock.signal();
      console.debug('Exited lock, available permits: ' + lock.getPermits());
    } else {
      html = await getPage(from, to, departDate, passengers, isPointsBooking, browser);
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
  console.log('No. of departing flights found: ' + departingFlights.length)
  if (departingFlights.length) {
    departingFlights.toArray().forEach(e => parseTrip(e, fares.outbound));
  } else {
    console.error('No flights found!');
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

    const durationAndStops = $(e).find('.flight-stops-badge')
      .text();
    const stops_ = durationAndStops
      .split(' '); // '1 stop' -> ['1', 'stop']

    const stops = stops_[0] === '' ? 0 : parseInt(stops_[0], 10);
    console.log('stops: ', stops);

    const priceStrDict = {};
    const classes = ['Business Select', 'Anytime', 'Wanna Get Away'];
    $(e).find('.fare-button--text').each(function (i, elem) {
      if ($(this).text() === 'Sold out') { priceStrDict[classes[i]] = 'Infinity'; } else { priceStrDict[classes[i]] = $(this).find('.fare-button--value > span > span > span').text() }
    });

    let price = Infinity;
    if (Object.keys(priceStrDict).length > 0) {
      for (var key in priceStrDict) {
        let price_ = parseInt(priceStrDict[key].replace(/,|\$/g, ''), 10);
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

function createUrl (from, to, departDate, passengers, isPointsBooking) {
  const fareType = (isPointsBooking) ? 'POINTS' : 'USD';

  return 'https://www.southwest.com/air/booking/select.html' +
    '?int=HOMEQBOMAIR' +
    '&adultPassengersCount=' + passengers +
    '&departureDate=' + dateFormat(departDate, 'yyyy-mm-dd', true) +
    '&destinationAirportCode=' + to +
    '&fareType=' + fareType +
    '&originationAirportCode=' + from +
    '&passengerType=ADULT' +
    '&returnDate=' +
    '&tripType=oneway' +
    '&departureTimeOfDay=ALL_DAY' +
    '&reset=true' +
    '&returnTimeOfDay=ALL_DAY';
}

async function racePromises(promises) {
  const indexedPromises = promises.map((promise, index) => new Promise((resolve) => promise.then(() => resolve(index))));
  return Promise.race(indexedPromises);
}

async function getPage (from, to, departDate, passengers, isPointsBooking, browser) {
  const page = await browser.newPage();

  await page.setJavaScriptEnabled(true);
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36');

  // long timeouts prevent page load from failing via proxies or slow connections
  await page.setDefaultTimeout(1000 * 120);

  await page.setViewport({ width: 800, height: 600 });

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
//      console.log(`attempting to load: ${resourceType}; ${url}`);
      request.continue();
      return;
    }

    if (['font', 'image', 'stylesheet'].indexOf(resourceType) !== -1) {
      if (url.startsWith('data:image')) {
//        console.log(`attempting to load: ${resourceType}; ${url}`);
        request.continue();
      } else {
        request.respond({
          status: 200,
          body: "foo"
        });
      }
    } else if (['script', 'document', 'xhr', 'other'].indexOf(resourceType) !== -1) {
      // there are lots of tracking and ad stuff loaded, let's skip that
      if (!urlUtil.parse(url).hostname.includes('southwest.com')) {
        request.respond({
          status: 200,
          body: "foo"
        });
      } else {
        // "other" => favicon
//        console.log(`attempting to load: ${resourceType}; ${url}`);
        request.continue();
      }
    } else {
//      console.log(`Unknown request type: ${resourceType}; URL: ${url}`);
      request.continue();
   }
  });

    //Testing if headless browser can be detected
//  if (CHROME_DEBUG) {
//       await page.goto('https://bot.sannysoft.com')
//       await page.waitFor(5000)
//       await page.screenshot({ path: 'testresult.png', fullPage: true })
//  }

  try {
      const url = createUrl(from, to, departDate, passengers, isPointsBooking);
      console.log('Retrieving URL: ', url);

      const response = await page.goto(url, {waitUntil: 'networkidle2'});
      console.log('Page has been loaded');;
      if (response.status() !== 200) {
          console.log(`response code is not 200: ${response.status()}`);
      }

      try {
          console.debug('Trying to find prices.');
          const navigationOutcome = await racePromises([
              page.waitForSelector('.price-matrix--details-titles',{ visible: true }),
              page.waitForSelector('#form-mixin--submit-button',{ visible: true })
          ]);
          console.debug('The outcome is: ' + navigationOutcome);
          if (navigationOutcome === 0) {
              console.debug('Found departing flights!!');
          } else if (navigationOutcome === 1) {
              console.debug('Button found!! Click it!');
              await Promise.all([
                  page.waitForNavigation({waitUntil: 'networkidle2'}),
                  page.click('#form-mixin--submit-button')
              ]);
              await page.screenshot({ path: 'button-click.png', fullPage: true });
	      console.debug('Got flight page on second try!');
          }
      } catch (err) {
          console.error('Unable to get flights');
          await page.screenshot({ path: 'failed.png', fullPage: true })
          console.error(await page.content());
          console.error(response.headers());
          console.error(response.status());
      }
      const html = await page.evaluate(() => document.body.outerHTML);
      await page.goto('about:blank');
      await page.close();
      console.debug('Page closed');
      return html.toString();
  } catch (e) {
      try {
          console.debug('Warning Will Robinson!');
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
