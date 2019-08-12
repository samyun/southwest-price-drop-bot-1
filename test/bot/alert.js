const test = require('tape');
const Alert = require('../../lib/bot/alert.js');
const { ALERT_TYPES } = require('../../lib/constants.js');

test('Alert new day', async t => {
  const args = {
    user: 'user',
    from: 'cle',
    to: 'sea',
    date: '2018/5/29',
    price: '200',
    phone: '5555555555',
    toEmail: 'testing@example.com',
    alertType: ALERT_TYPES.DAY,
    fetchingPrices: true
  };

  const alert = new Alert(args);
  await alert.save();

  t.true(alert.user === args.user, 'user');
  t.true(typeof (alert.id) === 'string', 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === 'NaN', 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === args.phone !== '' ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null, 'phone');
  t.true(alert.toEmail === (args.toEmail !== '' ? args.toEmail.split('').filter(d => /\S/.test(d)).join('') : null), 'toEmail');
  t.true(typeof alert.priceHistory, 'Array');
  t.true(alert.priceHistory.length === 0, 'priceHistory');
  t.equal(alert.alertType, args.alertType);
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), 'formattedDate');
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), 'formattedNumber');
  t.true(alert.formattedPhone === '+1 555-555-5555', 'formattedPhone');
  t.true(alert.formattedEmail === alert.toEmail, 'formattedEmail');
  t.true(alert.latestPrice === Infinity, 'latestPrice');
  t.true(alert.priceHasDropped === (alert.latestPrice < args.price), 'priceHasDropped');
  t.true(alert.signature === ([ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|')), 'signature');
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
    phone: '5555555555',
    toEmail: 'testing@example.com',
    alertType: ALERT_TYPES.SINGLE,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof (alert.id) === 'string', 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === args.number.split(',').map(n => n.trim()).filter(n => n.length).join(','), 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== '' ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.toEmail === (args.toEmail !== '' ? args.toEmail.split('').filter(d => /\S/.test(d)).join('') : null), 'toEmail');
  t.true(alert.priceHistory.length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), 'formattedDate');
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), 'formattedNumber');
  t.true(alert.formattedPhone === '+1 555-555-5555', 'formattedPhone');
  t.true(alert.formattedEmail === alert.toEmail, 'formattedEmail');
  t.true(alert.latestPrice === Infinity, 'latestPrice');
  t.true(alert.priceHasDropped === (alert.latestPrice < args.price), 'priceHasDropped');
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), 'signature');
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
    phone: '5555555555',
    toEmail: 'testing@example.com',
    alertType: ALERT_TYPES.SINGLE,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof (alert.id) === 'string', 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === args.number.split(',').map(n => n.trim()).filter(n => n.length).join(','), 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== '' ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.priceHistory.length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), 'formattedDate');
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), 'formattedNumber');
  t.true(alert.formattedPhone === '+1 555-555-5555', 'formattedPhone');
  t.true(alert.formattedEmail === alert.toEmail, 'formattedEmail');
  t.true(alert.latestPrice === Infinity, 'latestPrice');
  t.true(alert.priceHasDropped === (alert.latestPrice < args.price), 'priceHasDropped');
  t.true(alert.signature === ([ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|')), 'signature');
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
    toEmail: 'testing@example.com',
    alertType: ALERT_TYPES.DAY,
    fetchingPrices: true
  };

  const alert = new Alert(args);
  await alert.save();

  t.true(alert.user === args.user, 'user');
  t.true(typeof (alert.id) === 'string', 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === 'NaN', 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== '' ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.toEmail === (args.toEmail !== '' ? args.toEmail.split('').filter(d => /\S/.test(d)).join('') : null), 'toEmail');
  t.true(alert.priceHistory.length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), 'formattedDate');
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), 'formattedNumber');
  t.true(alert.formattedPhone === null, 'formattedPhone');
  t.true(alert.formattedEmail === alert.toEmail, 'formattedEmail');
  t.true(alert.latestPrice === Infinity, 'latestPrice');
  t.true(alert.priceHasDropped === (alert.latestPrice < args.price), 'priceHasDropped');
  t.true(alert.signature === ([ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|')), 'signature');
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
    toEmail: 'testing@example.com',
    alertType: ALERT_TYPES.SINGLE,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof (alert.id) === 'string', 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === args.number.split(',').map(n => n.trim()).filter(n => n.length).join(','), 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== '' ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.toEmail === (args.toEmail !== '' ? args.toEmail.split('').filter(d => /\S/.test(d)).join('') : null), 'toEmail');
  t.true(alert.priceHistory.length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), 'formattedDate');
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), 'formattedNumber');
  t.true(alert.formattedPhone === null, 'formattedPhone');
  t.true(alert.formattedEmail === alert.toEmail, 'formattedEmail');
  t.true(alert.latestPrice === Infinity, 'latestPrice');
  t.true(alert.priceHasDropped === (alert.latestPrice < args.price), 'priceHasDropped');
  t.true(alert.signature === ([ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|')), 'signature');
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
    toEmail: 'testing@example.com',
    alertType: ALERT_TYPES.SINGLE,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof (alert.id) === 'string', 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === args.number.split(',').map(n => n.trim()).filter(n => n.length).join(','), 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== '' ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.toEmail === (args.toEmail !== '' ? args.toEmail.split('').filter(d => /\S/.test(d)).join('') : null), 'toEmail');
  t.true(alert.priceHistory.length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), 'formattedDate');
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), 'formattedNumber');
  t.true(alert.formattedPhone === null, 'formattedPhone');
  t.true(alert.formattedEmail === alert.toEmail, 'formattedEmail');
  t.true(alert.latestPrice === Infinity, 'latestPrice');
  t.true(alert.priceHasDropped === (alert.latestPrice < args.price), 'priceHasDropped');
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), 'signature');
  t.end();
});

