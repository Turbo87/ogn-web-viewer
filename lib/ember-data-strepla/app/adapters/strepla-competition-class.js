import { assert } from '@ember/debug';
import { COMPETITION_CLASS_LIST_URL } from 'ember-data-strepla/urls';

import BaseAdapter from './-base';

export default class extends BaseAdapter {
  async query(store, type, query) {
    assert('Query `type` must be `strepla-competition-class`', type.modelName === 'strepla-competition-class');

    let { competitionId } = query;
    assert('Query must have a `competitionId` property', competitionId);

    let classes = await this._request(`${COMPETITION_CLASS_LIST_URL}&cID=${competitionId}`);
    return classes.map(it => ({ ...it, competitionId }));
  }
}
