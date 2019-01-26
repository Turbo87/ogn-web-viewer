import Service from '@ember/service';
import { notEmpty } from '@ember/object/computed';
import fetch from 'fetch';

export default Service.extend({
  init() {
    this._super(...arguments);
    this.filter = [];
  },

  async load(url) {
    let [text, neatCSV] = await Promise.all([fetchText(url), loadNeatCSV()]);

    let data = await neatCSV(text);

    this.filter = data.map(row => ({
      ...row,
      ID: parseID(row.ID),
      HANDICAP: 'HANDICAP' in row ? parseFloat(row.HANDICAP) : 1.0,
    }));
  },

  hasFilter: notEmpty('filter'),
});

async function fetchText(url) {
  let response = await fetch(url);
  if (response.ok) {
    return response.text();
  }

  throw response;
}

async function loadNeatCSV() {
  let neatCSV = await import('neat-csv');
  return neatCSV.default;
}

export function parseID(id) {
  if (id.startsWith('06') && id.length === 8) {
    return `FLR${id.substr(2)}`;
  }

  if (id.length === 6) {
    return `FLR${id}`;
  }

  return id;
}
