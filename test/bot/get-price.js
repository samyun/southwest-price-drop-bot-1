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

  t.true(flights.outbound, 'flights.outbound');
  t.true(flights.outbound[0], 'flights.outbound[0]');
  if (flights.outbound[0])
  {  
    t.true(flights.outbound[0].number, 'flights.outbound[0].number');
    t.true(flights.outbound[0].stops, 'flights.outbound[0].stops');
    t.true(flights.outbound[0].price, 'flights.outbound[0].price');
  }
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

  t.true(flights.outbound, 'flights.outbound');
  t.true(flights.outbound[0], 'flights.outbound[0]');
  if (flights.outbound[0])
  {  
    t.true(flights.outbound[0].number, 'flights.outbound[0].number');
    t.true(flights.outbound[0].stops, 'flights.outbound[0].stops');
    t.true(flights.outbound[0].price, 'flights.outbound[0].price');
  }
  t.end();
});

test('getFlights fake FROM airport', async t => {
  const tomorrow = (new Date()).setDate((new Date()).getDate() + 1);
  const args = {
    from: 'FOO',
    to: 'CLE',
    departDate: tomorrow
  };
  const flights = await getFlights(args);

  t.true(!Array.isArray(flights.outbound) || !flights.outbound.length, 'flights.outbound');
  t.end();
});

test('getFlights fake TO airport', async t => {
  const tomorrow = (new Date()).setDate((new Date()).getDate() + 1);
  const args = {
    from: 'SEA',
    to: 'FOO',
    departDate: tomorrow
  };
  const flights = await getFlights(args);

  t.true(!Array.isArray(flights.outbound) || !flights.outbound.length, 'flights.outbound');
  t.end();
});

test('getFlights previous date', async t => {
  const yesterday = (new Date()).setDate((new Date()).getDate() - 2);
  const args = {
    from: 'SEA',
    to: 'CLE',
    departDate: yesterday
  };
  const flights = await getFlights(args);

  t.true(!Array.isArray(flights.outbound) || !flights.outbound.length, 'flights.outbound');
  t.end();
});
