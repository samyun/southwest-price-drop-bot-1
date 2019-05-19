const puppeteer = require('puppeteer');
const { PROXY } = require('./constants.js');

module.exports = function() {
  let browserOptions = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'];

  if (PROXY !== undefined) {
    console.log(`Proxy specified: ${PROXY}`)
    browserOptions.push('--proxy-server=' + PROXY);
  }

  // add `headless: false` for debugging SW changes
  return puppeteer.launch({
    args: browserOptions,
    ignoreHTTPSErrors: true
  });
}
