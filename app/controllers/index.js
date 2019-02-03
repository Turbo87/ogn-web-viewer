import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { task } from 'ember-concurrency';

import { scaleFromCenter } from 'ol/extent';
import { transformExtent } from 'ol/proj';

import fetchText from 'ogn-web-viewer/utils/fetch-text';

const EPSG_4326 = 'EPSG:4326';
const EPSG_3857 = 'EPSG:3857';

export default Controller.extend({
  filter: service(),
  scoring: service(),
  mapService: service('map'),

  queryParams: {
    taskURL: 'tsk',
    filterURL: 'lst',
  },

  taskURL: null,
  filterURL: null,

  hasDeviceFilter: alias('filter.hasFilter'),

  loadDataTask: task(function*() {
    let hash = location.hash || '';
    let params = new URLSearchParams(hash.substr(1));

    let filterURL = params.get('lst');
    let taskURL = params.get('tsk');

    yield Promise.all([this.loadDeviceFilter(filterURL), this.loadTask(taskURL)]);

    this.mapService.map.updateSize();
  }),

  async loadDeviceFilter(url) {
    if (url) {
      await this.filter.load(url);
    }
  },

  async loadTask(url) {
    if (url) {
      let { readTaskFromString } = await import('aeroscore/dist/src/read-task');
      let task = readTaskFromString(await fetchText(url));
      this.scoring.set('task', task);

      // zoom map in on the task area
      let bbox = task.bbox.slice();
      scaleFromCenter(bbox, 0.3);
      let extent = transformExtent(bbox, EPSG_4326, EPSG_3857);

      this.mapService.map.getView().fit(extent);
    }
  },
});
