import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import { transformExtent } from 'ol/proj';

const EPSG_4326 = 'EPSG:4326';
const EPSG_3857 = 'EPSG:3857';

export default class extends Component {
  @service ddb;
  @service filter;
  @service history;
  @service ws;
  @service('map') mapService;

  @alias('filter.hasFilter') hasDeviceFilter;
  @alias('mapService.map') map;

  constructor() {
    super(...arguments);

    this.map.on('moveend', () => {
      if (!this.filter.hasFilter) {
        this.ws.setBBox(this.getBBox());
      }
    });

    this.ws.on('record', this, 'handleRecord');
  }

  willDestroy() {
    this.ws.off('record', this, 'handleRecord');

    super.willDestroy(...arguments);
  }

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
  }

  getBBox() {
    let extent = this.map.getView().calculateExtent();
    return transformExtent(extent, EPSG_3857, EPSG_4326);
  }

  @action
  setMapTarget(element) {
    this.map.setTarget(element);
  }
}
