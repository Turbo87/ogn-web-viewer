import axios from 'axios';

class HistoryService {
  constructor() {
    this._byId = {};
  }

  async loadForIds(...ids) {
    let after = Math.round(Date.now() / 1000) - 8 * 60 * 60;

    // TODO Add CORS headers to the gateway
    let url = `${process.env.VUE_APP_API_HOST}/api/records/${ids.join(',')}?after=${after}`;
    let { data } = await axios(url);

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
            altitude: 0, // TODO add altitude to gateway responses
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

let service = new HistoryService();

export default service;
