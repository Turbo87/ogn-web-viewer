import { assert } from '@ember/debug';
import { TASK_URL } from 'ember-data-strepla/urls';

import BaseAdapter from './-base';

export default class extends BaseAdapter {
  async queryRecord(store, type, query) {
    assert('Query `type` must be `strepla-task`', type.modelName === 'strepla-task');

    let { competitionId, competitionDayId } = query;
    assert('Query must have a `competitionId` property', competitionId);
    assert('Query must have a `competitionDayId` property', competitionDayId);

    let task = await this._request(`${TASK_URL}&cID=${competitionId}&idDay=${competitionDayId}`);
    return { ...task, competitionId, competitionDayId };
  }
}
