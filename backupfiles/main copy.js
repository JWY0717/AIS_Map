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

const goem = [14363620.688750563, 4174472.488498304]; // 마커의 초기 위치 좌표
const marker = new Marker(goem, map); // Marker 인스턴스 생성

map.addLayer(
  new VectorLayer({
    source: new VectorSource({
      features: [marker.getFeature()], // marker의 feature를 사용하여 VectorSource 생성
    }),
  })
);

function animateMarker() {
  const sog = 10; // 노트 단위의 속도
  const cog = 30; // AIS 신호에서 수신된 방향 정보

  marker.updatePosition(sog, cog, map);

  requestAnimationFrame(animateMarker);
}

animateMarker();
