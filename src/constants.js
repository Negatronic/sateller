export const pi = Math.PI;
export const twoPi = pi * 2;
export const deg2rad = pi / 180.0;
export const rad2deg = 180 / pi;
export const minutesPerDay = 1440.0;
export const mu = 398600.5; // in km3 / s2
export const earthRadius = 6378.137; // in km
export const xke =
  60.0 / Math.sqrt((earthRadius * earthRadius * earthRadius) / mu);
export const vkmpersec = (earthRadius * xke) / 60.0;
export const tumin = 1.0 / xke;
export const j2 = 0.00108262998905;
export const j3 = -0.00000253215306;
export const j4 = -0.00000161098761;
export const j3oj2 = j3 / j2;
export const x2o3 = 2.0 / 3.0;
