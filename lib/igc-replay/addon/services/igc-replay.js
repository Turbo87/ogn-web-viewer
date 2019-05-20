import Service from '@ember/service';

import { Polly } from '@pollyjs/core';
import bearing from '@turf/bearing';
import { all } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import ajax from 'ember-fetch/ajax';
import IGCParser from 'igc-parser';
import lolex from 'lolex';
import { Server } from 'mock-socket';

import config from 'ogn-web-viewer/config/environment';
import fetchText from 'ogn-web-viewer/utils/fetch-text';
import timeout from 'ogn-web-viewer/utils/timeout';

const START_TIME = Date.parse('2018-05-27T12:32:28Z');

export default class extends Service {
  files = new Map();
  replays = new Map();

  async start(options = {}) {
    let now = 'now' in options ? options.now : START_TIME;

    this.clock = lolex.install({ now, shouldAdvanceTime: true });

    this.polly = new Polly('igc-replay', { recordIfMissing: false });
    this.polly.server.get('https://maps.tilehosting.com/*').passthrough();
    this.polly.server.get('/igc-replay/*').passthrough();

    this.polly.server.get(`${config.API_HOST}/api/ddb`).intercept((req, res) => res.status(200).send({}));

    this.polly.server.get(`${config.API_HOST}/api/records/:ids`).intercept(async (req, res) => {
      let ids = req.params.ids.split(',');
      let after = req.query.after * 1000;

      let data = {};

      let now = Date.now();
      for (let ognID of ids) {
        let file = this.files.get(ognID);
        if (file) {
          let fixes = file.fixes.filter(fix => fix.timestamp > after && fix.timestamp < now);
          data[ognID] = fixes.map(fix => `${fix.timestamp / 1000}|${fix.longitude}|${fix.latitude}|${fix.gpsAltitude}`);
        }
      }

      return res.status(200).send(data);
    });

    this.server = new Server(`${config.WS_HOST}/api/live`);
    this.server.on('connection', socket => {
      this.socket = socket;
    });

    await this.loadTask.perform();

    this.replayTask.perform();
  }

  stop() {
    this.replayTask.cancelAll();

    this.socket = null;
    this.server.stop();
    this.server = null;

    this.polly.stop();
    this.polly = null;

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

    this.replays.set(
      filename,
      new IGCFileReplay(parsed, Date.now(), fix => {
        if (this.socket) {
          let data = [ognID, fix.timestamp / 1000, fix.longitude, fix.latitude, fix.bearing, fix.altitude];
          this.socket.send(data.join('|'));
        }
      }),
    );
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
  constructor(igcFile, now, callback) {
    this.igcFile = igcFile;
    this.callback = callback;

    this.nextIndex = igcFile.fixes.findIndex(it => it.timestamp > now);
    this.prevPoint = null;
  }

  setTime(now) {
    let newNextIndex = this.igcFile.fixes.findIndex(it => it.timestamp > now);

    let dtFixes = this.igcFile.fixes.slice(this.nextIndex, newNextIndex);

    for (let fix of dtFixes) {
      let point = [fix.longitude, fix.latitude];
      let _bearing = this.prevPoint ? bearing(this.prevPoint, point) : 0;

      this.callback({
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
