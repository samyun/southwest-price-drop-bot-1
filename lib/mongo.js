const { MONGODB_URI } = require('./constants.js');
const mongoose = require('mongoose');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
  // bufferCommands: false
}).then(
  () => console.log('mongo successfully connected!'),
  err => console.log(`error connecting to mongo: ${err}`)
);

module.exports = mongoose;
