import DS from 'ember-data';
import { assert } from '@ember/debug';
import ajax from 'ember-fetch/ajax';

import { COMPETITOR_LIST_URL } from 'ember-data-strepla/urls';

const { Adapter } = DS;

export default class extends Adapter {
  async query(store, type, query) {
    assert('Query `type` must be `strepla-competitor`', type.modelName === 'strepla-competitor');

    let { competitionId } = query;
    assert('Query must have a `competitionId` property', competitionId);

    let competitors = await this._request(type, 'query()', query);

    if (query.className) {
      competitors = competitors.filter(it => it.className === query.className);
    }

    return competitors.map(it => ({ ...it, competitionId }));
  }

  async _request(type, requestType, { competitionId }) {
    let url = `${COMPETITOR_LIST_URL}&cID=${competitionId}`;

    try {
      return await ajax(url);
    } catch (errorResponse) {
      let error = new Error(`${type.modelName}: ${requestType} failed`);
      error.response = errorResponse;
      throw error;
    }
  }
}
