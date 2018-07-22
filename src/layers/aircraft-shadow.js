import VectorLayer from 'ol/layer/Vector';
import { Icon, Style } from 'ol/style';

import { imageSrcForDevice } from './aircraft';
import ddbService from '../services/ddb';

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
    let { id } = feature.getProperties();
    let device = ddbService.devices[id] || {};

    let imageSrc = imageSrcForDevice(device);

    let style = this._iconStyles.get(feature);
    if (!style || style.getImage().getSrc() !== imageSrc) {
      style = new Style({
        image: new CustomIcon({
          src: imageSrc,
          rotateWithView: true,
        }),
      });

      this._iconStyles.set(feature, style);
    }

    let { course, altitude } = feature.getProperties();

    let rotation = course * (Math.PI / 180);
    let sin = Math.sin(rotation);
    let cos = Math.cos(rotation);

    let shadowDistance = Math.min(0.2, altitude / 10000);
    let anchor = [0.5 - shadowDistance * sin, 0.5 - shadowDistance * cos];

    let icon = style.getImage();
    icon.setRotation(rotation);
    icon.setAnchor(anchor);

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
