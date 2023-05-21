import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Point from 'ol/geom/Point.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';
import WebGLPointsLayer from 'ol/layer/WebGLPoints.js';
import XYZ from 'ol/source/XYZ.js';
import {fromLonLat} from 'ol/proj.js';

const key = 'Get your own API key at https://www.maptiler.com/cloud/';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

const map = new Map({
  layers: [
    new TileLayer({
      source: new XYZ({
        attributions: attributions,
        url:
          'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=' + key,
        tileSize: 512,
      }),
    }),
  ],
  target: document.getElementById('map'),
  view: new View({
    center: [0, 4000000],
    zoom: 2,
  }),
});

const oldColor = [255, 160, 110];
const newColor = [180, 255, 200];
const size = 16;

const style = {
  variables: {
    filterShape: 'all',
  },
  filter: [
    'any',
    ['==', ['var', 'filterShape'], 'all'],
    ['==', ['var', 'filterShape'], ['get', 'shape']],
  ],
  symbol: {
    symbolType: 'image',
    src: 'data/ufo_shapes.png',
    size: size,
    color: [
      'interpolate',
      ['linear'],
      ['get', 'year'],
      1950,
      oldColor,
      2013,
      newColor,
    ],
    rotateWithView: false,
    offset: [0, 0],
    textureCoord: [
      'match',
      ['get', 'shape'],
      'light',
      [0, 0, 0.25, 0.5],
      'sphere',
      [0.25, 0, 0.5, 0.5],
      'circle',
      [0.25, 0, 0.5, 0.5],
      'disc',
      [0.5, 0, 0.75, 0.5],
      'oval',
      [0.5, 0, 0.75, 0.5],
      'triangle',
      [0.75, 0, 1, 0.5],
      'fireball',
      [0, 0.5, 0.25, 1],
      [0.75, 0.5, 1, 1],
    ],
  },
};

const shapeSelect = document.getElementById('shape-filter');
shapeSelect.addEventListener('input', function () {
  style.variables.filterShape = shapeSelect.value;
  map.render();
});
function fillShapeSelect(shapeTypes) {
  Object.keys(shapeTypes)
    .sort(function (a, b) {
      return shapeTypes[b] - shapeTypes[a];
    })
    .forEach(function (shape) {
      const option = document.createElement('option');
      const sightings = shapeTypes[shape];
      option.text = `${shape} (${sightings} sighting${
        sightings === 1 ? '' : 's'
      })`;
      option.value = shape;
      shapeSelect.appendChild(option);
    });
}

const client = new XMLHttpRequest();
client.open('GET', 'data/csv/ufo_sighting_data.csv');
client.addEventListener('load', function () {
  const csv = client.responseText;
  // key is shape name, value is sightings count
  const shapeTypes = {};
  const features = [];

  let prevIndex = csv.indexOf('\n') + 1; // scan past the header line
  let curIndex;
  while ((curIndex = csv.indexOf('\n', prevIndex)) !== -1) {
    const line = csv.substring(prevIndex, curIndex).split(',');
    prevIndex = curIndex + 1;

    const coords = [parseFloat(line[5]), parseFloat(line[4])];
    const shape = line[2];
    shapeTypes[shape] = (shapeTypes[shape] || 0) + 1;

    features.push(
      new Feature({
        datetime: line[0],
        year: parseInt(/[0-9]{4}/.exec(line[0])[0], 10), // extract the year as int
        shape: shape,
        duration: line[3],
        geometry: new Point(fromLonLat(coords)),
      })
    );
  }
  shapeTypes['all'] = features.length;
  map.addLayer(
    new WebGLPointsLayer({
      source: new VectorSource({
        features: features,
        attributions: 'National UFO Reporting Center',
      }),
      style: style,
    })
  );
  fillShapeSelect(shapeTypes);
});
client.send();

const info = document.getElementById('info');
map.on('pointermove', function (evt) {
  if (map.getView().getInteracting() || map.getView().getAnimating()) {
    return;
  }
  const text = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    const datetime = feature.get('datetime');
    const duration = feature.get('duration');
    const shape = feature.get('shape');
    return `On ${datetime}, lasted ${duration} seconds and had a "${shape}" shape.`;
  });
  info.innerText = text || '';
});
