import { assert } from '@ember/debug';
import DS from 'ember-data';
import { TASK_URL } from 'ember-data-strepla/urls';

import ajax from 'ember-fetch/ajax';

const { Adapter } = DS;

export default class extends Adapter {
  async queryRecord(store, type, query) {
    assert('Query `type` must be `strepla-task`', type.modelName === 'strepla-task');

    let { competitionId, competitionDayId } = query;
    assert('Query must have a `competitionId` property', competitionId);
    assert('Query must have a `competitionDayId` property', competitionDayId);

    let task = await this._request(type, 'queryRecord()', query);
    return { ...task, competitionId, competitionDayId };
  }

  async _request(type, requestType, { competitionId, competitionDayId }) {
    let url = `${TASK_URL}&cID=${competitionId}&idDay=${competitionDayId}`;

    try {
      return await ajax(url);
    } catch (errorResponse) {
      let error = new Error(`${type.modelName}: ${requestType} failed`);
      error.response = errorResponse;
      throw error;
    }
  }
}
