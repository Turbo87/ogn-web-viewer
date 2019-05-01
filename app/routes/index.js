import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';

import { scaleFromCenter } from 'ol/extent';
import { transformExtent } from 'ol/proj';

import fetchText from 'ogn-web-viewer/utils/fetch-text';

const EPSG_4326 = 'EPSG:4326';
const EPSG_3857 = 'EPSG:3857';

export default class extends Route {
  @service filter;
  @service scoring;
  @service history;
  @service ws;
  @service('map') mapService;

  async model() {
    let hash = location.hash || '';
    let params = new URLSearchParams(hash.substr(1));

    return Promise.all([this.loadDeviceFilter(params.get('lst')), this.loadTask(params.get('tsk'))]);
  }

  setupController(controller, [filter, task]) {
    run(() => this.scoring.set('task', task));
    this.mapService.map.updateSize();

    if (task) {
      // zoom map in on the task area
      let bbox = task.bbox.slice();
      scaleFromCenter(bbox, 0.3);
      let extent = transformExtent(bbox, EPSG_4326, EPSG_3857);

      this.mapService.map.getView().fit(extent);
    }

    if (filter.length !== 0) {
      for (let row of filter) {
        this.ws.subscribeToId(row.ID);
      }

      this.history.loadForIds(...filter.map(row => row.ID));
    }
  }

  async loadDeviceFilter(url) {
    if (url) {
      await this.filter.load(url);
    }

    return this.filter.filter;
  }

  async loadTask(url) {
    if (url) {
      let { readTaskFromString } = await import('aeroscore/dist/src/read-task');
      return readTaskFromString(await fetchText(url));
    }
  }
}
