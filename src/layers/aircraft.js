import VectorLayer from 'ol/layer/Vector';
import { Icon, Style, Text, Stroke } from 'ol/style';

export default class AircraftLayer extends VectorLayer {
  constructor(options) {
    const baseOptions = { ...options };

    delete baseOptions.devices;

    super({
      ...baseOptions,
      style: (...args) => this._getFeatureStyle(...args),
    });

    this._devices = options.devices;
    this._iconStyles = new WeakMap();
    this._labelStyles = new WeakMap();
  }

  _getFeatureStyle(feature) {
    let { course, id } = feature.getProperties();
    let rotation = course * (Math.PI / 180);

    let style = this._iconStyles.get(feature);
    if (style) {
      style.getImage().setRotation(rotation);
    } else {
      style = new Style({
        image: new Icon({
          src: 'https://skylines.aero/images/glider_symbol.svg',
          rotation,
          rotateWithView: true,
        }),
      });

      this._iconStyles.set(feature, style);
    }

    let labelStyle = this._labelStyles.get(feature);
    if (!labelStyle) {
      let device = this._devices[id];
      let label = device ? device.cn || device.registration : '';

      labelStyle = new Style({
        text: new Text({
          text: label,
          font: '14px sans-serif',
          stroke: new Stroke({ color: '#fff', width: 3 }),
          textAlign: 'left',
          offsetX: 25,
        }),
      });

      this._labelStyles.set(feature, labelStyle);
    }

    return [style, labelStyle];
  }
}
