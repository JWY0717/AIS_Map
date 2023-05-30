import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { transform } from 'ol/proj';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon, Text, Fill } from 'ol/style';

const svgShip = `
    <svg width="120" height="167" viewBox="0 0 120 167" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.117 152.487L60 16.282L108.883 152.487L63.0857 121.447L60 119.356L56.9143 121.447L11.117 152.487Z" fill="#0000FF" stroke="#000000" stroke-width="11"/>
    </svg>
    `;

class Marker {
  constructor(goem, sog, cog, map, time) {
    this.sog = sog;
    this.cog = cog;
    this.time = time;
    this.feature = new Feature({
      geometry: new Point(goem),
    });
    let svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgShip)}`
    let zoom = map.getView().getZoom();
    this.shipName = new Text({
      text: `21`,
      font: `bold 15px Tahoma`,
      fill: new Fill({ color: "#0000FF" }),
      offsetY: 20,
    });
    this.style = new Style({
      image: new Icon({
        src: svgUrl,
        scale: 0.2,
        rotation: cog * (Math.PI / 180),
        rotateWithView: true,
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
      }),
      text: this.shipName,
    });
    this.feature.setStyle(this.style);
  }

  getFeature() {
    return this.feature;
  }

  updateSize(map) {
    const currentZoom = map.getView().getZoom();
    this.style.getImage().setScale(this.calculateMarkerScale(currentZoom));
    this.shipName.setOffsetY(this.calculateOffsetY(currentZoom));
    this.shipName.setFont(this.caculateFontSize(currentZoom));
  }

  updatePosition(sog, cog, now) {
    const passTime = (now - this.time) / 1000; // 현재 시간과 마커의 시간 차이 (초 단위)
    const coordinates = this.feature.getGeometry().getCoordinates();
    const speed = sog * 1.60934 * 1000 / 3600; // 초당 이동 속도 (미터 기준)
    const distance = speed * passTime; // 이동해야 할 거리 (미터 기준)
    const angleRad = (90 - cog) * (Math.PI / 180);
    const deltaX = Math.cos(angleRad) * distance;
    const deltaY = Math.sin(angleRad) * distance;
    const newCoordinates = [coordinates[0] + deltaX, coordinates[1] + deltaY];
    this.feature.getGeometry().setCoordinates(newCoordinates);
    this.time = now;
  }
}

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

let startTime = Date.now()
const dumy_markerData = [
  { goem: [14363620.688750563, 4174472.488498304], sog: 100, cog: 140, time: startTime },
  { goem: [14363320.688750563, 4174772.488498304], sog: 100, cog: 20, time: startTime },
  { goem: [14363020.688750563, 4174072.488498304], sog: 100, cog: 60, time: startTime },
  { goem: [14364120.688750563, 4173772.488498304], sog: 100, cog: 10, time: startTime },
  { goem: [14364320.688750563, 4172772.488498304], sog: 100, cog: 340, time: startTime },
  { goem: [14366620.688750563, 4172772.488498304], sog: 100, cog: 290, time: startTime },
];
const markers = dumy_markerData.map(data => new Marker(data.goem, data.sog, data.cog, map, data.time));
markers.forEach((marker) => {
  map.addLayer(
    new VectorLayer({
      source: new VectorSource({
        features: [marker.getFeature()],
      }),
    })
  );
});
map.on('postcompose', animateMarkers);

function animateMarkers(event) {
  let nowTime = Date.now();
  markers.forEach(marker => marker.updatePosition(marker.sog, marker.cog, nowTime));
}