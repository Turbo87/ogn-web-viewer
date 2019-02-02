import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

import VectorLayer from 'ol/layer/Vector';
import { Icon, Style } from 'ol/style';

import { imageSrcForDevice } from '../layers/aircraft';

export default Component.extend({
  aircraft: service(),
  ddb: service(),
  mapService: service('map'),

  tagName: '',

  map: alias('mapService.map'),

  init() {
    this._super(...arguments);

    this._iconStyles = new WeakMap();

    this.layer = new VectorLayer({
      source: this.aircraft.source,
      opacity: 0.2,
      maxResolution: 500,
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

  _getFeatureStyle(feature) {
    let { id } = feature.getProperties();
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
  },
});
