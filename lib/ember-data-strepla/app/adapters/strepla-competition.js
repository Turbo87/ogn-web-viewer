import { assert } from '@ember/debug';
import DS from 'ember-data';
import { COMPETITION_LIST_URL } from 'ember-data-strepla/urls';

import BaseAdapter from './-base';

const { NotFoundError } = DS;

export default class extends BaseAdapter {
  async findRecord(store, type, id) {
    assert('Query `type` must be `strepla-competition`', type.modelName === 'strepla-competition');

    let competitions = await this._query();
    let competition = competitions.find(it => String(it.id) === id);

    if (!competition) {
      competitions = await this._query({ daysPeriod: 365 });
      competition = competitions.find(it => String(it.id) === id);
    }

    if (!competition) {
      competitions = await this._query({ daysPeriod: 100000 });
      competition = competitions.find(it => String(it.id) === id);
    }

    if (!competition) {
      throw new NotFoundError(null, `Competition with ID ${id} could not be found`);
    }

    return competition;
  }

  async query(store, type, query) {
    assert('Query `type` must be `strepla-competition`', type.modelName === 'strepla-competition');

    return await this._query(query);
  }

  async _query({ daysPeriod } = {}) {
    let url = COMPETITION_LIST_URL;
    if (daysPeriod) {
      url += `&daysPeriod=${daysPeriod}`;
    }

    return await this._request(url);
  }
}
