require('dotenv').config({ silent: true });

const ENV = process.env;

const ADMIN_NAME = ENV.ADMIN_NAME || ENV.USER_NAME;
const PASSWORD = ENV.PASSWORD || ENV.USER_PASSWORD;
const PROXY = ENV.PROXY;
const CHROME_DEBUG = ENV.CHROME_DEBUG === 'true';
const BASE_URL = ENV.BASE_URL || 'http://localhost/';

const DEVELOPMENT = ENV.DEVELOPMENT === 'true';

const PLIVO_ID = ENV.PLIVO_ID;
const PLIVO_TOKEN = ENV.PLIVO_TOKEN;
const PLIVO_NUMBER = ENV.PLIVO_NUMBER;

const MAILGUN_API_KEY = ENV.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = ENV.MAILGUN_DOMAIN;
const MAILGUN_EMAIL = ENV.MAILGUN_EMAIL;

const PORT = ENV.PORT;
const MONGODB_URI = ENV.MONGODB_URI;

const MAX_PAGES = ENV.MAX_PAGES || 5;

const SMS_GATEWAYS = [
  'txt.att.net',
  'tmomail.net',
  'vtext.com',
  'pm.sprint.com',
  'messaging.sprintpcs.com',
  'vmobl.com',
  'mmst5.tracfone.com',
  'mymetropcs.com',
  'myboostmobile.com',
  'mms.cricketwireless.net',
  'ptel.com',
  'text.republicwireless.com',
  'msg.fi.google.com',
  'tms.suncom.com',
  'message.ting.com',
  'email.uscc.net',
  'cingularme.com',
  'cspire1.com'
];

const ALERT_TYPES = {
  SINGLE: 'SINGLE',
  DAY: 'DAY',
  RANGE: 'RANGE'
};

module.exports = {
  ADMIN_NAME,
  PASSWORD,
  PROXY,
  BASE_URL,
  CHROME_DEBUG,
  DEVELOPMENT,
  PLIVO_ID,
  PLIVO_TOKEN,
  PLIVO_NUMBER,
  MAILGUN_API_KEY,
  MAILGUN_DOMAIN,
  MAILGUN_EMAIL,
  PORT,
  MONGODB_URI,
  SMS_GATEWAYS,
  ALERT_TYPES,
  MAX_PAGES
};
