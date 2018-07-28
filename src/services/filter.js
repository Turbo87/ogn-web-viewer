import axios from 'axios';
import neatCSV from 'neat-csv';

class DeviceFilterService {
  constructor() {
    this.filter = [];
  }

  async load(url) {
    // TODO we should find a better solution for this...
    let response = await axios(`/api/cors-proxy/${url}`, {
      responseType: 'text',
    });

    let data = await neatCSV(response.data);

    this.filter = data.map(row => ({
      ...row,
      HANDICAP: parseFloat(row.HANDICAP),
    }));
  }

  hasFilter() {
    return this.filter.length !== 0;
  }
}

let service = new DeviceFilterService();

export default service;
