import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

import { AircraftShadowLayer } from '../layers';

export default Component.extend({
  aircraft: service(),
  ddb: service(),
  mapService: service('map'),

  tagName: '',

  map: alias('mapService.map'),

  init() {
    this._super(...arguments);
    this.set(
      'layer',
      new AircraftShadowLayer({
        ddbService: this.ddb,

        opacity: 0.2,
        maxResolution: 500,
        source: this.aircraft.source,
      }),
    );
  },

  didInsertElement() {
    this._super(...arguments);
    this.map.addLayer(this.layer);
  },

  willDestroyElement() {
    this.map.removeLayer(this.layer);
    this._super(...arguments);
  },
});
