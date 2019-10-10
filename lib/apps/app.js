const express = require('express');

const historyGraph = require('../history-graph.js');
const render = require('../render.js');
const Alert = require('../bot/alert.js');
const Flight = require('../bot/flight.js');
const mgEmail = require('../bot/send-email.js');
const sms = require('../bot/send-sms.js');
const { ALERT_TYPES } = require('../constants.js');

const app = express();

// LIST
app.get('/', async (req, res) => {
  Alert
    .allActiveAlerts(req.auth)
    .then(alerts => {
      res.send(render('list', req, { alerts }));
    }
    );
});

// CREATE
app.post('/', async (req, res) => {
  req.body.user = req.auth.user;

  const alert = new Alert(Object.assign({}, req.body, { fetchingPrices: true }));
  await alert.save();

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

  await alert.getLatestPrice().then(() => alert.save());
});

// EDIT
app.get('/:id/edit', async (req, res) => {
  const alert = await Alert.get(req.params.id);

  if (!alert) {
    const errorMsg = 'Unable to edit flight. Invalid id: ' + req.params.id;
    console.warn(errorMsg);
    res.send(render('error', req, { errorMsg: errorMsg }));
  } else {
    res.send(render('edit', req, { alert, mgIsEnabled: mgEmail.enabled, smsIsEnabled: sms.enabled }));
  }
});

// UPDATE
app.post('/:id', async (req, res) => {
  const alert = await Alert.get(req.params.id);
  const newAlert = new Alert(req.body);

  // if the search changed, reset price history
  const isSameSearch = alert.signature === newAlert.signature;

  alert.data.fetchingPrices = true;

  if (isSameSearch) {
    alert.data.priceHistory = [];
  }

  alert.update(req.body);

  res.status(303).location(`/${alert.id}`).end();

  await alert.getLatestPrice();
  alert.save();
});

// DELETE
app.get('/:id/delete', async (req, res) => {
  const alert = await Alert.get(req.params.id);
  alert.delete();

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
  const alert = await Alert.get(req.params.id);

  if (!alert) {
    const errorMsg = 'Unable to display flight details. Invalid id: ' + req.params.id;
    console.warn(errorMsg);
    res.send(render('error', req, { errorMsg: errorMsg }));
  } else {
    const graph = alert.priceHistory.length ? historyGraph(alert) : '';
    res.send(render('show', req, { alert, graph }));
  }
});

// CHANGE PRICE
app.get('/:id/change-price', async (req, res) => {
  const alert = await Alert.get(req.params.id);

  if (!alert) {
    const errorMsg = 'Unable to change price. Invalid id: ' + req.params.id;
    console.warn(errorMsg);
    res.send(render('error', req, { errorMsg: errorMsg }));
  } else {
    const newPrice = parseInt(req.query.price, 10);

    if (newPrice < alert.data.price) {
      alert.data.price = newPrice;
      alert.save();
    }

    res.status(303).location(`/${alert.id}`).end();
  }
});

module.exports = app;
