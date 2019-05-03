import Service from '@ember/service';
import { task, all, waitForProperty } from 'ember-concurrency';
import ajax from 'ember-fetch/ajax';
import { Server } from 'mock-socket';
import lolex from 'lolex';
import { Polly } from '@pollyjs/core';

import IGCParser from 'igc-parser';
import bearing from '@turf/bearing';

import config from 'ogn-web-viewer/config/environment';
import fetchText from 'ogn-web-viewer/utils/fetch-text';
import timeout from 'ogn-web-viewer/utils/timeout';

const START_TIME = Date.parse('2018-05-27T12:32:28Z');

export default Service.extend({
  start(options = {}) {
    let now = 'now' in options ? options.now : START_TIME;

    this.clock = lolex.install({ now, shouldAdvanceTime: true });

    this.polly = new Polly('igc-replay', { recordIfMissing: false, logging: true });
    this.polly.server.get('https://maps.tilehosting.com/*').passthrough();
    this.polly.server.get('/igc-replay/*').passthrough();

    this.polly.server.get(`${config.API_HOST}/api/records/:ids`).intercept(async (req, res) => {
      await waitForProperty(
        this,
        'filesLoaded',
        filesLoaded => this.filesTotal !== null && filesLoaded === this.filesTotal,
      );

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

    this.replayTask.perform();
  },

  stop() {
    this.replayTask.cancelAll();

    this.socket = null;
    this.server.stop();
    this.server = null;

    this.polly.stop();
    this.polly = null;

    this.clock.uninstall();
  },

  replayTask: task(function*() {
    let manifest = yield ajax('/igc-replay/Bayreuth-2018-05-27.json');
    let filenames = Object.keys(manifest);

    this.filesLoaded = 0;
    this.set('filesTotal', filenames.length);
    this.files = new Map();

    yield all(filenames.map(filename => this.replayFileTask.perform(filename, manifest[filename])));
  }),

  replayFileTask: task(function*(filename, ognID) {
    let url = `/igc-replay/Bayreuth-2018-05-27/${filename}`;
    let content = yield fetchText(url);
    let parsed = IGCParser.parse(content);

    this.files.set(ognID, parsed);
    this.set('filesLoaded', this.filesLoaded + 1);

    let now = Date.now();
    let nextIndex = parsed.fixes.findIndex(it => it.timestamp > now);
    let prevPoint = null;

    while (true) {
      let now = Date.now();
      let newNextIndex = parsed.fixes.findIndex(it => it.timestamp > now);

      let dtFixes = parsed.fixes.slice(nextIndex, newNextIndex);

      for (let fix of dtFixes) {
        let point = [fix.longitude, fix.latitude];

        if (this.socket) {
          let _bearing = prevPoint ? bearing(prevPoint, point) : 0;

          let data = [ognID, fix.timestamp / 1000, fix.longitude, fix.latitude, _bearing, fix.gpsAltitude];
          this.socket.send(data.join('|'));
        }

        prevPoint = point;
      }

      nextIndex = newNextIndex;

      yield timeout(500);
    }
  }),
});
