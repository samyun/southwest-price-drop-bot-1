const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const path = require('path');

const { PORT } = require('./constants.js');
const Auth = require('./apps/auth.js');
const App = require('./apps/app.js');
const Email = require('./apps/email-handler.js');

const app = express();
app.set('trust proxy', true);
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));

app.use(express.static(path.join(__dirname, '../static')));
app.use('/', Email);
app.use('/', Auth);
app.use('/', App);

const listener = app.listen(PORT, () => console.log(`app started on ${listener.address().port}`));
