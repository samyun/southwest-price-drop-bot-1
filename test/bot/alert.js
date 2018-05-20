const test = require('tape');
const PN = require('google-libphonenumber');
const Alert = require('../../lib/bot/alert.js');
const { ALERT_TYPES } = require('../../lib/constants.js');

test('Alert new day', async t => {
  const args = {
    user: 'user',
    from: 'cle',
    to: 'sea',
    date: '2018/5/29',
    price: '200',
    phone: '1234567890',
    to_email: 'testing@example.com',
    alertType: ALERT_TYPES.DAY,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof(alert.id) === "string", 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === "NaN", 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === args.phone !== "" ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null, 'phone');
  t.true(alert.to_email === (args.to_email !== "" ? args.to_email.split('').filter(d => /\S/.test(d)).join('') : null), 'to_email');
  t.true(Object.keys(alert.priceHistory).length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), "formattedDate");
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), "formattedNumber");
  t.true(alert.formattedPhone === "+1 123-456-7890", "formattedPhone");
  t.true(alert.formattedEmail === alert.to_email, "formattedEmail");
  // t.true(alert.latestPrice === args.priceHistory.length ? (args.priceHistory[args.priceHistory.length - 1]).price : Infinity);
  t.true(alert.latestPrice === Infinity, "latestPrice");
  t.true(alert.priceHasDropped === alert.latestPrice < args.price, "priceHasDropped");
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), "signature");
  t.end();
});

test('Alert new single (one flight)', async t => {
  const args = {
    user: 'user',
    from: 'cle',
    to: 'sea',
    date: '2018/5/29',
    number: '123',
    price: '200',
    phone: '1234567890',
    to_email: 'testing@example.com',
    alertType: ALERT_TYPES.SINGLE,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof(alert.id) === "string", 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === args.number.split(',').map(n => n.trim()).filter(n => n.length).join(','), 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== "" ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.to_email === (args.to_email !== "" ? args.to_email.split('').filter(d => /\S/.test(d)).join('') : null), 'to_email');
  t.true(Object.keys(alert.priceHistory).length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), "formattedDate");
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), "formattedNumber");
  t.true(alert.formattedPhone === "+1 123-456-7890", "formattedPhone");
  t.true(alert.formattedEmail === alert.to_email, "formattedEmail");
  t.true(alert.latestPrice === Infinity, "latestPrice");
  t.true(alert.priceHasDropped === alert.latestPrice < args.price, "priceHasDropped");
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), "signature");
  t.end();
});

test('Alert new single (two flights)', async t => {
  const args = {
    user: 'user',
    from: 'cle',
    to: 'sea',
    date: '2018/5/29',
    number: '123, 456',
    price: '200',
    phone: '1234567890',
    to_email: 'testing@example.com',
    alertType: ALERT_TYPES.SINGLE,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof(alert.id) === "string", 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === args.number.split(',').map(n => n.trim()).filter(n => n.length).join(','), 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== "" ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(Object.keys(alert.priceHistory).length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), "formattedDate");
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), "formattedNumber");
  t.true(alert.formattedPhone === "+1 123-456-7890", "formattedPhone");
  t.true(alert.formattedEmail === alert.to_email, "formattedEmail");
  t.true(alert.latestPrice === Infinity, "latestPrice");
  t.true(alert.priceHasDropped === alert.latestPrice < args.price, "priceHasDropped");
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), "signature");
  t.end();
});

test('Alert new day - no phone', async t => {
  const args = {
    user: 'user',
    from: 'cle',
    to: 'sea',
    date: '2018/5/29',
    price: '200',
    phone: '',
    to_email: 'testing@example.com',
    alertType: ALERT_TYPES.DAY,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof(alert.id) === "string", 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === "NaN", 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== "" ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.to_email === (args.to_email !== "" ? args.to_email.split('').filter(d => /\S/.test(d)).join('') : null), 'to_email');
  t.true(Object.keys(alert.priceHistory).length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), "formattedDate");
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), "formattedNumber");
  t.true(alert.formattedPhone === null, "formattedPhone");
  t.true(alert.formattedEmail === alert.to_email, "formattedEmail");
  t.true(alert.latestPrice === Infinity, "latestPrice");
  t.true(alert.priceHasDropped === alert.latestPrice < args.price, "priceHasDropped");
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), "signature");
  t.end();
});

