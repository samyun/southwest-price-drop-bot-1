const express = require('express');

const historyGraph = require('../history-graph.js');
const render = require('../render.js');
const Alert = require('../bot/alert.js');
const mgEmail = require('../bot/send-email.js');
const sms = require('../bot/send-sms.js');
const { ALERT_TYPES } = require('../constants.js');

const app = express();

// LIST
app.get('/', async (req, res) => {
  const keys = await redis.keysAsync('alert.*');
  const values = keys.length ? await redis.mgetAsync(keys) : [];
  const alerts = values
    .map(v => new Alert(v))
    .filter(alert => req.auth.isAdmin || alert.user === req.auth.user)
    .sort((a, b) => a.date - b.date);
  res.send(render('list', req, { alerts }));
});

// CREATE
app.post('/', async (req, res) => {
  req.body.user = req.auth.user;
  const alert = new Alert(Object.assign({}, req.body, { fetchingPrices: true }));
  await redis.setAsync(alert.key(), alert.toJSON());
  res.status(303).location(`/${alert.id}`).end();

  let message;
  let subject;
  if (alert.alertType === ALERT_TYPES.SINGLE) {
    message = [
      `Alert created for Southwest flight #${alert.number} from `,
      `${alert.from} to ${alert.to} on ${alert.formattedDate}. `,
      `We'll alert you if the price drops below ${alert.formattedPrice}.`
    ].join('');
    subject = [
      `✈ Alert created for WN ${alert.number} `,
      `${alert.from} → ${alert.to} on ${alert.formattedDate}. `
    ].join('');
  } else if (alert.alertType === ALERT_TYPES.DAY) {
    message = [
      `Alert created for any Southwest flight from `,
      `${alert.from} to ${alert.to} on ${alert.formattedDate}. `,
      `We'll alert you if the price drops below ${alert.formattedPrice}.`
    ].join('');
    subject = [
      `✈ Alert created for any WN flight `,
      `${alert.from} → ${alert.to} on ${alert.formattedDate}. `
    ].join('');
  } else {
    if (alert.alertType) {
      console.log('Unknown alertType: ' + alert.alertType);
    } else {
      console.log('alertType not set');
    }
    return;
  }

  if (mgEmail.enabled && alert.toEmail) {
    await mgEmail.sendEmail(alert.toEmail, subject, message);
  }

  if (sms.enabled && alert.phone) {
    await sms.sendSms(alert.phone, message);
  }

  await alert.getLatestPrice();
  await redis.setAsync(alert.key(), alert.toJSON());
});

// EDIT
app.get('/:id/edit', async (req, res) => {
  const data = await redis.getAsync(`alert.${req.params.id}`);
  if (!data) {
    const errorMsg = 'Unable to edit flight. Invalid id: ' + req.params.id;
    console.warn(errorMsg);
    res.send(render('error', req, { errorMsg: errorMsg }));
  } else {
    const alert = new Alert(data);
    res.send(render('edit', req, { alert, mgIsEnabled: mgEmail.enabled, smsIsEnabled: sms.enabled }));
  }
});

// UPDATE
app.post('/:id', async (req, res) => {
  const oldAlert = new Alert(await redis.getAsync(`alert.${req.params.id}`));
  const resetPriceHistory = (new Alert(oldAlert.data)).signature === (new Alert(req.body)).signature ? {} : { priceHistory: [] };
  const alert = new Alert(Object.assign({}, oldAlert.data, req.body, resetPriceHistory, { fetchingPrices: true }));
  await redis.setAsync(alert.key(), alert.toJSON());
  await redis.delAsync(alert.key('cooldown'));
  res.status(303).location(`/${alert.id}`).end();

  await alert.getLatestPrice();
  await redis.setAsync(alert.key(), alert.toJSON());
});

// DELETE
app.get('/:id/delete', async (req, res) => {
  await redis.delAsync(`alert.${req.params.id}`);
  await redis.delAsync(`cooldown.${req.params.id}`);
  res.status(303).location('/').end();
});

// NEW-SINGLE
app.get('/new-single', async (req, res) => {
  res.send(render('new-single', req, { alertType: ALERT_TYPES.SINGLE, mgIsEnabled: mgEmail.enabled, smsIsEnabled: sms.enabled }));
});

// NEW-DAY
app.get('/new-day', async (req, res) => {
  res.send(render('new-day', req, { alertType: ALERT_TYPES.DAY, mgIsEnabled: mgEmail.enabled, smsIsEnabled: sms.enabled }));
});

// SHOW
app.get('/:id', async (req, res) => {
  const data = await redis.getAsync(`alert.${req.params.id}`);
  if (!data) {
    const errorMsg = 'Unable to display flight details. Invalid id: ' + req.params.id;
    console.warn(errorMsg);
    res.send(render('error', req, { errorMsg: errorMsg }));
  } else {
    const alert = new Alert(data);
    const graph = alert.data.priceHistory.length ? historyGraph(alert) : '';
    res.send(render('show', req, { alert, graph }));
  }
});

// CHANGE PRICE
app.get('/:id/change-price', async (req, res) => {
  const data = await redis.getAsync(`alert.${req.params.id}`);
  if (!data) {
    const errorMsg = 'Unable to change price. Invalid id: ' + req.params.id;
    console.warn(errorMsg);
    res.send(render('error', req, { errorMsg: errorMsg }));
  } else {
    const alert = new Alert(data);
    const newPrice = parseInt(req.query.price, 10);
    if (newPrice < alert.data.price) {
      alert.data.price = newPrice;
      await redis.setAsync(alert.key(), alert.toJSON());
      await redis.delAsync(alert.key('cooldown'));
    }
    res.status(303).location(`/${alert.id}`).end();
  }
});

module.exports = app;
