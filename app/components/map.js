import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

import { transformExtent } from 'ol/proj';

const EPSG_4326 = 'EPSG:4326';
const EPSG_3857 = 'EPSG:3857';

export default Component.extend({
  ddb: service(),
  filter: service(),
  history: service(),
  ws: service(),
  mapService: service('map'),

  tagName: '',

  hasDeviceFilter: alias('filter.hasFilter'),
  map: alias('mapService.map'),

  didInsertElement() {
    this._super(...arguments);

    this.map.on('moveend', () => {
      if (!this.filter.hasFilter) {
        this.ws.setBBox(this.getBBox());
      }
    });

    this.map.setTarget('map');

    this.ws.on('record', this, 'handleRecord');
  },

  willDestroyElement() {
    this.ws.off('record', this, 'handleRecord');

    this.map.setTarget(null);

    this._super(...arguments);
  },

  handleRecord(record) {
    if (this.filter.hasFilter) {
      this.history.addRecords(record.id, [
        {
          time: record.timestamp * 1000,
          coordinate: [record.longitude, record.latitude],
          valid: true,
          altitude: record.altitude,
        },
      ]);
    }
  },

  getBBox() {
    let extent = this.map.getView().calculateExtent();
    return transformExtent(extent, EPSG_3857, EPSG_4326);
  },
});
