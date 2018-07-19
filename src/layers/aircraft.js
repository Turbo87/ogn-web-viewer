import VectorLayer from 'ol/layer/Vector';
import { Icon, Style, Text, Stroke } from 'ol/style';

export default class AircraftLayer extends VectorLayer {
  constructor(options) {
    const baseOptions = { ...options };

    super({
      ...baseOptions,
      style: (...args) => this._getFeatureStyle(...args),
    });

    this._devices = {};
    this._iconStyles = new WeakMap();
    this._labelStyles = new WeakMap();
  }

  setDevices(devices) {
    this._devices = devices;
  }

  _getFeatureStyle(feature) {
    let style = this._iconStyles.get(feature);
    if (!style) {
      style = new Style({
        image: new Icon({
          src: 'https://skylines.aero/images/glider_symbol.svg',
          rotateWithView: true,
        }),
      });

      this._iconStyles.set(feature, style);
    }

    let labelStyle = this._labelStyles.get(feature);
    if (!labelStyle) {
      labelStyle = new Style({
        text: new Text({
          font: '14px sans-serif',
          stroke: new Stroke({ color: '#fff', width: 3 }),
          textAlign: 'left',
          offsetX: 25,
        }),
      });

      this._labelStyles.set(feature, labelStyle);
    }

    let { course, id } = feature.getProperties();
    let rotation = course * (Math.PI / 180);

    style.getImage().setRotation(rotation);

    let device = this._devices[id];
    let label = device ? device.callsign || device.registration : '';

    labelStyle.getText().setText(label);

    return [style, labelStyle];
  }
}
