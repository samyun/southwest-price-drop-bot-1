const test = require('tape');

const { getFlights } = require('../../lib/bot/get-price.js');

test('getFlights domestic', async t => {
  const tomorrow = (new Date()).setDate((new Date()).getDate() + 1);
  const args = {
    from: 'SEA',
    to: 'CLE',
    departDate: tomorrow
  };
  const flights = await getFlights(args);

  t.true(flights.outbound);
  t.true(flights.outbound[0].number);
  t.true(flights.outbound[0].stops);
  t.true(flights.outbound[0].price);
  t.end();
});

test('getFlights international', async t => {
  const tomorrow = (new Date()).setDate((new Date()).getDate() + 1);
  const args = {
    from: 'DEN',
    to: 'MEX',
    departDate: tomorrow
  };
  const flights = await getFlights(args);

  t.true(flights.outbound);
  t.true(flights.outbound[0].number);
  t.true(flights.outbound[0].stops);
  t.true(flights.outbound[0].price);
  t.end();
});
