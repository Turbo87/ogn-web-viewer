import { assert } from '@ember/debug';
import DS from 'ember-data';
import { COMPETITION_DAY_LIST_URL } from 'ember-data-strepla/urls';

import ajax from 'ember-fetch/ajax';

const { Adapter } = DS;

export default class extends Adapter {
  async query(store, type, query) {
    assert('Query `type` must be `strepla-competition-day`', type.modelName === 'strepla-competition-day');

    let { competitionId } = query;
    assert('Query must have a `competitionId` property', competitionId);

    return (await this._request(type, 'query()', query)).map(it => ({ ...it, competitionId }));
  }

  async _request(type, requestType, { competitionId }) {
    let url = `${COMPETITION_DAY_LIST_URL}&cID=${competitionId}`;

    try {
      return await ajax(url);
    } catch (errorResponse) {
      let error = new Error(`${type.modelName}: ${requestType} failed`);
      error.response = errorResponse;
      throw error;
    }
  }
}
