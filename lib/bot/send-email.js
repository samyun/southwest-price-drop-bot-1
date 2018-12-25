const Mailgun = require('mailgun-js');

const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_EMAIL, SMS_GATEWAYS } = require('../constants.js');

const enabled = Boolean(MAILGUN_API_KEY && MAILGUN_DOMAIN && MAILGUN_EMAIL);

async function sendEmail (to, subject, message, from = MAILGUN_EMAIL) {
  if (!enabled) return false;

  const mg = getMailgun();
  const toDomain = to.split('@')[1];
  const params = {
    from: from,
    to: to,
    text: message
  };

  if (SMS_GATEWAYS.indexOf(toDomain) === -1) {
    params.subject = subject;
  }

  return new Promise(resolve => {
    mg.messages().send(params, function (error, body) {
      if (error) {
        console.log('Error: ' + error);
      } else {
        console.log(body);
      }
      resolve({
        error,
        body
      });
    });
  });
}

function getMailgun () {
  return new Mailgun({
    apiKey: MAILGUN_API_KEY,
    domain: MAILGUN_DOMAIN
  });
}

module.exports = {
  enabled,
  sendEmail
};
