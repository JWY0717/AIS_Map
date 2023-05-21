var baseMap;

var TRANS;

var wfsLayer = new ol.layer.Vector({
	source: new ol.source.Vector()
});
//hover 스타일
var highlightStyle = new ol.style.Style({
	fill: new ol.style.Fill({
	color: '#216e38',
	}),
	stroke: new ol.style.Stroke({
	color: '#216e38',
	width: 3
	})
});
		
/////////////베이스맵///////////////
$(document).ready(function(){
	 //맵생성
	 initMap();
	 //마우스이벤트
	 mouseControl();
	 //팝업 제어
	 popupControl();
	 
});
function initMap(){
		//뷰(좌표 및 줌 설정)
		proj4.defs("EPSG:5179", "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
		ol.proj.proj4.register(proj4);
		var proj5179 = ol.proj.get('EPSG:5179');
		var resolutions = [125094.232896, 62547.116448, 31273.558224, 15636.779112, 7818.389556, 3909.194778, 1954.597389, 977.2986945, 488.6493472, 244.3246736, 122.1623368, 61.08116841, 30.5405842, 15.2702921, 7.635146051, 3.817573025, 1.908786513];
		var tileExtent = [-200000.0, -28024123.62, 31824123.62, 4000000.0];
		var initExtent = [18321.13581588259, 1424794.937360047, 1894734.6292558827, 2214452.282516047];
		var initBasemapType = "BASEMAP" //베이스맵 타입
		var minZoomLevel = 0;
		var maxZoomLevel = 10;
		var feature = null;
		var view =  new ol.View({
					projection: proj5179,
					extent: tileExtent,
					center: [ 956498.5710969, 1819967.0629328 ],
					zoom: 1,
					minZoom: minZoomLevel,
					maxZoom: maxZoomLevel,
					maxResolution: 1954.597389
		});
		//베이스맵 설정
		baseMap = new ol.Map({
			target: 'baseMap',//베이스맵 아이디
			layers: [//레이어 설정
				new ol.layer.Tile({
					division : 'TILE',
					layerName: 'BASEMAP',
					visible: true,
					source: new ol.source.XYZ({
						projection: proj5179,
						tileSize: 256,
						minZoom: minZoomLevel,
						maxZoom: maxZoomLevel,
						tileGrid: new ol.tilegrid.TileGrid({//타일 그리드 설정
							extent: tileExtent, //타일 그리드(격자) 범위설정
							origin: [ tileExtent[0], tileExtent[1] ],//타일 그리드 원점(그려지는 시작점을 말하는것 같음)
							resolutions: resolutions//해상도 관련
						}),
						tileUrlFunction: function(tileCoord, pixelRatio, projection){
							if (tileCoord == null) return undefined;
							
							var z = tileCoord[0];
							var x = tileCoord[1];
							var y = tileCoord[2];

							var basemapPath = _baseMapUrl;
							basemapPath += "&z=L" + fn_fillzero(z, 2);
							basemapPath += "&x=" + x;
							basemapPath += "&y=" + y;
						
							return  basemapPath;

						}
					
						//url : vworldMapBaseMAPUrl
					})
				})
			],
			controls: ol.control.defaults({
							attributionOptions: ({
								collapsible: false
							})
			}),
			view: view
		});
}

function mouseControl(){
	var selected = null;
	//마우스 오버, 아웃 제어(HOVER)
	baseMap.on('pointermove',function(evt){
		if(selected !== null){
			selected.setStyle(undefined); 
			selected = null;
		}
	});
	baseMap.on('pointermove', function(evt) {
		if (evt.dragging) {
			return;
		}
		var feature = baseMap.forEachFeatureAtPixel(evt.pixel,function(feature){
			selected = feature;
			feature.setStyle(highlightStyle);
			return feature;
		});
    });
	//레이어 전체제거
	$("#allRemove").on("click", function(){
		baseMap.getLayers().getArray().forEach(function(k,v){
			if(k.get("division")!="TILE"){
				baseMap.removeLayer(k);
			}
		});

	});
	//wms 생성
	$("#getWMS").on("click", function(){
		layerNm = $("#txt_layernm").val();
		if(layerNm){

	        $.ajax({
	            async:true,
	            cache:false,
	            type:"GET",
	            url:  _wmsUrl + "&Layer="+layerNm,
	            data:{},
				dataType:"text",
	            success:function(response) {
					eval(response);
					
					if(OtmsWmsLayer){
						
						baseMap.addLayer(new ol.layer.Tile({
							visible : true,
							source: OtmsWmsLayer
						}));						
						
					}

					console.log('success');
	            },
	            error:function(response) {
	                alert("처리오류로 인해 WFS정보를 가져오지 못했습니다.");
	            }
	        }); 
	
		}else{
			return alert("레이어명을 입력해주세요.");
		}
	});
	
	//wfs 생성
	$("#getWFS").on("click", function(){
		layerNm = $("#txt_layernm").val();
		if(layerNm){
			
			var url = _wfsUrl + "&Layer="+layerNm;

			getDMS();
			url += "&minlon="+TRANS._extent['minlon']; //좌측하단	최소경도 (도분초 ^구분자 사용)
			url += "&minlat="+TRANS._extent['minlat']; //좌측하단	최소위도 (도분초 ^구분자 사용)
			url += "&maxlon="+TRANS._extent['maxlon']; //우측상단	최대경도 (도분초 ^구분자 사용)
			url += "&maxlat="+TRANS._extent['maxlat']; //우측상단	최대위도 (도분초 ^구분자 사용)
			
			
	        $.ajax({
	            async:true,
	            cache:false,
	            type:"GET",
	            url: url,
	            data:{},
	            dataType:"xml", //xml 데이터형식
	            success:function(response) {
	                wfsFeature(response);
					console.log('success');
	            },
	            error:function(response) {
	                alert("처리오류로 인해 WFS정보를 가져오지 못했습니다.");
	            }
	        });
	
		}else{
			return alert("레이어명을 입력해주세요.");
		}
	});
}
	
function getDMS(){
		
	if(TRANS == null){
		TRANS =new transCoord();
	}
		
	var size =baseMap.getSize();
    var extent = baseMap.getView().calculateExtent(size);
	
	TRANS.setExtent(extent);
		
}
function popupControl(){
		var element = document.getElementById('popup');//팝업틀
		var content = document.getElementById('popupContent');//팝업내용 틀
		var closer = document.getElementById('popupCloser');//닫기 표시
		//팝업 feature 정보 표시
		var featurePopup = new ol.Overlay({
			element : element
		});
		baseMap.addOverlay(featurePopup);

		baseMap.on('click', function(evt){
			$('#popupContent').html("");
			var feature = baseMap.forEachFeatureAtPixel(evt.pixel,function(feature){
				selected = feature;
				feature.setStyle(highlightStyle);
				return feature;
			});
			if(feature){
				var coordinates = evt.coordinate;
				featurePopup.setPosition(coordinates);
				
				var attribute = feature.getProperties();
				var html = "";
				html += ""
				for(key in attribute){
					html += key+" =  "+attribute[key]+"<br/>";
				}
				
				$('#popupContent').html(html);
				$('#popup').css("visibility", "visible")
				baseMap.getView().setCenter(coordinates,'EPSG:5179')
			}else{
				$('#popupContent').html("");
				$('#popup').css("visibility", "hidden")
			}
		});
		//닫기
		$("#popupCloser").on("click", function(){
			featurePopup.setPosition(undefined);
		});
};

//서비스 키를 이용하여 XML 파싱
function wfsFeature(response){
	var gml = null;
	gml = new ol.format.GML();
	var features = gml.readFeaturesFromDocument(response);
	features.forEach(function(feature){
		feature.getGeometry().getExtent();
	});
		wfsLayer.getSource().addFeatures(features);
		baseMap.addLayer(wfsLayer);
}
//베이스맵 요청 시 사용
function fn_fillzero(n, digits) {
	var zero = '';
	n = n.toString();
	if (digits > n.length) {
		for (var i = 0; digits - n.length > i; i++) {
			zero += '0';
		}
	}
	return zero + n;
}


