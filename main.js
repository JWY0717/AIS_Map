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
    zoom: 15,
    maxZoom: 19,
    minZoom: 8,
    extent: extent,
  }),
});

const markerData = [
  { goem: [14363620.688750563, 4174472.488498304], sog: 20, cog: 140 },
  { goem: [14363320.688750563, 4174772.488498304], sog: 10, cog: 20 },
  { goem: [14363020.688750563, 4174072.488498304], sog: 15, cog: 60 },
  { goem: [14364120.688750563, 4173772.488498304], sog: 10, cog: 10 },
  { goem: [14364320.688750563, 4172772.488498304], sog: 40, cog: 340 },
  { goem: [14366620.688750563, 4172772.488498304], sog: 50, cog: 290 },
];

while (markerData.length < 2000) {
  let fakeShip = {
    goem: [14513620.688750563 - Math.random() * 550000, 4388472.488498304 - Math.random() * 400000],
    sog: Math.random() * 200,
    cog: Math.random() * 360
  }
  markerData.push(fakeShip);
}

const markers = markerData.map(data => new Marker(data.goem, data.cog, map));
markers.forEach((marker, index) => {
  map.addLayer(
    new VectorLayer({
      source: new VectorSource({
        features: [marker.getFeature()],
      }),
    })
  );
  marker.sog = markerData[index].sog;
  marker.cog = markerData[index].cog;
});

let animationRequestId
function animateMarkers() {
  markers.forEach(marker => marker.updatePosition(marker.sog, marker.cog, map));
  animationRequestId = requestAnimationFrame(animateMarkers);
}
animateMarkers()

map.getView().on('change:resolution', function (event) {
  var zoomLevel = map.getView().getZoom();

  if (zoomLevel <= 12) {
    if (animationRequestId) {
      cancelAnimationFrame(animationRequestId);
      animationRequestId = undefined;
      markers.forEach(marker => {
        marker.style.getText().getFill().setColor('rgba(0, 0, 0, 0)'); 
      });
    }
  } else {
    markers.forEach(marker => {
      marker.style.getText().setOffsetY(calculateOffsetY(zoomLevel));
    });
    if (!animationRequestId) {
      animateMarkers();
      markers.forEach(marker => {
        marker.style.getText().getFill().setColor('rgba(255, 0, 0, 1)'); 
      });
    }
  }
});

function calculateOffsetY(zoomLevel) {
  let offsetY = (zoomLevel-10)*4+4;
  const minScale = 5;
  const maxScale = 40;
  offsetY = Math.max(minScale, Math.min(maxScale, offsetY));
  return offsetY;
}
