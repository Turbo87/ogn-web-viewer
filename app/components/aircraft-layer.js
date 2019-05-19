import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

import VectorLayer from 'ol/layer/Vector';
import { Icon, Stroke, Style, Text } from 'ol/style';

const REGULAR_OPACITY = 1.0;
const FILTERED_OPACITY = 0.3;

export default class extends Component {
  @service aircraft;
  @service ddb;
  @service filter;
  @service('map') mapService;

  tagName = '';

  @alias('mapService.map') map;

  _iconStyles = new WeakMap();
  _labelStyles = new WeakMap();

  layer = new VectorLayer({
    source: this.aircraft.source,
    style: (...args) => this._getFeatureStyle(...args),
  });

  didInsertElement() {
    super.didInsertElement(...arguments);
    this.map.addLayer(this.layer);
  }

  willDestroyElement() {
    this.map.removeLayer(this.layer);
    super.willDestroyElement(...arguments);
  }

  _getFeatureStyle(feature, resolution) {
    let { course, id, altitude } = feature.getProperties();
    let device = this.ddb.devices[id] || {};

    let imageSrc = imageSrcForDevice(device);

    let style = this._iconStyles.get(feature);
    if (!style || style.getImage().getSrc() !== imageSrc) {
      style = new Style({
        image: new Icon({
          src: imageSrc,
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

    let filterRow = this.filter.filter.find(row => row.id === id) || {};
    let hasFilter = this.filter.filter.length !== 0;
    let isFiltered = hasFilter && !filterRow.id;

    let rotation = course * (Math.PI / 180);
    style.getImage().setRotation(rotation);
    style.getImage().setOpacity(isFiltered ? FILTERED_OPACITY : REGULAR_OPACITY);

    if (isFiltered) {
      return [style];
    }

    let labelParts = [filterRow.callsign || filterRow.registration || device.callsign || device.registration];

    if (resolution < 100) {
      labelParts.push(`${altitude}m`);
    }

    labelStyle.getText().setText(labelParts.filter(Boolean).join('\n'));

    return [style, labelStyle];
  }
}

/*
 * `category` means:
 *
 * 1 => Gliders/Motorgliders
 * 2 => Planes
 * 3 => Ultralights
 * 4 => Helicoters
 * 5 => Drones/UAV
 * 6 => Others
 */
export function imageSrcForDevice(device) {
  if (device.registration) {
    if (device.registration.startsWith('D-H')) {
      return '/aircraft/ec135.svg';
    }
  }

  if (device.category === 2 || device.category === 3) {
    return '/aircraft/dr400.svg';
  }

  if (device.category === 4) {
    return '/aircraft/ec135.svg';
  }

  if (device.category === 1) {
    if (device.model) {
      if (device.model.includes('Libelle')) {
        return '/aircraft/libelle.svg';
      } else if (device.model.includes('Hornet')) {
        return '/aircraft/hornet.svg';
      }
    }

    return '/aircraft/duo.svg';
  }

  return '/aircraft/duo.svg';
}
