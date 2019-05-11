require('dotenv').config({ silent: true });

const Alert = require('../lib/bot/alert.js');
const mgEmail = require('../lib/bot/send-email.js');
const sms = require('../lib/bot/send-sms.js');
const puppeteer = require('puppeteer');
const Semaphore = require('semaphore-async-await').default;
const { PROXY, ALERT_TYPES, MAX_PAGES, BASE_URL } = require('../lib/constants.js');

const COOLDOWN = 1;

(async () => {
  let browserOptions = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'];

  if (PROXY !== undefined) {
    browserOptions.append('--proxy-server=' + PROXY);
  }

  // add `headless: false` for debugging SW changes
  let = browser = await puppeteer.launch({ args: browserOptions });

  try {
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
          console.log(`${flight} dropped ${alert.formattedPriceDifference} to ${alert.formattedLatestPrice}${cooldown ? ' (on cooldown)' : ''}`);
          if (!cooldown) {
            let message;
            if (alert.alertType === ALERT_TYPES.SINGLE) {
              message = [
                `WN flight #${alert.number} `,
                `${alert.from} to ${alert.to} on ${alert.formattedDate} `,
                `was ${alert.formattedPrice}, is now ${alert.formattedLatestPrice}. `,
                `\n\nOnce rebooked, tap link to lower alert threshold: `,
                `${BASE_URL}/${alert.id}/change-price?price=${alert.latestPrice}`
              ].join('');
            } else if (alert.alertType === ALERT_TYPES.DAY) {
              message = [
                `A cheaper Southwest flight on ${alert.formattedDate} `,
                `${alert.from} to ${alert.to} was found! `,
                `Was ${alert.formattedPrice}, is now ${alert.formattedLatestPrice}. `,
                `\n\nOnce rebooked, tap link to lower alert threshold: `,
                `${BASE_URL}/${alert.id}/change-price?price=${alert.latestPrice}`
              ].join('');
            }
            const subject = [
              `✈ Southwest Price Drop Alert: ${alert.formattedPrice} → ${alert.formattedLatestPrice}. `
            ].join('');
            if (mgEmail.enabled && alert.toEmail) { await mgEmail.sendEmail(alert.toEmail, subject, message); }
            if (sms.enabled && alert.phone) { await sms.sendSms(alert.phone, message); }

            await redis.setAsync(cooldownKey, '');
            await redis.expireAsync(cooldownKey, COOLDOWN);
          }
        } else {
          console.log(`${flight} not cheaper`);
        }
      });

    await Promise.all(promises);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
})();
