import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { transform } from 'ol/proj';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Feature from 'ol/Feature';
import { Point } from 'ol/geom';
import { RegularShape, Style, Fill, Stroke } from 'ol/style';
import Icon from 'ol/style/Icon';

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

const speed = 20; // 노트 단위의 속도
const direction = 30; // AIS 신호에서 수신된 방향 정보

const marker = new Feature({
  geometry: new Point([14363620.688750563, 4174472.488498304]),
});

const markerStyle = new Style({
  image: new Icon({
    src: './mark.svg',
    scale: calculateMarkerScale(map.getView().getZoom()),
    rotation: direction * (Math.PI / 180), // 회전 각도 (라디안으로 변환)
    rotateWithView: true, // 뷰의 회전에 따라 도형도 회전할지 여부
    anchor: [0.5, 1], // 이미지의 앵커 지점
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
  }),
});

marker.setStyle(markerStyle);

map.addLayer(
  new VectorLayer({
    source: new VectorSource({
      features: [marker],
    }),
  })
);

function calculatePixelDistance(speed) {
  const view = map.getView();
  const resolution = view.getResolution();
  const dpi = 25.4 / 0.28; // 1 inch = 0.28mm, 1 inch = 25.4mm
  const metersPerUnit = view.getProjection().getMetersPerUnit();
  const meterDistance = (speed * metersPerUnit * resolution) / dpi;
  const pixelDistance = meterDistance / resolution;
  return pixelDistance;
}

function calculateMarkerScale(zoom) {
  // 줌 레벨에 따라 비선형적인 크기 계산
  const baseScale = 0.02; // 기본 크기
  const minZoom = 8; // 최소 줌 레벨
  const maxZoom = 19; // 최대 줌 레벨
  const scaleRatio = 1.35; // 크기 비율 계수

  // 줌 레벨에 따라 크기 계산
  const zoomLevel = Math.max(minZoom, Math.min(maxZoom, zoom));
  const scaleFactor = Math.pow(scaleRatio, zoomLevel - minZoom);
  let scale = baseScale * scaleFactor;

  // 최소 크기와 최대 크기 제한
  const minScale = 0.1; // 최소 크기
  const maxScale = 0.5; // 최대 크기
  scale = Math.max(minScale, Math.min(maxScale, scale));

  return scale;
}

function animateMarker() {
  const coordinates = marker.getGeometry().getCoordinates();

  const pixelDistance = calculatePixelDistance(speed);

  const angleRad = (450 - direction) * (Math.PI / 180); // 방향 각도를 라디안으로 변환
  const deltaX = Math.cos(angleRad) * pixelDistance;
  const deltaY = Math.sin(angleRad) * pixelDistance;
  const newPosition = [coordinates[0] + deltaX, coordinates[1] + deltaY];

  marker.getGeometry().setCoordinates(newPosition);

  // 업데이트된 축척에 따라 마크의 크기 재조정
  const currentZoom = map.getView().getZoom();
  markerStyle.getImage().setScale(calculateMarkerScale(currentZoom));

  requestAnimationFrame(animateMarker);
}

animateMarker();
