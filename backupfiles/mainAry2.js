import 'ol/ol.css';
import { Map as Omap } from 'ol';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Marker from './Marker';
import proto from './proto2'
import axios from 'axios';

const extent = [13967488.396764, 3840850.295080, 14482255.536724, 4668126.023685];
const vectorSource = new VectorSource();
const map = new Omap({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    new VectorLayer({
      source: vectorSource
    })
  ],
  target: 'map',
  view: new View({
    center: [14377620, 4165752],
    zoom: 11.5,
    maxZoom: 20,
    minZoom: 8,
    extent: extent,
  }),
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
});
map.addLayer(vectorLayer);

const markers = new Array(new Marker(
  'Bogol-E', 100, 75, 75, 500, 14363620, 4158752, Date.now(), map, vectorSource));
const keys = new Set([0]);

(async function initializeShips() {
  try {
    const response = await axios.get('http://58.78.120.69/aisdata');
    const ships = response.data;
    ships.forEach((ais) => {
      markers[ais.mmsi] = new Marker(
        ais.shipname || "unKnown", ais.shipname, ais.trueheading, ais.cog, ais.sog,
        ais.posx, ais.posy, ais.time, map, vectorSource);
      keys.add(ais.mmsi);
    });
  } catch (error) {
    console.error(error);
  }
})();

function animateMarkers() {
  let nowTime = Date.now();
  for (let key of keys) {
    const marker = markers[key]
    marker.updatePosition(nowTime);
  }
}

let animationPaused = false;
map.on('postcompose', animateMarkers);

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const debouncedEventHandler = debounce(function (event) {
  const zoomLevel = map.getView().getZoom();
  markers.forEach(marker => {
    marker.updateSize(zoomLevel)
  })
  if (zoomLevel <= 11) {
    if (!animationPaused) {
      animationPaused = true;
      map.un('postcompose', animateMarkers);
    }
  } else {
    if (animationPaused) {
      animationPaused = false;
      map.on('postcompose', animateMarkers);
    }
  }
}, 200);
map.getView().on('change:resolution', debouncedEventHandler);

const AIS_SERVER = "ws://58.78.120.69:9001"
const socket = new WebSocket(AIS_SERVER);
socket.binaryType = "arraybuffer";
socket.onopen = function () {
  console.log("웹 소켓 연결이 열렸습니다.");
};
socket.onmessage = function (msg) {
  try {
    let buf = new Uint8Array(msg.data).buffer;
    if (buf.byteLength > 60) {
      const array1 = buf.slice(0, 4);
      let dateSize = new Uint32Array(array1)[0];
      const array3 = buf.slice(8, dateSize + 8);
      let realData = new Uint8Array(array3);
      let ais = proto.web_gis.AIS_BASE.decode(realData);
      let key = ais.mmsi;
      if (keys.has(key)) {
        markers[key].updateMarker(ais.trueheading, ais.cog, ais.sog, Date.now())
        markers[key].feature.getGeometry().setCoordinates([ais.posX, ais.posY]);
      } else {
        markers[key] = new Marker(
          ais.shipName || "unKnown", ais.shipType, ais.trueHeading, ais.cog, ais.sog,
          ais.posX, ais.posY, Date.now(), map, vectorSource);
        keys.add(ais.mmsi);
      }
    }
  } catch (error) {
    console.log(error);
  }
};
socket.onclose = function () {
  console.log("웹 소켓 연결이 닫혔습니다.");
};
socket.onerror = function (error) {
  console.error("웹 소켓 오류:", error);
};
