require('dotenv').config({ silent: true });

const redis = require('../lib/redis.js');
const Alert = require('../lib/bot/alert.js');
const mgEmail = require('../lib/bot/send-email.js');
const sms = require('../lib/bot/send-sms.js');
const puppeteer = require('puppeteer');
const Semaphore = require('semaphore-async-await').default;
const { PROXY, ALERT_TYPES, MAX_PAGES } = require('../lib/constants.js');

const COOLDOWN = 1;

(async () => {
  let browser;
  if (PROXY === undefined) {
    browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']});
  } else {
    browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--proxy-server='+PROXY]});
  }
  try {
    const basePath = await redis.getAsync('__BASE_PATH');
    if (!basePath) throw Error('__BASE_PATH is not set in redis');

    const keys = await redis.keysAsync('alert.*');
    const values = keys.length ? await redis.mgetAsync(keys) : [];
    console.log(`checking ${values.length} flights`);

    const lock = new Semaphore(MAX_PAGES);

    const promises = values
      .map(data => new Alert(data))
      .sort((a, b) => a.date - b.date)
      .map(async alert => {
        const flight = `${alert.formattedDate} #${alert.number} ${alert.from} → ${alert.to}`;
        // delete alert if in past
        if (alert.date < Date.now()) {
          console.log(`${flight} expired, deleting`);
          redis.delAsync(alert.key());
          return;
        }

        // skip message if alert is on cooldown
        const cooldownKey = alert.key('cooldown');
        const cooldown = await redis.existsAsync(cooldownKey);

        // get current price
        await alert.getLatestPrice(browser, lock);
        await redis.setAsync(alert.key(), alert.toJSON());

        // send message if cheaper
        const less = alert.price - alert.latestPrice;
        if (less > 0) {
          console.log(`${flight} dropped $${less} to $${alert.latestPrice}${cooldown ? ' (on cooldown)' : ''}`);
          if (!cooldown) {
            let message;
            if (alert.alertType === ALERT_TYPES.SINGLE) {
              message = [
                `WN flight #${alert.number} `,
                `${alert.from} to ${alert.to} on ${alert.formattedDate} `,
                `was $${alert.price}, is now $${alert.latestPrice}. `,
                `\n\nOnce rebooked, tap link to lower alert threshold: `,
                `${basePath}/${alert.id}/change-price?price=${alert.latestPrice}`
              ].join('');
            } else if (alert.alertType === ALERT_TYPES.DAY) {
              message = [
                `A cheaper Southwest flight on ${alert.formattedDate} `,
                `${alert.from} to ${alert.to} was found! `,
                `Was $${alert.price}, is now $${alert.latestPrice}. `,
                `\n\nOnce rebooked, tap link to lower alert threshold: `,
                `${basePath}/${alert.id}/change-price?price=${alert.latestPrice}`
              ].join('');
            }
            const subject = [
              `✈ Southwest Price Drop Alert: $${alert.price} → $${alert.latestPrice}. `
            ].join('');
            if (mgEmail.enabled && alert.to_email) { await mgEmail.sendEmail(alert.to_email, subject, message); }
            if (sms.enabled && alert.phone) { await sms.sendSms(alert.phone, message); }

            await redis.setAsync(cooldownKey, '');
            await redis.expireAsync(cooldownKey, COOLDOWN);
          }
        } else {
          console.log(`${flight} not cheaper`);
        }
      });

    await Promise.all(promises);
    await browser.close();
    redis.quit();
  } catch (e) {
    console.error(e);
    await browser.close();
    redis.quit();
  }
})();
