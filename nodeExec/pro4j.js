const proj4 = require("proj4");

// 소스 좌표와 대상 좌표 체계를 정의합니다.
const sourceCoordinates = [129.0306, 35.0779];
const sourceProjection = proj4.defs("EPSG:4326");
const targetProjection = proj4.defs("EPSG:3857");

// 변환 함수를 생성합니다.
const transformFunc = proj4(sourceProjection, targetProjection);

// 좌표 변환을 수행합니다.
const transformedCoordinates = transformFunc.forward(sourceCoordinates);
console.log(transformedCoordinates);
