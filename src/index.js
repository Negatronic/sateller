import * as constants from './constants.js';

import { jday, invjday } from './ext.js';
import twoline2satrec from './io.js';
import { propagate, sgp4, gstime } from './propagation.js';

import dopplerFactor from './dopplerFactor.js';

import {
  radiansToDegrees,
  degreesToRadians,
  degreesLat,
  degreesLong,
  radiansLat,
  radiansLong,
  geodeticToEcf,
  eciToGeodetic,
  eciToEcf,
  ecfToEci,
  ecfToLookAngles,
} from './transforms.js';

import { getSatelliteInfo } from './satDish.js';

export {
  constants,
  // Propagation
  propagate,
  sgp4,
  twoline2satrec,
  gstime,
  jday,
  invjday,
  dopplerFactor,
  // Coordinate transforms
  radiansToDegrees,
  degreesToRadians,
  degreesLat,
  degreesLong,
  radiansLat,
  radiansLong,
  geodeticToEcf,
  eciToGeodetic,
  eciToEcf,
  ecfToEci,
  ecfToLookAngles,
};

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

// console.log(getSatelliteInfo(tle, 1642200201487));
