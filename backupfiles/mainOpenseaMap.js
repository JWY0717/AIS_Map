import 'ol/ol.css';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { transform, transformExtent } from 'ol/proj';
import WMTS from 'ol/source/WMTS';
import { get as getProjection } from 'ol/proj';
import { getTopLeft, getWidth } from 'ol/extent';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import XYZ from 'ol/source/XYZ';

import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Marker from './Marker';

const extent = [13967488.396764, 3840850.295080, 14482255.536724, 4668126.023685];
// 대한민국 남한의 경계 좌표 범위 (EPSG:3857)

const apiKey = '936EAC2E348116FCE2E661F2D';
const resolutions = [
  156543.03392804097,
  78271.51696402048,
  39135.75848201024,
  19567.87924100512,
  9783.93962050256,
  4891.96981025128,
  2445.98490512564,
  1222.99245256282,
  611.49622628141,
  305.748113140705,
  152.8740565703525,
  76.43702828517625,
  38.218514142588134,
  19.109257071294067,
  9.554628535647034,
  4.777314267823517,
  2.3886571339117584,
  1.1943285669558792,
  0.5971642834779396,
  0.29858214173896974,
];
const matrixIds = new Array(resolutions.length);
for (let z = 0; z < resolutions.length; ++z) {
  matrixIds[z] = z;
}
const tileGrid = new WMTSTileGrid({
  origin: getTopLeft(extent),
  resolutions: resolutions,
  matrixIds: matrixIds,
});

// WMTS 소스 생성
const wmtsSource = new WMTS({
  url: `http://www.khoa.go.kr/oceanmap/${apiKey}/BASEMAP_3857/{z}/{x}/{y}/basemapWMTS.do&version=2`,
  layer: 'BASEMAP_3857',
  matrixSet: 'EPSG:3857',
  format: 'image/png',
  tileGrid: tileGrid,
});

// 지도 생성
const map = new Map({
  layers: [
    new TileLayer({
      source: wmtsSource,
    }),
  ],
  target: 'map',
  view: new View({
    center: transform([129.0306, 35.0779], 'EPSG:4326', 'EPSG:3857'),
    zoom: 15,
    maxZoom: 19,
    minZoom: 8,
    extent: transformExtent(extent, 'EPSG:3857', 'EPSG:3857'),
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
while (markerData.length < 1900) {
  let fakeShip = {
    goem: [14513620.688750563 - Math.random() * 550000, 4388472.488498304 - Math.random() * 400000],
    sog: Math.random() * 50,
    cog: Math.random() * 360
  }
  markerData.push(fakeShip);
}
while (markerData.length < 2000) {
  let fakeShip = {
    goem: [14364120.688750563 - Math.random() * 10, 4173772.488498304 - Math.random() * 10],
    sog: Math.random() * 500,
    cog: Math.random() * 360
  }
  markerData.push(fakeShip);
}
const markers = markerData.map(data => new Marker(data.goem, data.sog, data.cog, map));
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
    if (!animationRequestId) {
      animateMarkers();
      markers.forEach(marker => {
        marker.style.getText().getFill().setColor('rgba(255, 0, 0, 1)'); 
      });
    }
  }
});

