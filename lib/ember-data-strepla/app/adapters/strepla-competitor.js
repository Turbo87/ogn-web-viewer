import { assert } from '@ember/debug';
import { COMPETITOR_LIST_URL } from 'ember-data-strepla/urls';

import BaseAdapter from './-base';

export default class extends BaseAdapter {
  async query(store, type, query) {
    assert('Query `type` must be `strepla-competitor`', type.modelName === 'strepla-competitor');

    let { competitionId } = query;
    assert('Query must have a `competitionId` property', competitionId);

    let competitors = await this._request(`${COMPETITOR_LIST_URL}&cID=${competitionId}`);

    if (query.className) {
      competitors = competitors.filter(it => it.className === query.className);
    }

    return competitors.map(it => ({ ...it, competitionId }));
  }
}
