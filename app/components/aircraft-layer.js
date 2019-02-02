import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

import { AircraftLayer } from '../layers';

export default Component.extend({
  aircraft: service(),
  ddb: service(),
  filter: service(),
  mapService: service('map'),

  tagName: '',

  map: alias('mapService.map'),

  init() {
    this._super(...arguments);
    this.set(
      'layer',
      new AircraftLayer({
        ddbService: this.ddb,
        deviceFilter: this.filter,

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
