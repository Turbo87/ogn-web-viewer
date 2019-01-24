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
      ID: parseID(row.ID),
      HANDICAP: 'HANDICAP' in row ? parseFloat(row.HANDICAP) : 1.0,
    }));
  }

  hasFilter() {
    return this.filter.length !== 0;
  }
}

function parseID(id) {
  if (id.startsWith('06') && id.length === 8) {
    return `FLR${id.substr(2)}`;
  }

  if (id.length === 6) {
    return `FLR${id}`;
  }

  return id;
}

let service = new DeviceFilterService();

export default service;
