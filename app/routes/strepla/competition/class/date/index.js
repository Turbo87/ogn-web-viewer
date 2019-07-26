import Route from '@ember/routing/route';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';

import { scaleFromCenter } from 'ol/extent';
import { transformExtent } from 'ol/proj';

import fetchText from 'ogn-web-viewer/utils/fetch-text';
import { normalizeDeviceId } from 'ogn-web-viewer/utils/normalize-device-id';
import { convertTask } from 'ogn-web-viewer/utils/strepla-to-xcsoar';

const EPSG_4326 = 'EPSG:4326';
const EPSG_3857 = 'EPSG:3857';

export default class extends Route {
  @service aeroscore;
  @service filter;
  @service scoring;
  @service history;
  @service ws;
  @service('map') mapService;

  async model(params, transition) {
    let { queryParams } = transition.to;

    let competition = this.modelFor('strepla.competition');
    let competitionClass = this.modelFor('strepla.competition.class');
    let competitionDay = this.modelFor('strepla.competition.class.date');

    let [competitors, [task, taskText]] = await Promise.all([
      queryParams.lst
        ? this.loadFilterFromURL(queryParams.lst)
        : this.loadCompetitors(competition.id, competitionClass.name),

      this.loadTask(competition.id, competitionDay.id),
    ]);

    return { competitors, task, taskText };
  }

  async loadTask(competitionId, competitionDayId) {
    let [taskRecord, { createTask }, { readITaskFromString }] = await Promise.all([
      this.store.queryRecord('strepla-task', {
        competitionId,
        competitionDayId,
      }),
      import('aeroscore/dist/src/create-task'),
      import('aeroscore/dist/src/read-task'),
    ]);

    let xmlTask = convertTask(taskRecord);
    let jsonTask = readITaskFromString(xmlTask);
    let task = createTask(jsonTask);

    return [task, jsonTask];
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

  async loadFilterFromURL(url) {
    let [text, { default: neatCSV }] = await Promise.all([fetchText(url), import('neat-csv')]);
    let records = await neatCSV(text);

    return records.map(row => {
      let id = normalizeDeviceId(row.ID) || row.ID;
      let name = row.NAME;
      let registration = row.CALL;
      let callsign = row.CN;
      let type = row.TYPE;
      let handicap = 'HANDICAP' in row ? parseFloat(row.HANDICAP) : 1.0;
      return { id, name, registration, callsign, type, handicap };
    });
  }

  setupController(controller, { competitors, task, taskText }) {
    if (competitors.length !== 0) {
      run(() => this.filter.setFilter(competitors));
      run(() => this.aeroscore.setPilots(competitors.toArray()));

      for (let record of competitors) {
        this.ws.subscribeToId(record.id);
      }

      // eslint-disable-next-line promise/prefer-await-to-then
      this.history.loadForIds(...competitors.map(record => record.id)).then(() => {
        let fixesPerPilot = Object.create(null);
        for (let { id } of competitors) {
          fixesPerPilot[id] = this.history.forId(id);
        }

        this.aeroscore.addFixes(fixesPerPilot);
      });
    }

    run(() => this.scoring.setTask(task));
    run(() => this.aeroscore.setTask(taskText));
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
