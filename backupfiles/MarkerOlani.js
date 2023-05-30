import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon, Text, Fill } from 'ol/style';

const red = "#C90000";
const orange = "#FF8000";
const yellow = "#FFFF00";
const green = "#00FF00";
const blue = "#0000FF";
const indigo = "#4B0082";
const violet = "#8B00FF";
const black = "#000000";
const white = "#FFFFFF";
const words = [
  'apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape',
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
  'oat', 'quinoa', 'rice', 'rye', 'sorghum', 'wheat', 'bagel', 'croissant']

export default class Marker {
  constructor(goem, sog, cog, map) {
    this.sog = sog;
    this.cog = cog;
    this.feature = new Feature({
      geometry: new Point(goem),
    });
    let fill, stroke;
    sog>400?fill=red:sog>300?fill=orange:sog>200?fill=yellow:sog>100?
    fill=green:sog>50?fill=blue:sog>20?fill=indigo:sog>5?fill=violet:fill=black;

    let sh = Math.floor(cog)%8
    sh==0?stroke=red:sh==1?stroke=orange:sh==2?stroke=yellow:sh==3?
    stroke=green:sh==4?stroke=blue:sh==5?stroke=indigo:sh==6?stroke=violet:stroke=black;

    let svgShip = `
    <svg width="120" height="167" viewBox="0 0 120 167" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.117 152.487L60 16.282L108.883 152.487L63.0857 121.447L60 119.356L56.9143 121.447L11.117 152.487Z" fill="${fill}" stroke="${stroke}" stroke-width="11"/>
    </svg>
    `;
    const svgStop = `
    <svg width="93" height="93" viewBox="0 0 93 93" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="46.5" cy="46.5" r="41.5" fill="${fill}" stroke="${stroke}" stroke-width="10"/>
    </svg>
    `;
    this.stroke = stroke;
    this.fill = fill;
    let svgUrl=''
    sog<10? svgUrl=`data:image/svg+xml;utf8,${encodeURIComponent(svgStop)}`:svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgShip)}`;
    
    let zoom = map.getView().getZoom();
    this.shipName = new Text({
      text: words[Math.floor(Math.random() * words.length)],
      font: this.caculateFontSize(),
      fill: new Fill({ color: this.stroke }),
      offsetY: this.calculateOffsetY(zoom),
    });
    this.style = new Style({
      image: new Icon({
        src: svgUrl,
        scale: this.calculateMarkerScale(zoom),
        rotation: cog * (Math.PI / 180),
        rotateWithView: true,
        anchor: [0.5, 0.5],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
      }),
      text: this.shipName,
    });
    this.feature.setStyle(this.style);
  }


  getFeature() {
    return this.feature;
  }

  updateSize(map) {
    const currentZoom = map.getView().getZoom();
    this.style.getImage().setScale(this.calculateMarkerScale(currentZoom));
    this.shipName.setOffsetY(this.calculateOffsetY(currentZoom));
    this.shipName.setFont(this.caculateFontSize(currentZoom));
  }

  updatePosition(sog, cog, map) {
    const coordinates = this.feature.getGeometry().getCoordinates();
    const pixelDistance = this.calculatePixelDistance(sog, map);
    const angleRad = (450 - cog) * (Math.PI / 180);
    const deltaX = Math.cos(angleRad) * pixelDistance;
    const deltaY = Math.sin(angleRad) * pixelDistance;
    const newPosition = [coordinates[0] + deltaX, coordinates[1] + deltaY];
    this.feature.getGeometry().setCoordinates(newPosition);

  }

  calculatePixelDistance(sog, map) {
    const view = map.getView();
    const resolution = view.getResolution();
    const dpi = 25.4 / 0.28;
    const metersPerUnit = view.getProjection().getMetersPerUnit();
    const meterDistance = (sog * metersPerUnit * resolution) / dpi;
    const pixelDistance = meterDistance / resolution;
    return pixelDistance;
  }

  calculateMarkerScale(zoom) {
    const baseScale = 0.02;
    const minZoom = 8;
    const maxZoom = 19;
    const scaleRatio = 1.3;
    const zoomLevel = Math.max(minZoom, Math.min(maxZoom, zoom));
    const scaleFactor = Math.pow(scaleRatio, zoomLevel - minZoom);
    let scale = baseScale * scaleFactor;
    const minScale = 0.001;
    const maxScale = 0.3;
    scale = Math.max(minScale, Math.min(maxScale, scale));
    return scale;
  }
  calculateOffsetY(zoom) {
    let offsetY = (zoom - 11) * 5.5 - 7;
    const minScale = 5;
    const maxScale = 40;
    offsetY = Math.max(minScale, Math.min(maxScale, offsetY));
    return offsetY;
  }

  caculateFontSize(zoom) {
    return ` ${zoom * 3 - 30}px Tahoma`
  }
}
