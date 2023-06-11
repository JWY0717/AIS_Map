import 'ol/ol.css';
import { Map as Omap } from 'ol';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import axios from 'axios';
import debounce from 'lodash/debounce';
import Marker from './src/Marker';
import aisDecoder from './src/aisDecoder'

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
    center: [14377620, 4165752], //
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
    for (const ais of ships) {
      ais.time = now; // 서버랑 싱크가 안맞음
      markers.set(ais.mmsi, new Marker(
        ais.shipname, ais.shiptype, ais.trueheading, ais.cog, ais.sog,
        ais.posx, ais.posy, ais.time, map, vectorSource));
    };
  } catch (error) {
    console.error(error);
  }
})();

function animateMarkers() {
  let nowTime = Date.now();
  for (const [_, marker] of markers) {
    if (vectorSource.getFeatures().includes(marker.feature)) {
      marker.updatePosition(nowTime);
    }
  }
}

let animationPaused = true;
// map.on('postcompose', animateMarkers);

const debouncedZoomHandler = debounce(function () {
  const zoomLevel = map.getView().getZoom();
  for (const [_, marker] of markers) {
    marker.updateSize(zoomLevel);
  };

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

map.getView().on('change:resolution', debouncedZoomHandler);

const chatbox = document.getElementById('chatbox');
function scrollToBottom() {
  chatbox.scrollTop = chatbox.scrollHeight;
}

const AIS_SERVER = "ws://58.78.120.69:9001"
let socket;

function connectWebSocket() {
  socket = new WebSocket(AIS_SERVER);

  socket.binaryType = "arraybuffer";
  socket.onopen = function () {
    console.log("웹 소켓 연결이 열렸습니다.");
  };
  socket.onmessage = function (msg) {
    try {
      const ais = aisDecoder(msg.data);
      const key = ais.mmsi;
      if (markers.has(key)) {
        const marker = markers.get(key);
        if (ais.shipName != "" && marker.unKnown) {
          marker.shipName.setText(ais.shipName);
          chatbox.innerHTML += `<p class="highlight">[${key}]${ais.shipName}이름 수신!!</p>`;
          scrollToBottom();
        }
        marker.updateMarker(ais.trueheading, ais.cog, ais.sog, Date.now());
        marker.feature.getGeometry().setCoordinates([ais.posX, ais.posY]);
        chatbox.innerHTML += `<p>${marker.shipName.getText()} [${key}] 갱신...</p>`;
        scrollToBottom();
      } else {
        markers.set(
          key,
          new Marker(
            ais.shipName, ais.shipType, ais.trueHeading, ais.cog,
            ais.sog, ais.posX, ais.posY, Date.now(), map, vectorSource
          )
        );
        if (ais.shipName == "") markers.get(key).unKnown = true;
        chatbox.innerHTML += `<p class="highlight">${ais.shipName || "UnKnown"} 새롭게 포착!!!!!!</p>`;
        scrollToBottom();
      }
    } catch (error) {
      console.log(error);
    }
  };
  socket.onclose = function () {
    console.log("웹 소켓 연결이 닫혔습니다.");
    setTimeout(connectWebSocket, 1000);
  };
  socket.onerror = function (error) {
    console.error("웹 소켓 오류:", error);
    setTimeout(connectWebSocket, 1000);
  };
}
connectWebSocket();