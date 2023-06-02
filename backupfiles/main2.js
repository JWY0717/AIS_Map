import 'ol/ol.css';

var OtmsLayer;
// avoid pink tiles
OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
OpenLayers.Util.onImageLoadErrorColor = "transparent";
var OtmsLayer;
var mapCenterX = '956498.5710969';
var mapCenterY = '1819967.0629328';
var numZoomLevels = 11;
var zoomLevel = 1;
var minZoomLevel = 0;
var mapBounds = new OpenLayers.Bounds(123, 32, 132, 43);

const extent = [13967488.396764, 3840850.295080, 14482255.536724, 4668126.023685];

const map = new OpenLayers.Map('map', {
  projection: new OpenLayers.Projection("EPSG:5179"), //지도의 좌표계
  displayProjection: new OpenLayers.Projection("EPSG:4326"),
  maxExtent: new OpenLayers.Bounds(-200000.0, -3015.4524155292, 3803015.45241553, 4000000.0),
  restrictedExtent: new OpenLayers.Bounds(37953.1466, 1126946.7253, 2152527.8074, 2873292.7040),
  center: new OpenLayers.LonLat(mapCenterX, mapCenterY),
  allOverlays: true,
  maxResolution: 1954.597389,//지도의 해상도
  numZoomLevels: numZoomLevels,
  zoom: zoomLevel,
  minZoom: minZoomLevel,
  transitionEffect: null,
  layers: [OtmsLayer],
  controls: [],
  // 사용자 이벤트 등록 
  eventListeners: {
    featureover: function (e) {  // feature에 마우스오버시
      e.feature.renderIntent = "select";
      e.feature.layer.drawFeature(e.feature);
      console.log("featureover");
    },
    featureout: function (e) {   // feature에 마우스아웃시
      e.feature.renderIntent = "default";
      e.feature.layer.drawFeature(e.feature);
      console.log("featureout");
    },
    featureclick: function (e) { // feature에 마우스클릭시
      console.log("featureclick e.feature.id = " + e.feature.id);
    }
  }
});
 // 지정된 바운드로 줌
 map.zoomToExtent( mapBounds.transform(map.displayProjection, map.projection ) );
 // 지도 센터 설정
 map.setCenter([mapCenterX,mapCenterY], minZoomLevel);
 // 지도 초기 레벨 설정
 map.zoomTo(1);


