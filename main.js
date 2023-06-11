import 'ol/ol.css';
import { Map as Omap } from 'ol';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Marker from './src/Marker';
import proto from './src/proto2'
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
    enableRotation: false, 
  }),
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
});
map.addLayer(vectorLayer);

const markers = new Map();
markers.set(1, new Marker(
  'Bogol-E', 100, 75, 75, 500, 14363620, 4158752, Date.now(), map, vectorSource));

(async function initializeShips() {
  try {
    const response = await axios.get('http://58.78.120.69/aisdata');
    const ships = response.data;
    const now = Date.now();
    ships.forEach((ais) => {
      ais.time = now; // 서버랑 싱크가 안맞음
      markers.set(ais.mmsi, new Marker(
        ais.shipname || "unKnown", ais.shiptype, ais.trueheading, ais.cog, ais.sog,
        ais.posx, ais.posy, ais.time, map, vectorSource));
    });
  } catch (error) {
    console.error(error);
  }
})();

function animateMarkers() {
  let nowTime = Date.now();
  markers.forEach(marker => {
    if (vectorSource.getFeatures().includes(marker.feature)) {
      marker.updatePosition(nowTime);
    }
  })
}

let animationPaused = true;
// map.on('postcompose', animateMarkers);

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
  if (zoomLevel <= 15) {
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

const chatbox = document.getElementById('chatbox');
function scrollToBottom() {
  chatbox.scrollTop = chatbox.scrollHeight;
}

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
      if (markers.has(key)) {
        let marker = markers.get(key);
        if (ais.shipName != '' && marker.unKnown) {
          marker.shipName.setText(ais.shipName);
          chatbox.innerHTML += '<p class="highlight">' + `[${key}]${ais.shipName}이름 수신` + '</p>';
          scrollToBottom();
        }
        marker.updateMarker(ais.trueheading, ais.cog, ais.sog, Date.now())
        marker.feature.getGeometry().setCoordinates([ais.posX, ais.posY]);
        chatbox.innerHTML += '<p>' + `${marker.shipName.getText()} [${key}] 갱신...` + '</p>';
        scrollToBottom();
      } else {
        markers.set(key, new Marker(
          ais.shipName || "unKnown", ais.shipTye, ais.trueHeading, ais.cog, ais.sog,
          ais.posX, ais.posY, Date.now(), map, vectorSource));
        if (ais.shipName = '') markers.get(key).unKnown = true;
        chatbox.innerHTML += '<p class="highlight">' + `${ais.shipName || 'UnKnown'}새롭게 포착!!!!!!` + '</p>';
        scrollToBottom();
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