test('Alert new day - no email', async t => {
  const args = {
    user: 'user',
    from: 'cle',
    to: 'sea',
    date: '2018/5/29',
    price: '200',
    phone: '5555555555',
    toEmail: '',
    alertType: ALERT_TYPES.DAY,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof (alert.id) === 'string', 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === 'NaN', 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== '' ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.toEmail === (args.toEmail !== '' ? args.toEmail.split('').filter(d => /\S/.test(d)).join('') : null), 'toEmail');
  t.true(alert.priceHistory.length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), 'formattedDate');
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), 'formattedNumber');
  t.true(alert.formattedPhone === '+1 555-555-5555', 'formattedPhone');
  t.true(alert.formattedEmail === null, 'formattedEmail');
  t.true(alert.latestPrice === Infinity, 'latestPrice');
  t.true(alert.priceHasDropped === (alert.latestPrice < args.price), 'priceHasDropped');
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), 'signature');
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
    phone: '5555555555',
    toEmail: '',
    alertType: ALERT_TYPES.SINGLE,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.true(typeof (alert.id) === 'string', 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === args.number.split(',').map(n => n.trim()).filter(n => n.length).join(','), 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== '' ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.toEmail === (args.toEmail !== '' ? args.toEmail.split('').filter(d => /\S/.test(d)).join('') : null), 'toEmail');
  t.true(alert.priceHistory.length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), 'formattedDate');
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), 'formattedNumber');
  t.true(alert.formattedPhone === '+1 555-555-5555', 'formattedPhone');
  t.true(alert.formattedEmail === null, 'formattedEmail');
  t.true(alert.latestPrice === Infinity, 'latestPrice');
  t.true(alert.priceHasDropped === (alert.latestPrice < args.price), 'priceHasDropped');
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), 'signature');
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
    phone: '5555555555',
    toEmail: '',
    alertType: ALERT_TYPES.SINGLE,
    fetchingPrices: true
  };

  const alert = new Alert(args);
  await alert.save();

  t.true(alert.user === args.user, 'user');
  t.true(typeof (alert.id) === 'string', 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === args.number.split(',').map(n => n.trim()).filter(n => n.length).join(','), 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== '' ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.toEmail === (args.toEmail !== '' ? args.toEmail.split('').filter(d => /\S/.test(d)).join('') : null), 'toEmail');
  t.true(alert.priceHistory.length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), 'formattedDate');
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), 'formattedNumber');
  t.true(alert.formattedPhone === '+1 555-555-5555', 'formattedPhone');
  t.true(alert.formattedEmail === null, 'formattedEmail');
  t.true(alert.latestPrice === Infinity, 'latestPrice');
  t.true(alert.priceHasDropped === (alert.latestPrice < args.price), 'priceHasDropped');
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), 'signature');
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
    toEmail: '',
    alertType: ALERT_TYPES.DAY,
    fetchingPrices: true
  };

  const alert = new Alert(args);
  await alert.save();

  t.true(alert.user === args.user, 'user');
  t.true(typeof (alert.id) === 'string', 'id');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === 'NaN', 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== '' ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.toEmail === (args.toEmail !== '' ? args.toEmail.split('').filter(d => /\S/.test(d)).join('') : null), 'toEmail');
  t.true(alert.priceHistory.length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), 'formattedDate');
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), 'formattedNumber');
  t.true(alert.formattedPhone === null, 'formattedPhone');
  t.true(alert.formattedEmail === null, 'formattedEmail');
  t.true(alert.latestPrice === Infinity, 'latestPrice');
  t.true(alert.priceHasDropped === (alert.latestPrice < args.price), 'priceHasDropped');
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), 'signature');
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
    toEmail: '',
    alertType: ALERT_TYPES.SINGLE,
    fetchingPrices: true
  };

  const alert = new Alert(args);
  alert.save();

  t.true(alert.user === args.user, 'user');
  t.equal(typeof (alert.id), 'string');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === args.number.split(',').map(n => n.trim()).filter(n => n.length).join(','), 'number');
  t.true(alert.price === parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== '' ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.toEmail === (args.toEmail !== '' ? args.toEmail.split('').filter(d => /\S/.test(d)).join('') : null), 'toEmail');
  t.true(alert.priceHistory instanceof Array, 'priceHistory');
  t.true(alert.priceHistory.length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), 'formattedDate');
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), 'formattedNumber');
  t.true(alert.formattedPhone === null, 'formattedPhone');
  t.true(alert.formattedEmail === null, 'formattedEmail');
  t.true(alert.latestPrice === Infinity, 'latestPrice');
  t.true(alert.priceHasDropped === (alert.latestPrice < args.price), 'priceHasDropped');
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), 'signature');
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
    toEmail: '',
    alertType: ALERT_TYPES.SINGLE,
    fetchingPrices: true
  };

  const alert = new Alert(args);

  t.true(alert.user === args.user, 'user');
  t.equal(typeof (alert.id), 'string');
  t.true(+alert.date === +new Date(args.date), 'date');
  t.true(alert.from === args.from.toLocaleUpperCase(), 'from');
  t.true(alert.to === args.to.toLocaleUpperCase(), 'to');
  t.true(alert.number === args.number.split(',').map(n => n.trim()).filter(n => n.length).join(','), 'number');
  t.equal(alert.price, parseInt(args.price, 10), 'price');
  t.true(alert.phone === (args.phone !== '' ? args.phone.split('').filter(d => /\d/.test(d)).join('') : null), 'phone');
  t.true(alert.toEmail === (args.toEmail !== '' ? args.toEmail.split('').filter(d => /\S/.test(d)).join('') : null), 'toEmail');
  t.true(alert.priceHistory instanceof Array);
  t.true(alert.priceHistory.length === 0, 'priceHistory');
  t.true(alert.alertType === args.alertType, 'alertType');
  t.true(alert.fetchingPrices === true, 'fetchingPrices');
  t.true(alert.formattedDate === new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), 'formattedDate');
  t.true(alert.formattedNumber === 'WN ' + alert.number.split(',').join(', '), 'formattedNumber');
  t.true(alert.formattedPhone === null, 'formattedPhone');
  t.true(alert.formattedEmail === null, 'formattedEmail');
  t.true(alert.latestPrice === Infinity, 'latestPrice');
  t.true(alert.priceHasDropped === (alert.latestPrice < args.price), 'priceHasDropped');
  t.true(alert.signature === [ new Date(args.date).toLocaleDateString('en-US', { timeZone: 'UTC' }), args.from.toLocaleUpperCase(), args.to.toLocaleUpperCase(), args.number === undefined ? 'All' : args.number.split(',').map(n => n.trim()).filter(n => n.length).join(',') ].join('|'), 'signature');
  t.end();
});

test.onFinish(() => process.exit(0));
