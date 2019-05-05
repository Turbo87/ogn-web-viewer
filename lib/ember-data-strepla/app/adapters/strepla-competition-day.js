import { assert } from '@ember/debug';
import { COMPETITION_DAY_LIST_URL } from 'ember-data-strepla/urls';

import BaseAdapter from './-base';

export default class extends BaseAdapter {
  async query(store, type, query) {
    assert('Query `type` must be `strepla-competition-day`', type.modelName === 'strepla-competition-day');

    let { competitionId } = query;
    assert('Query must have a `competitionId` property', competitionId);

    let days = await this._request(`${COMPETITION_DAY_LIST_URL}&cID=${competitionId}`);
    return days.map(it => ({ ...it, competitionId }));
  }
}
