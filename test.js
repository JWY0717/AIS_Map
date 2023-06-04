var OtmsLayer = new OpenLayers.Layer.TMS('TMS','http://www.khoa.go.kr/oceanmap/BASEMAP_ENC57/wmsVectordata.do?ServiceKey=936EAC2E348116FCE2E661F2D',{
    layers: 'OTMS',
    type: 'png',
    isBaseLayer: false,
    getURL: overlay_getVectorBaseURL,
    transitionEffect: null
});