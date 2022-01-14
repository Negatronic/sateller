import { twoline2satrec } from './index.js';
import { gstime, propagate } from './propagation.js';
import {
  ecfToEci,
  eciToEcf,
  eciToGeodetic,
  degreesLong,
  degreesLat,
  ecfToLookAngles,
  degreesToRadians,
  radiansToDegrees,
} from './transforms.js';

const earthRadius = 6371;
const aGSO = 42164;
import { cross, dot } from 'mathjs';

/*Returns lattitude and longitude of satellite, requires NASA TLE format
    const tle = {
    '@id': 'https://tle.ivanstanojevic.me/api/tle/25544',
    '@type': 'TleModel',
    satelliteId: 25544,
    name: 'INTELSAT 1002',
    date: '2021-12-29T08:27:53+00:00',
    line1:
        '1 37748U 11035A   21363.56021681 -.00000083  00000-0  00000-0 0  9995',
    line2:
        '2 37748   0.0170   4.5143 0002581 269.7569 282.6272  1.00271132 38250',
    };
*/
export function getSubSatellitePoint(tle, optionalTimestamp = Date.now()) {
  //Must parse TLE before going to satrec
  // Initilization of satrec
  const satrec = twoline2satrec(tle.line1, tle.line2);

  // Set time
  const dateObj = new Date(optionalTimestamp);
  const gmst = gstime(dateObj);

  // Propagate SGP4
  const positionAndVelocity = propagate(satrec, dateObj);

  // Get ECF
  const positionEcf = eciToEcf(positionAndVelocity.position, gmst);
  const positionGd = eciToGeodetic(positionAndVelocity.position, gmst);

  // Geodetic coords
  const { longitude, latitude } = positionGd;

  const subSatPoint = {
    latitude: degreesLat(latitude),
    longitude: degreesLong(longitude),
  };
  return subSatPoint;
}

/* Returns dish azimuth, look elevation, lnb skew, and if dish is visibile
  requires TLE format from NASA TLE, station latitude!, longitude!, height!, and horizon! (! =  optional, pulls wichita lat,long and standard 5 degree look angle)

*/
// export function getEarthStationToSat(
//   tle,
//   earthSationLat = 37.70908452408451,
//   earthSationLong = -97.42761611938478,
//   earthStationHeight = 0.411,
//   lookhorizon = 5
// ) {
//   const subSatPoint = getSubSatellitePoint(tle).longitude;
//   const earthSationLatRad = (earthSationLat * Math.PI) / 180;
//   const earthSationLongRad = (earthSationLong * Math.PI) / 180;
//   const subSatPointRad = (subSatPoint * Math.PI) / 180;
//   const lookhorizonRad = ((90 + lookhorizon) * Math.PI) / 180;

//   //Calculate Azimuth
//   const angleB = earthSationLongRad - subSatPointRad;
//   const angleb = Math.acos(Math.cos(angleB) * Math.cos(earthSationLatRad));
//   const angleA = Math.asin(Math.sin(Math.abs(angleB)) / Math.sin(angleb));
//   let dishAzimuth = 0;
//   switch (true) {
//     case earthSationLat < 0 && angleB < 0:
//       dishAzimuth = angleA;
//       break;
//     case earthSationLat < 0 && angleB > 0:
//       dishAzimuth = 360 - (angleA * 180) / Math.PI;
//       break;
//     case earthSationLat > 0 && angleB < 0:
//       dishAzimuth = 180 - (angleA * 180) / Math.PI;
//       break;
//     case earthSationLat > 0 && angleB > 0:
//       dishAzimuth = 180 + (angleA * 180) / Math.PI;
//       break;
//   }
//   //calculate Elevation
//   const rangeD = Math.sqrt(
//     Math.pow(earthRadius, 2) +
//       Math.pow(aGSO, 2) -
//       2 * earthRadius * aGSO * Math.cos(angleb)
//   );
//   const dishElevation =
//     (Math.acos((aGSO / rangeD) * Math.sin(angleb)) * 180) / Math.PI;

