const puppeteer = require('puppeteer-extra');
const proxyChain = require('proxy-chain');
const { PROXY, CHROME_DEBUG } = require('./constants.js');

module.exports = async function () {
  let browserOptions = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-web-security'

    // NOTE do NOT disable WebGL/GPU stuff. SW uses this to detect headless.
  ];

  // https://blog.apify.com/how-to-make-headless-chrome-and-puppeteer-use-a-proxy-server-with-authentication-249a21a79212
  if (PROXY !== undefined) {
    const newProxy = await proxyChain.anonymizeProxy(PROXY);
    console.log(`Proxy specified: ${PROXY}; New proxy: ${newProxy}`);
    browserOptions.push(`--proxy-server=${newProxy}`);
  }

  puppeteer.use(require('puppeteer-extra-plugin-stealth')());

  let browser = await puppeteer.launch({
    args: browserOptions,

    // not sure if this is absolutely needed: I added this while
    // trying to get some different proxies to work
    ignoreHTTPSErrors: true,

    headless: !CHROME_DEBUG,
    dumpio: CHROME_DEBUG,

    slowMo: CHROME_DEBUG ? 500 : 0
  });

  if (CHROME_DEBUG) {
    console.log("chrome debugging is enabled: use 'node inspect' to ");

    let version = await browser.version();
    console.log(`Chrome Version: ${version}`);
  }

  return browser;
};
