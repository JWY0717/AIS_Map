import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { transform } from 'ol/proj';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import * as PIXI from 'pixi.js';

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

// Pixi.js Application 생성
const app = new PIXI.Application();

// OpenLayers의 Map을 Pixi.js Application의 view로 설정
map.getViewport().appendChild(app.view);

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

class Marker {
  constructor(coordinates, sog, cog) {
    this.coordinates = coordinates;
    this.sog = sog;
    this.cog = cog;
    this.position = map.getPixelFromCoordinate(coordinates); // 수정된 부분

    this.container = new PIXI.Container();
    this.marker = new PIXI.Graphics();
    this.marker.beginFill(0xff0000);
    this.marker.drawCircle(0, 0, 5);
    this.marker.endFill();
    this.container.addChild(this.marker);
    this.text = new PIXI.Text('SOG: ' + this.sog.toFixed(2), {
      fontSize: 12,
      fill: 'rgba(255, 0, 0, 1)',
    });
    this.text.position.x = -15;
    this.text.position.y = -15;
    this.container.addChild(this.text);
    app.stage.addChild(this.container);
    this.updatePosition(this.sog, this.cog);
  }

  updatePosition(sog, cog) {
    this.sog = sog;
    this.cog = cog;
    const view = map.getView();
    const resolution = view.getResolution();
    const rotation = view.getRotation();
    const sin = Math.sin(-rotation);
    const cos = Math.cos(-rotation);
    const dx = this.sog * resolution * cos;
    const dy = this.sog * resolution * sin;
    this.position[0] += dx;
    this.position[1] += dy;
    const coordinate = map.getCoordinateFromPixel(this.position);
    this.coordinates = coordinate;
    this.container.position.x = this.position[0];
    this.container.position.y = this.position[1];
    this.text.text = 'SOG: ' + this.sog.toFixed(2);
  }
}


const markers = markerData.map(data => new Marker(data.goem, data.sog, data.cog));
markers.forEach(marker => {
  marker.updatePosition(marker.sog, marker.cog);
});
