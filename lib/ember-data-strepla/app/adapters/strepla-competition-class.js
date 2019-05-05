import DS from 'ember-data';
import { assert } from '@ember/debug';
import ajax from 'ember-fetch/ajax';

import { COMPETITION_CLASS_LIST_URL } from 'ember-data-strepla/urls';

const { Adapter } = DS;

export default class extends Adapter {
  async query(store, type, query) {
    assert('Query `type` must be `strepla-competition-class`', type.modelName === 'strepla-competition-class');
    assert('Query must have a `competitionId` property', query.competitionId);

    return await this._request(type, 'query()', query);
  }

  async _request(type, requestType, { competitionId }) {
    let url = `${COMPETITION_CLASS_LIST_URL}&cID=${competitionId}`;

    try {
      return await ajax(url);
    } catch (errorResponse) {
      let error = new Error(`${type.modelName}: ${requestType} failed`);
      error.response = errorResponse;
      throw error;
    }
  }
}
