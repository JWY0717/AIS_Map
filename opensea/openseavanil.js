let baseMap;
let TRANS;
const wfsLayer = new ol.layer.Vector({
  source: new ol.source.Vector(),
});

// hover 스타일
const highlightStyle = new ol.style.Style({
  fill: new ol.style.Fill({
    color: '#216e38',
  }),
  stroke: new ol.style.Stroke({
    color: '#216e38',
    width: 3,
  }),
});

// 베이스맵 생성
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  mouseControl();
  popupControl();
});

function initMap() {
  proj4.defs("EPSG:5179", "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
  ol.proj.proj4.register(proj4);
  const proj5179 = ol.proj.get('EPSG:5179');
  const resolutions = [125094.232896, 62547.116448, 31273.558224, 15636.779112, 7818.389556, 3909.194778, 1954.597389, 977.2986945, 488.6493472, 244.3246736, 122.1623368, 61.08116841, 30.5405842, 15.2702921, 7.635146051, 3.817573025, 1.908786513];
  const tileExtent = [-200000.0, -28024123.62, 31824123.62, 4000000.0];
  const initExtent = [18321.13581588259, 1424794.937360047, 1894734.6292558827, 2214452.282516047];
  const initBasemapType = "BASEMAP"; // 베이스맵 타입
  const minZoomLevel = 0;
  const maxZoomLevel = 10;
  let feature = null;
  const view = new ol.View({
    projection: proj5179,
    extent: tileExtent,
    center: [956498.5710969, 1819967.0629328],
    zoom: 1,
    minZoom: minZoomLevel,
    maxZoom: maxZoomLevel,
    maxResolution: 1954.597389,
  });

  // 베이스맵 설정
  baseMap = new ol.Map({
    target: 'baseMap', // 베이스맵 아이디
    layers: [
      // 레이어 설정
      new ol.layer.Tile({
        division: 'TILE',
        layerName: 'BASEMAP',
        visible: true,
        source: new ol.source.XYZ({
          projection: proj5179,
          tileSize: 256,
          minZoom: minZoomLevel,
          maxZoom: maxZoomLevel,
          tileGrid: new ol.tilegrid.TileGrid({
            // 타일 그리드 설정
            extent: tileExtent, // 타일 그리드(격자) 범위설정
            origin: [tileExtent[0], tileExtent[1]], // 타일 그리드 원점(그려지는 시작점을 말하는것 같음)
            resolutions: resolutions, // 해상도 관련
          }),
          tileUrlFunction: function (tileCoord, pixelRatio, projection) {
            if (tileCoord == null) return undefined;

            const z = tileCoord[0];
            const x = tileCoord[1];
            const y = tileCoord[2];

            let basemapPath = _baseMapUrl;
            basemapPath += "&z=L" + fn_fillzero(z, 2);
            basemapPath += "&x=" + x;
            basemapPath += "&y=" + y;

            return basemapPath;
          },
        }),
      }),
    ],
    controls: ol.control.defaults({
      attributionOptions: {
        collapsible: false,
      },
    }),
    view: view,
  });
}

function mouseControl() {
  let selected = null;

  // 마우스 오버, 아웃 제어(HOVER)
  baseMap.on('pointermove', function (evt) {
    if (selected !== null) {
      selected.setStyle(undefined);
      selected = null;
    }
  });

  baseMap.on('pointermove', function (evt) {
    if (evt.dragging) {
      return;
    }
    const feature = baseMap.forEachFeatureAtPixel(evt.pixel, function (feature) {
      selected = feature;
      feature.setStyle(highlightStyle);
      return feature;
    });
  });

  // 레이어 전체 제거
  document.getElementById("allRemove").addEventListener("click", function () {
    baseMap.getLayers().getArray().forEach(function (layer) {
      if (layer.get("division") !== "TILE") {
        baseMap.removeLayer(layer);
      }
    });
  });

  // wms 생성
  document.getElementById("getWMS").addEventListener("click", function () {
    const layerNm = document.getElementById("txt_layernm").value;
    if (layerNm) {
      const url = _wmsUrl + "&Layer=" + layerNm;

      fetch(url)
        .then((response) => response.text())
        .then((response) => {
          eval(response);

          if (OtmsWmsLayer) {
            baseMap.addLayer(
              new ol.layer.Tile({
                visible: true,
                source: OtmsWmsLayer,
              })
            );
          }

          console.log('success');
        })
        .catch((error) => {
          console.log("처리오류로 인해 WFS정보를 가져오지 못했습니다.");
        });
    } else {
      alert("레이어명을 입력해주세요.");
    }
  });

  // wfs 생성
  document.getElementById("getWFS").addEventListener("click", function () {
    const layerNm = document.getElementById("txt_layernm").value;
    if (layerNm) {
      let url = _wfsUrl + "&Layer=" + layerNm;

      getDMS();
      url += "&minlon=" + TRANS._extent['minlon']; // 좌측하단 최소경도 (도분초 ^구분자 사용)
      url += "&minlat=" + TRANS._extent['minlat']; // 좌측하단 최소위도 (도분초 ^구분자 사용)
      url += "&maxlon=" + TRANS._extent['maxlon']; // 우측상단 최대경도 (도분초 ^구분자 사용)
      url += "&maxlat=" + TRANS._extent['maxlat']; // 우측상단 최대위도 (도분초 ^구분자 사용)

      fetch(url)
        .then((response) => response.text())
        .then((response) => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(response, "application/xml");
          wfsFeature(xmlDoc);
          console.log('success');
        })
        .catch((error) => {
          console.log("처리오류로 인해 WFS정보를 가져오지 못했습니다.");
        });
    } else {
      alert("레이어명을 입력해주세요.");
    }
  });
}

