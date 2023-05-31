import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { transform } from 'ol/proj';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Marker from './Marker';
import proto from './proto2'

const extent = [13967488.396764, 3840850.295080, 14482255.536724, 4668126.023685];
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

const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vectorSource,
});
map.addLayer(vectorLayer);

const markers = new Array(new Marker(
  'Bogol-E', 100, 150, 500, 14363620, 4171752, Date.now(), map, vectorSource
));

const mkey = new Set([0]);


function animateMarkers() {
  let nowTime = Date.now();
  for (let key of mkey) {
    const marker = markers[key]
    marker.updatePosition(marker.sog, marker.cog, nowTime);
  }
}
map.on('postcompose', animateMarkers);
let animationPaused = false;


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

const debouncedEventHandler = debounce(function (event) {
  const zoomLevel = map.getView().getZoom();
  for (let key of mkey) {
    markers[key].updateSize(zoomLevel)
  }

  if (zoomLevel <= 12) {
    if (!animationPaused) {
      animationPaused = true;
      map.un('postcompose', animateMarkers);
      for (let key of mkey) {
        markers[key].style.getText().getFill().setColor('rgba(0, 0, 0, 0)');
      }
    }
  } else {
    if (animationPaused) {
      map.on('postcompose', animateMarkers);
      animationPaused = false;
      for (let key of mkey) {
        let marker = markers[key]
        marker.style.getText().getFill().setColor(marker.stroke);
      }
    }
  }
}, 200);

map.getView().on('change:resolution', debouncedEventHandler);


const AIS_SERVER = "ws://192.168.219.107:9001"
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

      if (mkey.has(key)) {
        markers[key].updateMarker(ais.cog, ais.sog, Date.now())
        markers[key].feature.getGeometry().setCoordinates([ais.posX, ais.posY]);
      } else {
        mkey.add(key)
        markers[key] = new Marker(
          ais.shipName, ais.shipType, ais.cog, ais.sog,
          ais.posX, ais.posY, Date.now(), map, vectorSource)
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
