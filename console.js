var repl = require('repl');

const Flight = require('./lib/bot/flight.js');
const Alert = require('./lib/bot/alert.js');
const mongoose = require('./lib/mongo.js');

mongoose.connection.on('open', () => {
  let replServer = repl.start('>');

  replServer.context.Flight = Flight;
  replServer.context.Alert = Alert;
  replServer.context.mongoose = mongoose;
});
