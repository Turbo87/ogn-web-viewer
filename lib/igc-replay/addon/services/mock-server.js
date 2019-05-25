import Service from '@ember/service';

import { Polly } from '@pollyjs/core';
import { Server } from 'mock-socket';

import config from 'ogn-web-viewer/config/environment';

export default class extends Service {
  history = new Map();

  start() {
    this.polly = new Polly('mock-server', { recordIfMissing: false });
    this.polly.server.get('https://maps.tilehosting.com/*').passthrough();
    this.polly.server.get('/igc-replay/*').passthrough();
    this.polly.server.get('/translations/*').passthrough();

    this.polly.server.get(`${config.API_HOST}/api/ddb`).intercept((req, res) => res.status(200).send({}));

    this.polly.server.get(`${config.API_HOST}/api/records/:ids`).intercept(async (req, res) => {
      let ids = req.params.ids.split(',');
      let after = req.query.after * 1000;

      let data = {};

      for (let ognID of ids) {
        let history = this.history.get(ognID);
        if (history) {
          let fixes = history.filter(fix => fix.timestamp > after);
          data[ognID] = fixes.map(fix => `${fix.timestamp / 1000}|${fix.longitude}|${fix.latitude}|${fix.gpsAltitude}`);
        }
      }

      return res.status(200).send(data);
    });

    this.server = new Server(`${config.WS_HOST}/api/live`);
    this.server.on('connection', socket => {
      this.socket = socket;
    });
  }

  stop() {
    this.socket = null;
    this.server.stop();
    this.server = null;

    this.polly.stop();
    this.polly = null;
  }

  handleRecord(record) {
    let { id } = record;

    let history = this.history.get(id);
    if (!history) {
      history = [];
      this.history.set(id, history);
    }

    history.push(record);

    if (this.socket) {
      let data = [id, record.timestamp / 1000, record.longitude, record.latitude, record.bearing, record.altitude];
      this.socket.send(data.join('|'));
    }
  }
}
