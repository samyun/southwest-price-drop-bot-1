const path = require('path');
const pug = require('pug');
const merge = require('lodash.merge');
const { ALERT_TYPES } = require('./constants.js');

function render (view, req, vars) {
  const file = path.resolve(__dirname, './views', `${view}.pug`);
  const mergedVars = merge({}, { auth: req.auth, ALERT_TYPES: ALERT_TYPES }, vars);
  return pug.renderFile(file, mergedVars);
}

module.exports = render;
