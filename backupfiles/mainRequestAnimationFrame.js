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
    center: transform([129.0306, 35.0579], 'EPSG:4326', 'EPSG:3857'),
    zoom: 14,
    maxZoom: 20,
    minZoom: 8,
    extent: extent,
  }),
});

let startTime = Date.now()
const markerData = [];

function makeFakeShip ( right, up, count, reange) {
  for (let i =0 ; i<count; i++) {
    let fakeShip = {
      goem: [ 14363620.688750563 + right - Math.random() * reange, 4171752.3092421135 + up - Math.random() * reange ],
      sog: Math.random() * 30,
      cog: Math.random() * 360,
      time: startTime
    }
    markerData.push(fakeShip)
  }
}
makeFakeShip(1500,2000,10,1000)
makeFakeShip(2900,1000,20,3000)
makeFakeShip(2000,-2000,50,4000)
makeFakeShip(-1000,-2000,50,4000)
makeFakeShip(6000,-1000,50,4000)
makeFakeShip(120000,350000,3000, 600000)

const markers = markerData.map(data => new Marker(data.goem, data.sog*10, data.cog, map, data.time));

const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vectorSource,
});

markers.forEach((marker) => {
  const feature = marker.getFeature();
  vectorSource.addFeature(feature);
});
map.addLayer(vectorLayer);

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

