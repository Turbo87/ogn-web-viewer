import Service from '@ember/service';
import { task, all, timeout } from 'ember-concurrency';
import ajax from 'ember-fetch/ajax';
import { Server } from 'mock-socket';
import lolex from 'lolex';

import IGCParser from 'igc-parser';
import bearing from '@turf/bearing';

import config from 'ogn-web-viewer/config/environment';
import fetchText from 'ogn-web-viewer/utils/fetch-text';

const START_TIME = Date.parse('2018-05-27T11:59:28Z');

export default Service.extend({
  start() {
    this.clock = lolex.install({ now: START_TIME, shouldAdvanceTime: true });

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

    this.clock.uninstall();
  },

  replayTask: task(function*() {
    let filenames = yield ajax('/igc-replay/Bayreuth-2018-05-27.json');
    yield all(filenames.map(filename => this.replayFileTask.perform(filename)));
  }),

  replayFileTask: task(function*(filename) {
    let url = `/igc-replay/Bayreuth-2018-05-27/${filename}`;
    let content = yield fetchText(url);
    let parsed = IGCParser.parse(content);

    let nextIndex = parsed.fixes.findIndex(it => it.timestamp > START_TIME);
    let prevPoint = null;

    while (true) {
      let now = Date.now();
      let newNextIndex = parsed.fixes.findIndex(it => it.timestamp > now);

      let dtFixes = parsed.fixes.slice(nextIndex, newNextIndex);

      for (let fix of dtFixes) {
        let point = [fix.longitude, fix.latitude];

        if (this.socket) {
          let _bearing = prevPoint ? bearing(prevPoint, point) : 0;

          let data = [`REPLAY_${filename}`, fix.timestamp, fix.longitude, fix.latitude, _bearing, fix.gpsAltitude];
          this.socket.send(data.join('|'));
        }

        prevPoint = point;
      }

      nextIndex = newNextIndex;

      yield timeout(500);
    }
  }),
});