import Service from '@ember/service';
import { notEmpty } from '@ember/object/computed';
import fetchText from 'ogn-web-viewer/utils/fetch-text';
import { normalizeDeviceId } from 'ogn-web-viewer/utils/normalize-device-id';

export default class extends Service {
  filter = [];

  async load(url) {
    let [text, neatCSV] = await Promise.all([fetchText(url), loadNeatCSV()]);

    let data = await neatCSV(text);

    this.set(
      'filter',
      data.map(row => ({
        ...row,
        ID: normalizeDeviceId(row.ID) || row.ID,
        HANDICAP: 'HANDICAP' in row ? parseFloat(row.HANDICAP) : 1.0,
      })),
    );
  }

  @notEmpty('filter') hasFilter;
}

async function loadNeatCSV() {
  let neatCSV = await import('neat-csv');
  return neatCSV.default;
}
