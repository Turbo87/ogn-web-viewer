import Service from '@ember/service';

import ajax from 'ember-fetch/ajax';

import config from 'ogn-web-viewer/config/environment';

export default class extends Service {
  _byId = {};

  async loadForIds(...ids) {
    let after = Math.round(Date.now() / 1000) - 8 * 60 * 60;

    let idList = encodeURIComponent(ids.join(','));
    let url = `${config.API_HOST}/api/records/${idList}?after=${after}`;
    let data = await ajax(url);

    for (let id of ids) {
      let list = data[id] || [];

      this.addRecords(
        id,
        list.map(row => {
          let fields = row.split('|');

          return {
            time: parseInt(fields[0], 10) * 1000,
            coordinate: [parseFloat(fields[1]), parseFloat(fields[2])],
            valid: true,
            altitude: parseInt(fields[3], 10),
          };
        }),
      );
    }
  }

  forId(id) {
    let old = this._byId[id];
    if (!old) {
      old = [];
      this._byId[id] = old;
    }
    return old;
  }

  addRecords(id, records) {
    let array = this.forId(id);
    array.push(...records);
    array.sort((a, b) => a.time - b.time);
  }
}