//   //Calculate LNB skew (polarization)
//   const earthStationVectorX =
//     earthRadius * Math.cos(earthSationLatRad) * Math.cos(angleB);
//   const earthStationVectorY =
//     earthRadius * Math.cos(earthSationLatRad) * Math.sin(angleB);
//   const earthStationVectorZ = earthRadius * Math.sin(earthSationLatRad);
//   //r
//   const localGravDirection = [
//     -earthStationVectorX,
//     -earthStationVectorY,
//     -earthStationVectorZ,
//   ];

//   //k
//   const propDirection = [
//     earthStationVectorX - aGSO,
//     earthStationVectorY,
//     earthStationVectorZ,
//   ];

//   //e
//   const polarVector = [0, 0, 1];

//   //f= k X r (k cross r)
//   const vectorCrossF = cross(propDirection, localGravDirection);

//   //Mag of f
//   const magF = Math.sqrt(
//     Math.pow(vectorCrossF[0], 2) +
//       Math.pow(vectorCrossF[1], 2) +
//       Math.pow(vectorCrossF[2], 2)
//   );

//   //g = k x e (k cross e)
//   const vectorCrossG = cross(propDirection, polarVector);

//   //h = g x k (g cross k)
//   const vectorCrossH = cross(vectorCrossG, propDirection);

//   //Mag of h
//   const magH = Math.sqrt(
//     Math.pow(vectorCrossH[0], 2) +
//       Math.pow(vectorCrossH[1], 2) +
//       Math.pow(vectorCrossH[2], 2)
//   );

//   //p = h/|h|
//   const unitPolVector = [
//     vectorCrossH[0] / magH,
//     vectorCrossH[1] / magH,
//     vectorCrossH[2] / magH,
//   ];

//   //p*f (p dot f)
//   const pDotF = dot(unitPolVector, vectorCrossF);

//   let lnbSkew = (Math.asin(pDotF / magF) * 180) / Math.PI;

//   //Calculate limits of visibility
//   const visAngleS = Math.asin((earthRadius / aGSO) * Math.sin(lookhorizonRad));
//   const visAngleb = 1 * Math.PI - lookhorizonRad - visAngleS;
//   const visAngleB = Math.acos(
//     Math.cos(visAngleb) / Math.cos(earthSationLatRad)
//   );
//   const visLimitEast = earthSationLong + (visAngleB * 180) / Math.PI;
//   const visLimitWest = earthSationLong - (visAngleB * 180) / Math.PI;

//   let satVis = false;
//   if (visLimitWest <= subSatPoint && subSatPoint <= visLimitEast) {
//     satVis = true;
//   }

//   //Calculate Height of Satellite from Earth, and range from location

//   const observerGd = {
//     latitude: earthSationLatRad,
//     longitude: earthSationLongRad,
//     height: earthStationHeight,
//   };

//   //round for readibility
//   const dishAzimuthRound = dishAzimuth.toFixed(1);
//   const dishElevationRound = dishElevation.toFixed(1);
//   const lnbSkewRound = lnbSkew.toFixed(1);

//   return {
//     dishAzimuth: dishAzimuthRound,
//     dishElevation: dishElevationRound,
//     lnbSkew: lnbSkewRound,
//     satVis,
//   };
// }

