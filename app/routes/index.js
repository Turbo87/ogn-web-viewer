import Route from '@ember/routing/route';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';

import { scaleFromCenter } from 'ol/extent';
import { transformExtent } from 'ol/proj';

import fetchText from 'ogn-web-viewer/utils/fetch-text';
import { normalizeDeviceId } from 'ogn-web-viewer/utils/normalize-device-id';

const EPSG_4326 = 'EPSG:4326';
const EPSG_3857 = 'EPSG:3857';

export default class extends Route {
  @service filter;
  @service scoring;
  @service history;
  @service ws;
  @service('map') mapService;

  async model(params, transition) {
    let { queryParams } = transition.to;

    return Promise.all([this.loadDeviceFilter(queryParams.lst), this.loadTask(queryParams.tsk)]);
  }

  setupController(controller, [filter, task]) {
    if (filter.length !== 0) {
      let records = filter.map(row => {
        let id = normalizeDeviceId(row.ID) || row.ID;
        let name = row.NAME;
        let registration = row.CALL;
        let callsign = row.CN;
        let type = row.TYPE;
        let handicap = 'HANDICAP' in row ? parseFloat(row.HANDICAP) : 1.0;
        return { id, name, registration, callsign, type, handicap };
      });

      run(() => this.filter.add(...records));

      for (let record of records) {
        this.ws.subscribeToId(record.id);
      }

      this.history.loadForIds(...records.map(record => record.id));
    }

    run(() => this.scoring.setTask(task));
    this.mapService.map.updateSize();

    if (task) {
      // zoom map in on the task area
      let bbox = task.bbox.slice();
      scaleFromCenter(bbox, 0.3);
      let extent = transformExtent(bbox, EPSG_4326, EPSG_3857);

      setTimeout(() => this.mapService.map.getView().fit(extent, { duration: 1000 }), 100);
    }
  }

  async loadDeviceFilter(url) {
    if (url) {
      let [text, { default: neatCSV }] = await Promise.all([fetchText(url), import('neat-csv')]);

      return await neatCSV(text);
    }

    return [];
  }

  async loadTask(url) {
    if (url) {
      let [text, { readTaskFromString }] = await Promise.all([fetchText(url), import('aeroscore/dist/src/read-task')]);

      try {
        return readTaskFromString(text);
      } catch (cause) {
        throw new InvalidTaskError({ url, cause });
      }
    }
  }
}

class InvalidTaskError extends Error {
  constructor({ url, cause }) {
    super(cause.message);
    this.name = 'InvalidTaskError';
    this.cause = cause;
    this.url = url;
  }
}
