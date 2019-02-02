import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

import VectorLayer from 'ol/layer/Vector';
import { Icon, Style, Text, Stroke } from 'ol/style';

export default Component.extend({
  aircraft: service(),
  ddb: service(),
  filter: service(),
  mapService: service('map'),

  tagName: '',

  map: alias('mapService.map'),

  init() {
    this._super(...arguments);

    this._iconStyles = new WeakMap();
    this._labelStyles = new WeakMap();

    this.layer = new VectorLayer({
      source: this.aircraft.source,
      style: (...args) => this._getFeatureStyle(...args),
    });
  },

  didInsertElement() {
    this._super(...arguments);
    this.map.addLayer(this.layer);
  },

  willDestroyElement() {
    this.map.removeLayer(this.layer);
    this._super(...arguments);
  },

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

    let rotation = course * (Math.PI / 180);
    style.getImage().setRotation(rotation);

    let filterRow = this.filter.filter.find(row => row.ID === id) || {};

    let labelParts = [filterRow.CN || filterRow.CALL || device.callsign || device.registration];

    if (resolution < 100) {
      labelParts.push(`${altitude}m`);
    }

    labelStyle.getText().setText(labelParts.filter(Boolean).join('\n'));

    return [style, labelStyle];
  },
});

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
