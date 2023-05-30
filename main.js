import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { transform } from 'ol/proj';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Marker from './Marker';

const extent = [13967488.396764, 3840850.295080, 14482255.536724, 4668126.023685];
// 대한민국 남한의 경계 좌표 범위 (EPSG:3857)

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    center: transform([129.0306, 35.0779], 'EPSG:4326', 'EPSG:3857'),
    zoom: 14,
    maxZoom: 20,
    minZoom: 8,
    extent: extent,
  }),
});

let startTime = Date.now()
const markerData = [
  { goem: [14363620.688750563, 4174472.488498304], sog: 20, cog: 140, time: startTime },
  { goem: [14363320.688750563, 4174772.488498304], sog: 10, cog: 20, time: startTime },
  { goem: [14363020.688750563, 4174072.488498304], sog: 15, cog: 60, time: startTime },
  { goem: [14364120.688750563, 4173772.488498304], sog: 10, cog: 10, time: startTime },
  { goem: [14364320.688750563, 4172772.488498304], sog: 40, cog: 340, time: startTime },
  { goem: [14366620.688750563, 4172772.488498304], sog: 50, cog: 290, time: startTime },
];
while (markerData.length < 1900) {
  let fakeShip = {
    goem: [14513620.688750563 - Math.random() * 550000, 4388472.488498304 - Math.random() * 400000],
    sog: Math.random() * 50,
    cog: Math.random() * 360,
    time: startTime
  }
  markerData.push(fakeShip);
}
while (markerData.length < 2000) {
  let fakeShip = {
    goem: [14364120.688750563 - Math.random() * 10, 4173772.488498304 - Math.random() * 10],
    sog: Math.random() * 500,
    cog: Math.random() * 360,
    time: startTime
  }
  markerData.push(fakeShip);
}
while (markerData.length < 2100) {
  let fakeShip = {
    goem: [14363120.688750563 - Math.random() * 10, 4172772.488498304 - Math.random() * 10],
    sog: Math.random() * 500,
    cog: Math.random() * 360,
    time: startTime
  }
  markerData.push(fakeShip);
}
while (markerData.length < 2200) {
  let fakeShip = {
    goem: [14365120.688750563 - Math.random() * 10, 4172772.488498304 - Math.random() * 10],
    sog: Math.random() * 500,
    cog: Math.random() * 360,
    time: startTime
  }
  markerData.push(fakeShip);
}

const markers = markerData.map(data => new Marker(data.goem, data.sog, data.cog, map, data.time));
markers.forEach((marker) => {
  map.addLayer(
    new VectorLayer({
      source: new VectorSource({
        features: [marker.getFeature()],
      }),
    })
  );
});

let animationRequestId
function animateMarkers() {
  let nowTime = Date.now();
  markers.forEach(marker => marker.updatePosition(marker.sog, marker.cog, nowTime));
  animationRequestId = requestAnimationFrame(animateMarkers);
}
animateMarkers()

// 디바운스
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const debouncedEventHandler = debounce(function(event) {
  const zoomLevel = map.getView().getZoom();
  markers.forEach(marker => marker.updateSize(map));

  if (zoomLevel <= 12) {
    if (animationRequestId) {
      cancelAnimationFrame(animationRequestId);
      animationRequestId = undefined;
      markers.forEach(marker => {
        marker.style.getText().getFill().setColor('rgba(0, 0, 0, 0)');
      });
    }
  } else {
    if (!animationRequestId) {
      animateMarkers();
      markers.forEach(marker => {
        marker.style.getText().getFill().setColor(marker.stroke);
      });
    }
  }
}, 200); 

map.getView().on('change:resolution', debouncedEventHandler);

