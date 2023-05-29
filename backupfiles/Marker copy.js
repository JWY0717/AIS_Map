import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon, Text, Fill } from 'ol/style';

const svgCode = `
<svg width="120" height="167" viewBox="0 0 120 167" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.117 152.487L60 16.282L108.883 152.487L63.0857 121.447L60 119.356L56.9143 121.447L11.117 152.487Z" fill="#B9D800" stroke="#C90000" stroke-width="11"/>
</svg>
`;

export default class Marker {
  constructor(goem, sog, cog, map) {
    this.sog = sog;
    this.cog = cog;
    this.feature = new Feature({
      geometry: new Point(goem),
    });
    const svgUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgCode)}`;
    this.shipName = new Text({
      text: 'ship',
      font: 'bold 14px sans-serif',
      fill: new Fill({ color: 'red' }),
      offsetY: 25, // 텍스트의 Y축 위치 조정
    });
    this.style = new Style({
      image: new Icon({
        src: svgUrl,
        scale: this.calculateMarkerScale(map.getView().getZoom()),
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

  updateSize(map){
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
    let offsetY = (zoom - 10) * 4 + 4;
    const minScale = 5;
    const maxScale = 40;
    offsetY = Math.max(minScale, Math.min(maxScale, offsetY));
    return offsetY;
  }

  caculateFontSize(zoom) {
    return `bold ${zoom*3-25}px sans-serif`
  }
}