function getDMS() {
  if (TRANS === null) {
    TRANS = new transCoord();
  }

  const size = baseMap.getSize();
  const extent = baseMap.getView().calculateExtent(size);

  TRANS.setExtent(extent);
}

function popupControl() {
  const element = document.getElementById('popup'); // 팝업틀
  const content = document.getElementById('popupContent'); // 팝업내용 틀
  const closer = document.getElementById('popupCloser'); // 닫기 표시

  // 팝업 feature 정보 표시
  const featurePopup = new ol.Overlay({
    element: element,
  });
  baseMap.addOverlay(featurePopup);

  baseMap.on('click', function (evt) {
    content.innerHTML = "";
    const feature = baseMap.forEachFeatureAtPixel(evt.pixel, function (feature) {
      selected = feature;
      feature.setStyle(highlightStyle);
      return feature;
    });

    if (feature) {
      const coordinates = evt.coordinate;
      featurePopup.setPosition(coordinates);

      const attribute = feature.getProperties();
      let html = "";
      for (const key in attribute) {
        html += key + " =  " + attribute[key] + "<br/>";
      }

      content.innerHTML = html;
      element.style.visibility = "visible";
      baseMap.getView().setCenter(coordinates, 'EPSG:5179');
    } else {
      content.innerHTML = "";
      element.style.visibility = "hidden";
    }
  });

  // 닫기
  closer.addEventListener("click", function () {
    featurePopup.setPosition(undefined);
  });
}

// 서비스 키를 이용하여 XML 파싱
function wfsFeature(xmlDoc) {
  const gml = new ol.format.GML();
  const features = gml.readFeaturesFromDocument(xmlDoc);
  features.forEach(function (feature) {
    feature.getGeometry().getExtent();
  });

  wfsLayer.getSource().addFeatures(features);
  baseMap.addLayer(wfsLayer);
}

// 베이스맵 요청 시 사용
function fn_fillzero(n, digits) {
  let zero = '';
  n = n.toString();
  if (digits > n.length) {
    for (let i = 0; digits - n.length > i; i++) {
      zero += '0';
    }
  }
  return zero + n;
}

document.addEventListener("DOMContentLoaded", function () {
  //맵생성
  initMap();
  //마우스이벤트
  mouseControl();
  //팝업 제어
  popupControl();
});
