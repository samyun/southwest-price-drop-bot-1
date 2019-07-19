const dateFormat = require('dateformat');
const cloneDeep = require('lodash/cloneDeep');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const V = require('victory');

const e = React.createElement;

const Theme = cloneDeep(V.VictoryTheme.grayscale);
Theme.axis.style.tickLabels.fontFamily = `'PT Sans', 'sans-serif'`;
Theme.axis.style.ticks.stroke = Theme.axis.style.axis.stroke;
Theme.axis.style.ticks.size = 5;
Theme.line.style.labels.fontFamily = `'PT Sans', 'sans-serif'`;

function render (alert) {
  const data = cloneDeep(alert.priceHistory);

  // hack to show graph if there is only one data point
  if (data.length === 1) {
    data.push(cloneDeep(data[0]));
    data[1].time = data[0].time + 1;
  }

  const times = data.map(d => d.time);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const maxPrice = Math.ceil(Math.max(...data.map(d => d.price)) / 50) * 50;

  const Graph = e('div', null,
    e(V.VictoryChart, {
      domainPadding: 20,
      padding: { top: 10, right: 50, bottom: 50, left: 60 },
      theme: Theme
    },
    e(V.VictoryAxis, {
      domainPadding: 0,
      tickFormat: date => dateFormat(new Date(date), 'm/d', true)
    }),
    e(V.VictoryAxis, {
      crossAxis: false,
      dependentAxis: true,
      domain: [ 0, maxPrice ],
      tickFormat: tick => ((alert.isPointsBooking) ? '' : '$') + tick
    }),
    e(V.VictoryLine, {
      data,
      labels: ['Tracked\nprice'],
      x: 'time',
      y: 'price'
    }),
    e(V.VictoryLine, {
      data: [
        [ minTime, alert.price ],
        [ maxTime, alert.price ]
      ],
      labels: ['Alert\nprice'],
      style: {
        data: {
          stroke: '#d5152e',
          strokeDasharray: '5,5'
        },
        labels: {
          fill: '#d5152e'
        }
      },
      x: 0,
      y: 1
    })
    )
  );

  return ReactDOMServer.renderToStaticMarkup(Graph);
}

module.exports = render;
