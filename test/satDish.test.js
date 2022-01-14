import { getSatelliteInfo } from '../src/satDish';

const tle = {
  '@id': 'https://tle.ivanstanojevic.me/api/tle/37748',
  '@type': 'TleModel',
  satelliteId: 37748,
  name: 'SES-3',
  date: '2021-12-29T13:26:42+00:00',
  line1:
    '1 37748U 11035A   21363.56021681 -.00000083  00000-0  00000-0 0  9995',
  line2:
    '2 37748   0.0170   4.5143 0002581 269.7569 282.6272  1.00271132 38250',
};

const result = {
  subSatLong: -103.01017236235867,
  subSatLat: -0.014597396612437133,
  satRange: 37340.067145862515,
  satHeight: 35784.008251050975,
  satVelocity: 3.074877168676312,
  elevation: 45.91187420045756,
  azimuth: 189.08347818241157,
  lnbSkew: 7.211063101637827,
  satVis: true,
};

describe('getSatelliteInfo', () => {
  test('tle Test', () => {
    expect(getSatelliteInfo(tle, 1642200201487)).toStrictEqual(result);
  });
});