test('Alert new single (one flight) - no phone', async t => {
  const args = {
    user: 'user',
    from: 'cle',
    to: 'sea',
    date: '2018/5/29',
    number: '123',
    price: '200',
    phone: '',
    to_email: 'testing@example.com',
    alertType: ALERT_TYPES.SINGLE,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof(alert.id) === "string", 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === args.number.split(',').map(n => n.trim()).filter(n => n.length).join(','), 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== "" ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.to_email === (args.to_email !== "" ? args.to_email.split('').filter(d => /\S/.test(d)).join('') : null), 'to_email');
  t.true(Object.keys(alert.priceHistory).length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), "formattedDate");
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), "formattedNumber");
  t.true(alert.formattedPhone === null, "formattedPhone");
  t.true(alert.formattedEmail === alert.to_email, "formattedEmail");
  t.true(alert.latestPrice === Infinity, "latestPrice");
  t.true(alert.priceHasDropped === alert.latestPrice < args.price, "priceHasDropped");
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), "signature");
  t.end();
});

test('Alert new single (two flights) - no phone', async t => {
  const args = {
    user: 'user',
    from: 'cle',
    to: 'sea',
    date: '2018/5/29',
    number: '123, 456',
    price: '200',
    phone: '',
    to_email: 'testing@example.com',
    alertType: ALERT_TYPES.SINGLE,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof(alert.id) === "string", 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === args.number.split(',').map(n => n.trim()).filter(n => n.length).join(','), 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== "" ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.to_email === (args.to_email !== "" ? args.to_email.split('').filter(d => /\S/.test(d)).join('') : null), 'to_email');
  t.true(Object.keys(alert.priceHistory).length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), "formattedDate");
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), "formattedNumber");
  t.true(alert.formattedPhone === null, "formattedPhone");
  t.true(alert.formattedEmail === alert.to_email, "formattedEmail");
  t.true(alert.latestPrice === Infinity, "latestPrice");
  t.true(alert.priceHasDropped === alert.latestPrice < args.price, "priceHasDropped");
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), "signature");
  t.end();
});

test('Alert new day - no email', async t => {
  const args = {
    user: 'user',
    from: 'cle',
    to: 'sea',
    date: '2018/5/29',
    price: '200',
    phone: '1234567890',
    to_email: '',
    alertType: ALERT_TYPES.DAY,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof(alert.id) === "string", 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === "NaN", 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== "" ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.to_email === (args.to_email !== "" ? args.to_email.split('').filter(d => /\S/.test(d)).join('') : null), 'to_email');
  t.true(Object.keys(alert.priceHistory).length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), "formattedDate");
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), "formattedNumber");
  t.true(alert.formattedPhone === "+1 123-456-7890", "formattedPhone");
  t.true(alert.formattedEmail === null, "formattedEmail");
  t.true(alert.latestPrice === Infinity, "latestPrice");
  t.true(alert.priceHasDropped === alert.latestPrice < args.price, "priceHasDropped");
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), "signature");
  t.end();
});

test('Alert new single (one flight) - no email', async t => {
  const args = {
    user: 'user',
    from: 'cle',
    to: 'sea',
    date: '2018/5/29',
    number: '123',
    price: '200',
    phone: '1234567890',
    to_email: '',
    alertType: ALERT_TYPES.SINGLE,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof(alert.id) === "string", 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === args.number.split(',').map(n => n.trim()).filter(n => n.length).join(','), 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== "" ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.to_email === (args.to_email !== "" ? args.to_email.split('').filter(d => /\S/.test(d)).join('') : null), 'to_email');
  t.true(Object.keys(alert.priceHistory).length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), "formattedDate");
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), "formattedNumber");
  t.true(alert.formattedPhone === "+1 123-456-7890", "formattedPhone");
  t.true(alert.formattedEmail === null, "formattedEmail");
  t.true(alert.latestPrice === Infinity, "latestPrice");
  t.true(alert.priceHasDropped === alert.latestPrice < args.price, "priceHasDropped");
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), "signature");
  t.end();
});

