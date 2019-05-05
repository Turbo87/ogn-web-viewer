import { assert } from '@ember/debug';
import DS from 'ember-data';

import ajax from 'ember-fetch/ajax';

const { Adapter, NotFoundError } = DS;

export const COMPETITIONS_URL = 'http://www.strepla.de/scs/ws/competition.ashx?cmd=active';

export default class extends Adapter {
  async findRecord(store, type, id) {
    assert('Query `type` must be `strepla-competition`', type.modelName === 'strepla-competition');

    let competitions = await this._request(type, `findRecord(${id})`);
    let competition = competitions.find(it => String(it.id) === id);

    if (!competition) {
      competitions = await this._request(type, `findRecord(${id})`, { daysPeriod: 365 });
      competition = competitions.find(it => String(it.id) === id);
    }

    if (!competition) {
      competitions = await this._request(type, `findRecord(${id})`, { daysPeriod: 100000 });
      competition = competitions.find(it => String(it.id) === id);
    }

    if (!competition) {
      throw new NotFoundError(null, `Competition with ID ${id} could not be found`);
    }

    return competition;
  }

  async query(store, type, query) {
    assert('Query `type` must be `strepla-competition`', type.modelName === 'strepla-competition');

    return await this._request(type, 'query()', query);
  }

  async _request(type, requestType, { daysPeriod } = {}) {
    let url = COMPETITIONS_URL;
    if (daysPeriod) {
      url += `&daysPeriod=${daysPeriod}`;
    }

    try {
      return await ajax(url);
    } catch (errorResponse) {
      let error = new Error(`${type.modelName}: ${requestType} failed`);
      error.response = errorResponse;
      throw error;
    }
  }
}
