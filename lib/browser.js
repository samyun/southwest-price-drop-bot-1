const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');
const { PROXY, CHROME_DEBUG } = require('./constants.js');

module.exports = async function() {
  let browserOptions = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'];

  // https://blog.apify.com/how-to-make-headless-chrome-and-puppeteer-use-a-proxy-server-with-authentication-249a21a79212
  if (PROXY !== undefined) {
    const newProxy = await proxyChain.anonymizeProxy(PROXY);
    console.log(`Proxy specified: ${PROXY}; New proxy: ${newProxy}`);
    browserOptions.push(`--proxy-server=${newProxy}`);
  }

  return await puppeteer.launch({
    args: browserOptions,

    // not sure if this is absolutely needed: I added this while
    // trying to get some different proxies to work
    ignoreHTTPSErrors: true,

    headless: !CHROME_DEBUG
  });
}
