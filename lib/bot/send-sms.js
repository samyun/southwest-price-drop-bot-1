const Plivo = require('plivo');

const { PLIVO_ID, PLIVO_TOKEN, PLIVO_NUMBER } = require('../constants.js');

const enabled = Boolean(PLIVO_ID && PLIVO_TOKEN && PLIVO_NUMBER);

async function sendSms (to, message, from = PLIVO_NUMBER) {
  if (!enabled || to == null) return false;

  const plivo = getPlivo();
  try {
    const response = await plivo.messages.create(from, to, message);
    console.log(response);
    return response;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function getPlivo () {
  return new Plivo.Client(PLIVO_ID, PLIVO_TOKEN);
}

module.exports = {
  enabled,
  getPlivo,
  sendSms
};
