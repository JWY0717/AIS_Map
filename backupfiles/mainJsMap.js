import 'ol/ol.css';
import { Map as Omap } from 'ol';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Marker from './Marker';
import proto from './proto2'

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

const markers = new Map();

markers.set(1, new Marker(
  'Bogol-E', 100, 75, 75, 500, 14363620, 4158752, Date.now(), map, vectorSource))


function makeFakeShip(right, up, count, reange) {
  const words =   ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape',
  'honeydew', 'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'peach',
  'quince', 'raspberry', 'strawberry', 'tangerine', 'watermelon', 'apricot',
  'blueberry', 'coconut', 'dragonfruit', 'grapefruit', 'huckleberry', 'jackfruit',
  'kiwifruit', 'lime', 'mulberry', 'papaya', 'persimmon', 'plum', 'pomegranate',
  'rhubarb', 'starfruit', 'tomato', 'ugli', 'yuzu', 'boysenberry', 'cranberry',
  'durian', 'feijoa', 'guava', 'honeyberry', 'imbe', 'jabuticaba', 'kiwano',
  'loquat', 'mandarin', 'nance', 'olive', 'pawpaw', 'quenepa', 'rambutan',
  'soursop', 'tamarind', 'uvaia', 'vanilla', 'wampee', 'xigua', 'yumberry',
  'zucchini', 'almond', 'cashew', 'chestnut', 'date', 'hazelnut', 'macadamia',
  'pecan', 'pistachio', 'walnut', 'amaranth', 'barley', 'buckwheat', 'corn',
  'oat', 'quinoa', 'rice', 'rye', 'sorghum', 'wheat', 'bagel', 'croissant'];
  const now = Date.now()
  for (let i = 0; i < count; i++) {
    const speed = (Math.random() * 700) -50;
    const cog = Math.random() * 360;
    let ais = {
      shipName: words[Math.floor(Math.random() * words.length)],
      shipType : Math.random()*100,
      mmsi: Math.floor(Math.random( )*1000000),
      posX: 14363620.688750563 + right - Math.random() * reange, 
      posY: 4171752.3092421135 + up - Math.random() * reange,
      sog: (speed<0)?0:speed,
      cog: cog,
      trueheading: cog,
      time: now,
    }
    markers.set(ais.mmsi, new Marker(
      ais.shipName || "unKnown", ais.shipType, ais.trueheading, ais.cog, ais.sog,
      ais.posX, ais.posY, now, map, vectorSource))
  }
}
// makeFakeShip(21500, -8500, 2*10, 8*1000)


function animateMarkers() {
  let nowTime = Date.now();
  markers.forEach(marker=>{
    marker.updatePosition(marker.sog, marker.trueheading, nowTime);
  })
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
  markers.forEach(marker=>{
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
      if (markers.has(key)) {
        markers.get(key).updateMarker(ais.trueheading, ais.cog, ais.sog, Date.now())
        markers.get(key).feature.getGeometry().setCoordinates([ais.posX, ais.posY]);
      } else {
        markers.set(key, new Marker(
          ais.shipName || "unKnown", ais.shipType, ais.trueHeading, ais.cog, ais.sog,
          ais.posX, ais.posY, Date.now(), map, vectorSource))
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
