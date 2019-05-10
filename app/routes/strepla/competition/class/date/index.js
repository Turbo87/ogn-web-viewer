import Route from '@ember/routing/route';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';

import { scaleFromCenter } from 'ol/extent';
import { transformExtent } from 'ol/proj';

import { normalizeDeviceId } from 'ogn-web-viewer/utils/normalize-device-id';
import { convertTask } from 'ogn-web-viewer/utils/strepla-to-xcsoar';

const EPSG_4326 = 'EPSG:4326';
const EPSG_3857 = 'EPSG:3857';

export default class extends Route {
  @service filter;
  @service scoring;
  @service history;
  @service ws;
  @service('map') mapService;

  async model() {
    let competition = this.modelFor('strepla.competition');
    let competitionClass = this.modelFor('strepla.competition.class');
    let competitionDay = this.modelFor('strepla.competition.class.date');

    let [competitors, task] = await Promise.all([
      this.loadCompetitors(competition.id, competitionClass.name),
      this.loadTask(competition.id, competitionDay.id),
    ]);

    return { competitors, task };
  }

  async loadTask(competitionId, competitionDayId) {
    let [taskRecord, { readTaskFromString }] = await Promise.all([
      this.store.queryRecord('strepla-task', {
        competitionId,
        competitionDayId,
      }),
      import('aeroscore/dist/src/read-task'),
    ]);

    let xmlTask = convertTask(taskRecord);

    return readTaskFromString(xmlTask);
  }

  async loadCompetitors(competitionId, className) {
    let competitors = await this.store.query('strepla-competitor', {
      competitionId,
      className,
    });

    return competitors.map(it => {
      let id = normalizeDeviceId(it.flarmID) || it.flarmID;
      let name = it.name;
      let registration = it.registration;
      let callsign = it.callsign;
      let type = it.type;
      let handicap = it.handicap || 1;
      return { id, name, registration, callsign, type, handicap };
    });
  }

  setupController(controller, { competitors, task }) {
    if (competitors.length !== 0) {
      run(() => this.filter.add(...competitors));

      for (let record of competitors) {
        this.ws.subscribeToId(record.id);
      }

      this.history.loadForIds(...competitors.map(record => record.id));
    }

    run(() => this.scoring.set('task', task));
    this.mapService.map.updateSize();

    if (task) {
      // zoom map in on the task area
      let bbox = task.bbox.slice();
      scaleFromCenter(bbox, 0.3);
      let extent = transformExtent(bbox, EPSG_4326, EPSG_3857);

      setTimeout(() => this.mapService.map.getView().fit(extent, { duration: 1000 }), 100);
    }
  }
}
