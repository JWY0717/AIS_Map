import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon, Text, Fill } from 'ol/style';

const red = "#C90000";
const orange = "#FF8000";
const yellow = "#FAFF00";
const green = "#107100";
const blue = "#0000FF";
const indigo = "#4B0082";
const violet = "#8B00FF";
const black = "#000000";
const white = "#FFFFFF";

export default class Marker {
  constructor(shipName, shipType, trueheading, cog, sog, posX, posY, time, map, vectorSource) {
    this.unKnown = false;
    this.stopRenderCounter = 0;
    this.shipName = shipName;
    this.trueheading = trueheading;
    this.sog = sog;
    this.cog = cog;
    this.time = time;
    const zoom = map.getView().getZoom();
    let fill, stroke;
    sog > 22 ? fill = red : sog > 17 ? fill = orange : sog > 13 ? fill = yellow : sog > 9 ? fill = green 
    : sog > 5 ? fill = blue : sog > 3 ? fill = indigo : sog > 1 ? fill = violet : fill = black;
    shipType > 90 ? stroke = red : shipType > 80 ? stroke = orange : shipType > 70 ? stroke = yellow 
    : shipType > 60 ? stroke = green : shipType > 40 ? stroke = blue : shipType > 20 ? stroke = indigo 
    : shipType > 1 ? stroke = violet : stroke = black;
    this.stroke = stroke;
    let svgUrl = ''
    let svgShip = `<svg width="120" height="167" viewBox="0 0 120 167" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.117 152.487L60 16.282L108.883 152.487L63.0857 121.447L60 119.356L56.9143 121.447L11.117 152.487Z" 
    fill="${fill}" stroke="${this.stroke}" stroke-width="11"/></svg>`;
    const svgStop = `<svg width="93" height="93" viewBox="0 0 93 93" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="46.5" cy="46.5" r="41.5" fill="${fill}" stroke="${this.stroke}" stroke-width="10"/></svg>`;
    sog < 2 ? svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgStop)}`
      : svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgShip)}`;

    this.shipName = new Text({
      text: shipName,
      font: this.caculateFontSize(zoom),
      fill: new Fill({ color: this.caculateFontColor(zoom) }),
      offsetY: this.calculateOffsetY(zoom),
    });
    this.style = new Style({
      image: new Icon({
        src: svgUrl,
        scale: this.calculateMarkerScale(zoom),
        rotation: this.cog * (Math.PI / 180),
        rotateWithView: true,
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
      }),
      text: this.shipName,
    });
    this.feature = new Feature({
      geometry: new Point([posX, posY]),
    });
    this.feature.setStyle(this.style);
    vectorSource.addFeature(this.feature)
  }

  // 새로 들어온 신호가 이미 피처가 존재할 경우 새로들어온 좌표로 피처 이동 후 이걸로 속성 교체
  updateMarker(trueheading, cog, sog, time) {
    this.trueheading = trueheading;
    this.cog = cog;
    this.sog = sog;
    this.time = time;
    this.feature.getStyle().getImage().setRotation(cog * (Math.PI / 180));

    // 속도변화에 맞춰 랜더링 색상 변경은 svg이미지 설정 문자열로 조정하기엔 성능이슈
    
    // sog > 22 ? this.fill = red : sog > 17 ? this.fill = orange : sog > 13 ? this.fill = yellow 
    // : sog > 9 ? this.fill = green : sog > 5 ? this.fill = blue : sog > 3 ? this.fill = indigo 
    // : sog > 1 ? this.fill = violet : this.fill = black;
    // let svgUrl = ''
    // let svgShip = `<svg width="120" height="167" viewBox="0 0 120 167" fill="none" xmlns="http://www.w3.org/2000/svg">
    // <path d="M11.117 152.487L60 16.282L108.883 152.487L63.0857 121.447L60 119.356L56.9143 121.447L11.117 152.487Z" 
    // fill="${this.fill}" stroke="${this.stroke}" stroke-width="11"/></svg>`;
    // const svgStop = `<svg width="93" height="93" viewBox="0 0 93 93" fill="none" xmlns="http://www.w3.org/2000/svg">
    // <circle cx="46.5" cy="46.5" r="41.5" fill="${this.fill}" stroke="${this.stroke}" stroke-width="10"/></svg>`;
    // sog < 2 ? svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgStop)}`
    //   : svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgShip)}`;
  }

  updatePosition(now) {
    const elapsed = (now - this.time) / 1000;
    // if (elapsed > 0.05) { // 랜더링 성능제한
    const speed = this.sog * 1.852 * 1000 / 3600; // 노트 => m/s 
    const distance = speed * elapsed; 
    const angleRad = (90 - this.cog) * (Math.PI / 180);
    const deltaX = Math.cos(angleRad) * distance;
    const deltaY = Math.sin(angleRad) * distance;
    // 3857 좌표 쓰는 이유
    const coordinates = this.feature.getGeometry().getCoordinates();
    const newCoordinates = [coordinates[0] + deltaX, coordinates[1] + deltaY];
    this.feature.getGeometry().setCoordinates(newCoordinates);
    this.time = now;
    // }
  }

  calculateMarkerScale(zoom) {
    const baseScale = 0.02;
    const minZoom = 8;
    const maxZoom = 20;
    const scaleRatio = 1.3;
    const zoomLevel = Math.max(minZoom, Math.min(maxZoom, zoom));
    const scaleFactor = Math.pow(scaleRatio, zoomLevel - minZoom);
    let scale = baseScale * scaleFactor;
    const minScale = 0.05;
    const maxScale = 0.25;
    scale = Math.max(minScale, Math.min(maxScale, scale));
    return scale;
  }

  // 지도 축척에 따라 마커 변화
  updateSize(zoom) {
    this.style.getImage().setScale(this.calculateMarkerScale(zoom));
    this.shipName.setOffsetY(this.calculateOffsetY(zoom));
    this.shipName.setFont(this.caculateFontSize(zoom));
    this.style.getText().getFill().setColor(this.caculateFontColor(zoom));
  }
  calculateOffsetY(zoom) {
    let offsetY = (zoom - 11) * 4.5 + 1;
    const minOff = 7;
    const maxOff = 30;
    offsetY = Math.max(minOff, Math.min(maxOff, offsetY));
    return offsetY;
  }
  caculateFontSize(zoom) {
    const minFont = 10;
    const maxFont = 20;
    const fontSize = Math.max(minFont, Math.min(maxFont, (zoom - 12) * 2 + 12));
    return `${fontSize}px Tahoma`
  }
  caculateFontColor(zoom) {
    if (this.fake) return zoom > 11 ? (this.stroke) : 'rgba(0, 0, 0, 0)';
    return 800 / (this.sog * 6 + 60) < zoom - 2.5 ? (this.stroke) : 'rgba(0, 0, 0, 0)';
  }


  
}