export function getSatelliteInfo(
  tle,
  optionalTimestamp = Date.now(),
  optionalObserverLat = 37.70908452408451,
  optionalObserverLong = -97.42761611938478,
  optionalObserverHeight = 0.411,
  lookhorizon = 5
) {
  // Initilization of satrec
  const satrec = twoline2satrec(tle.line1, tle.line2);

  // Set time for GMST transforms
  const dateObj = new Date(optionalTimestamp);
  const gmst = gstime(dateObj);

  // Propagate SGP4
  const positionAndVelocity = propagate(satrec, dateObj);

  // The position_velocity result is a key-value pair of ECI coordinates.
  // These are the base results from which all other coordinates are derived.
  const positionEci = positionAndVelocity.position;
  const velocityEci = positionAndVelocity.velocity;

  // Set the observer position (in radians).
  const observerGd = {
    latitude: degreesToRadians(optionalObserverLat),
    longitude: degreesToRadians(optionalObserverLong),
    height: optionalObserverHeight,
  };

  // Get ECF, Geodetic, look angles
  const positionEcf = eciToEcf(positionAndVelocity.position, gmst);
  const positionGd = eciToGeodetic(positionAndVelocity.position, gmst);
  const lookAngles = ecfToLookAngles(observerGd, positionEcf);

  const velocityKmS = Math.sqrt(
    Math.pow(velocityEci.x, 2) +
      Math.pow(velocityEci.y, 2) +
      Math.pow(velocityEci.z, 2)
  );

  const { azimuth, elevation, rangeSat } = lookAngles;

  // Geodetic coords
  const { longitude, latitude, height } = positionGd;

  /* Calculate LNB Skew (polarization)*/

  //initial angles
  const angleB = observerGd.longitude - longitude;

  //Initial vecotrs
  const earthStationVectorX =
    earthRadius * Math.cos(observerGd.latitude) * Math.cos(angleB);
  const earthStationVectorY =
    earthRadius * Math.cos(observerGd.latitude) * Math.sin(angleB);
  const earthStationVectorZ = earthRadius * Math.sin(observerGd.latitude);

  //r
  const localGravDirection = [
    -earthStationVectorX,
    -earthStationVectorY,
    -earthStationVectorZ,
  ];

  //k
  const propDirection = [
    earthStationVectorX - aGSO,
    earthStationVectorY,
    earthStationVectorZ,
  ];

  //e
  const polarVector = [0, 0, 1];

  //f= k X r (k cross r)
  const vectorCrossF = cross(propDirection, localGravDirection);

  //Mag of f
  const magF = Math.sqrt(
    Math.pow(vectorCrossF[0], 2) +
      Math.pow(vectorCrossF[1], 2) +
      Math.pow(vectorCrossF[2], 2)
  );

  //g = k x e (k cross e)
  const vectorCrossG = cross(propDirection, polarVector);

  //h = g x k (g cross k)
  const vectorCrossH = cross(vectorCrossG, propDirection);

  //Mag of h
  const magH = Math.sqrt(
    Math.pow(vectorCrossH[0], 2) +
      Math.pow(vectorCrossH[1], 2) +
      Math.pow(vectorCrossH[2], 2)
  );

  //p = h/|h|
  const unitPolVector = [
    vectorCrossH[0] / magH,
    vectorCrossH[1] / magH,
    vectorCrossH[2] / magH,
  ];

  //p*f (p dot f)
  const pDotF = dot(unitPolVector, vectorCrossF);

  const lnbSkew = (Math.asin(pDotF / magF) * 180) / Math.PI;

  // Calculate limit of visibility
  // Initialize horizon
  const lookhorizonRad = ((90 + lookhorizon) * Math.PI) / 180;

  const visAngleS = Math.asin((earthRadius / aGSO) * Math.sin(lookhorizonRad));
  const visAngleb = 1 * Math.PI - lookhorizonRad - visAngleS;
  const visAngleB = Math.acos(
    Math.cos(visAngleb) / Math.cos(positionGd.latitude)
  );

  const visLimitEast = positionGd.longitude + (visAngleB * 180) / Math.PI;
  const visLimitWest = positionGd.longitude - (visAngleB * 180) / Math.PI;

  let satVis = false;
  if (visLimitWest <= longitude && longitude <= visLimitEast) {
    satVis = true;
  }

  const output = {
    subSatLong: degreesLong(longitude),
    subSatLat: degreesLat(latitude),
    satRange: rangeSat,
    satHeight: height,
    satVelocity: velocityKmS,
    elevation: radiansToDegrees(elevation),
    azimuth: radiansToDegrees(azimuth),
    lnbSkew: lnbSkew,
    satVis,
  };
  return output;
}
