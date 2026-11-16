const BASE = [
  ['800001','AIC101',28.61,77.21,10200,218,240,'India'],
  ['800002','IGO242',27.17,78.01,9800,240,135,'India'],
  ['800003','VTI806',26.85,80.95,11000,255,295,'India'],
  ['800004','AXB512',29.15,75.72,8200,195,85,'India'],
  ['800005','IGO734',25.61,85.14,9500,205,310,'India'],
  ['800006','AIC423',30.34,78.02,11200,260,190,'India'],
  ['800007','VTI390',26.45,79.75,8900,220,55,'India'],
  ['800008','IGO618',28.03,81.15,10500,245,270,'India'],
];
export function demoAircraft(now = new Date()) {
 const t=now.getTime()/60000;
 return BASE.map(([icao24,callsign,lat,lon,altitude,velocity,heading,originCountry],i)=>({
  icao24,callsign,originCountry,
  latitude:lat + Math.sin(t/14+i)*0.16,
  longitude:lon + Math.cos(t/12+i)*0.2,
  altitude:altitude + Math.sin(t/8+i)*200,
  velocity,heading,onGround:false,observedAt:now.toISOString()
 }));
}
