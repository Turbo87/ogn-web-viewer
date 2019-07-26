import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

import { transformExtent } from 'ol/proj';

const EPSG_4326 = 'EPSG:4326';
const EPSG_3857 = 'EPSG:3857';

export default class extends Component {
  @service aeroscore;
  @service ddb;
  @service filter;
  @service history;
  @service ws;
  @service('map') mapService;

  tagName = '';

  @alias('filter.hasFilter') hasDeviceFilter;
  @alias('mapService.map') map;

  didInsertElement() {
    super.didInsertElement(...arguments);

    this.map.on('moveend', () => {
      if (!this.filter.hasFilter) {
        this.ws.setBBox(this.getBBox());
      }
    });

    this.map.setTarget('map');

    this.ws.on('record', this, 'handleRecord');
  }

  willDestroyElement() {
    this.ws.off('record', this, 'handleRecord');

    this.map.setTarget(null);

    super.willDestroyElement(...arguments);
  }

  handleRecord(record) {
    if (this.filter.hasFilter) {
      let historyRecord = {
        time: record.timestamp * 1000,
        coordinate: [record.longitude, record.latitude],
        valid: true,
        altitude: record.altitude,
      };

      this.history.addRecords(record.id, [historyRecord]);

      if (this.filter.filter.some(it => it.id === record.id)) {
        this.aeroscore.addFixes({ [record.id]: [historyRecord] });
      }
    }
  }

  getBBox() {
    let extent = this.map.getView().calculateExtent();
    return transformExtent(extent, EPSG_3857, EPSG_4326);
  }
}
