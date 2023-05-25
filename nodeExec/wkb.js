// const wkx = require('wkx');
// const proj4 = require('proj4');

// const geom = '0101000020110F0000000000C0D2666B410000008079E54F41';

// const wkbBuffer = Buffer.from(geom, 'hex');
// const geometry = wkx.Geometry.parse(wkbBuffer);

// if (geometry && geometry.toGeoJSON) {
//   const { coordinates } = geometry.toGeoJSON(3857);
//   const [x, y] = coordinates;
//   const [longitude, latitude] = proj4('EPSG:3857', 'EPSG:4326', [x, y]);
//   console.log(latitude, longitude);
// } else {
//   console.log('Invalid geometry data');
// }

const wkx = require('wkx');

const geom = '0101000020110F0000000000C0D2666B410000008079E54F41';

const wkbBuffer = Buffer.from(geom, 'hex');
const geometry = wkx.Geometry.parse(wkbBuffer);

if (geometry && geometry.toGeoJSON) {
  const { coordinates } = geometry.toGeoJSON();
  const [longitude, latitude] = coordinates;
  console.log(latitude, longitude);
} else {
  console.log('Invalid geometry data');
}