test('Alert new single (two flights) - no email', async t => {
  const args = {
    user: 'user',
    from: 'cle',
    to: 'sea',
    date: '2018/5/29',
    number: '123, 456',
    price: '200',
    phone: '1234567890',
    to_email: '',
    alertType: ALERT_TYPES.SINGLE,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof(alert.id) === "string", 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === args.number.split(',').map(n => n.trim()).filter(n => n.length).join(','), 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== "" ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.to_email === (args.to_email !== "" ? args.to_email.split('').filter(d => /\S/.test(d)).join('') : null), 'to_email');
  t.true(Object.keys(alert.priceHistory).length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), "formattedDate");
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), "formattedNumber");
  t.true(alert.formattedPhone === "+1 123-456-7890", "formattedPhone");
  t.true(alert.formattedEmail === null, "formattedEmail");
  t.true(alert.latestPrice === Infinity, "latestPrice");
  t.true(alert.priceHasDropped === alert.latestPrice < args.price, "priceHasDropped");
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), "signature");
  t.end();
});

test('Alert new day - no email or phone', async t => {
  const args = {
    user: 'user',
    from: 'cle',
    to: 'sea',
    date: '2018/5/29',
    price: '200',
    phone: '',
    to_email: '',
    alertType: ALERT_TYPES.DAY,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof(alert.id) === "string", 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === "NaN", 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== "" ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.to_email === (args.to_email !== "" ? args.to_email.split('').filter(d => /\S/.test(d)).join('') : null), 'to_email');
  t.true(Object.keys(alert.priceHistory).length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), "formattedDate");
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), "formattedNumber");
  t.true(alert.formattedPhone === null, "formattedPhone");
  t.true(alert.formattedEmail === null, "formattedEmail");
  t.true(alert.latestPrice === Infinity, "latestPrice");
  t.true(alert.priceHasDropped === alert.latestPrice < args.price, "priceHasDropped");
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), "signature");
  t.end();
});

test('Alert new single (one flight) - no email or phone', async t => {
  const args = {
    user: 'user',
    from: 'cle',
    to: 'sea',
    date: '2018/5/29',
    number: '123',
    price: '200',
    phone: '',
    to_email: '',
    alertType: ALERT_TYPES.SINGLE,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof(alert.id) === "string", 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === args.number.split(',').map(n => n.trim()).filter(n => n.length).join(','), 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== "" ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.to_email === (args.to_email !== "" ? args.to_email.split('').filter(d => /\S/.test(d)).join('') : null), 'to_email');
  t.true(Object.keys(alert.priceHistory).length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), "formattedDate");
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), "formattedNumber");
  t.true(alert.formattedPhone === null, "formattedPhone");
  t.true(alert.formattedEmail === null, "formattedEmail");
  t.true(alert.latestPrice === Infinity, "latestPrice");
  t.true(alert.priceHasDropped === alert.latestPrice < args.price, "priceHasDropped");
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), "signature");
  t.end();
});

test('Alert new single (two flights) - no email or phone', async t => {
  const args = {
    user: 'user',
    from: 'cle',
    to: 'sea',
    date: '2018/5/29',
    number: '123, 456',
    price: '200',
    phone: '',
    to_email: '',
    alertType: ALERT_TYPES.SINGLE,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof(alert.id) === "string", 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === args.number.split(',').map(n => n.trim()).filter(n => n.length).join(','), 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== "" ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.to_email === (args.to_email !== "" ? args.to_email.split('').filter(d => /\S/.test(d)).join('') : null), 'to_email');
  t.true(Object.keys(alert.priceHistory).length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), "formattedDate");
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), "formattedNumber");
  t.true(alert.formattedPhone === null, "formattedPhone");
  t.true(alert.formattedEmail === null, "formattedEmail");
  t.true(alert.latestPrice === Infinity, "latestPrice");
  t.true(alert.priceHasDropped === alert.latestPrice < args.price, "priceHasDropped");
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), "signature");
  t.end();
});

