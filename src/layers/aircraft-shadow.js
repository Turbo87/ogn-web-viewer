import VectorLayer from 'ol/layer/Vector';
import { Icon, Style } from 'ol/style';

export default class AircraftShadowLayer extends VectorLayer {
  constructor(options) {
    const baseOptions = { ...options };

    super({
      ...baseOptions,
      style: (...args) => this._getFeatureStyle(...args),
    });

    this._iconStyles = new WeakMap();
  }

  _getFeatureStyle(feature) {
    let { course, altitude } = feature.getProperties();
    let rotation = course * (Math.PI / 180);
    let sin = Math.sin(rotation);
    let cos = Math.cos(rotation);

    let shadowDistance = Math.min(0.2, altitude / 10000);
    let anchor = [0.5 - shadowDistance * sin, 0.5 - shadowDistance * cos];

    let style = this._iconStyles.get(feature);
    if (style) {
      let icon = style.getImage();
      icon.setRotation(rotation);
      icon.setAnchor(anchor);
    } else {
      style = new Style({
        image: new CustomIcon({
          anchor,
          src: 'https://skylines.aero/images/glider_symbol.png',
          rotation,
          rotateWithView: true,
        }),
      });

      this._iconStyles.set(feature, style);
    }

    return style;
  }
}

// see https://github.com/openlayers/openlayers/pull/8383
class CustomIcon extends Icon {
  setAnchor(anchor) {
    this.anchor_ = anchor.slice();
    this.normalizedAnchor_ = null;
  }
}
