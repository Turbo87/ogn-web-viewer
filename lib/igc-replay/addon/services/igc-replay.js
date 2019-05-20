import Service, { inject as service } from '@ember/service';

import bearing from '@turf/bearing';
import { all } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import ajax from 'ember-fetch/ajax';
import IGCParser from 'igc-parser';
import lolex from 'lolex';

import fetchText from 'ogn-web-viewer/utils/fetch-text';
import timeout from 'ogn-web-viewer/utils/timeout';

const START_TIME = Date.parse('2018-05-27T12:32:28Z');

export default class extends Service {
  @service mockServer;

  files = new Map();
  replays = new Map();

  async start(options = {}) {
    let now = 'now' in options ? options.now : START_TIME;

    this.clock = lolex.install({ now, shouldAdvanceTime: true });

    this.mockServer.start();

    await this.loadTask.perform();

    this.replayTask.perform();
  }

  stop() {
    this.replayTask.cancelAll();

    this.mockServer.stop();

    this.clock.uninstall();
  }

  @task
  loadTask = function*() {
    let manifest = yield ajax('/igc-replay/Bayreuth-2018-05-27.json');
    this.filenames = Object.keys(manifest);

    yield all(this.filenames.map(filename => this.loadFileTask.perform(filename, manifest[filename])));
  };

  @task
  loadFileTask = function*(filename, ognID) {
    let url = `/igc-replay/Bayreuth-2018-05-27/${filename}`;
    let content = yield fetchText(url);
    let parsed = IGCParser.parse(content);

    this.files.set(ognID, parsed);

    this.replays.set(filename, new IGCFileReplay(ognID, parsed, Date.now(), this.mockServer));
  };

  @task
  replayTask = function*() {
    while (true) {
      for (let filename of this.filenames) {
        this.replays.get(filename).setTime(Date.now());
      }

      yield timeout(500);
    }
  };
}

class IGCFileReplay {
  constructor(id, igcFile, now, mockServer) {
    this.id = id;
    this.igcFile = igcFile;
    this.mockServer = mockServer;

    this.nextIndex = igcFile.fixes.findIndex(it => it.timestamp > now);
    this.prevPoint = null;

    this.mockServer.history.set(id, igcFile.fixes.slice(0, this.nextIndex));
  }

  setTime(now) {
    let newNextIndex = this.igcFile.fixes.findIndex(it => it.timestamp > now);

    let dtFixes = this.igcFile.fixes.slice(this.nextIndex, newNextIndex);

    for (let fix of dtFixes) {
      let point = [fix.longitude, fix.latitude];
      let _bearing = this.prevPoint ? bearing(this.prevPoint, point) : 0;

      this.mockServer.handleRecord({
        id: this.id,
        timestamp: fix.timestamp,
        longitude: fix.longitude,
        latitude: fix.latitude,
        bearing: _bearing,
        altitude: fix.gpsAltitude,
      });

      this.prevPoint = point;
    }

    this.nextIndex = newNextIndex;
  }
}
