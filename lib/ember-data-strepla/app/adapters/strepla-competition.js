import { assert } from '@ember/debug';
import DS from 'ember-data';

import ajax from 'ember-fetch/ajax';

const { Adapter } = DS;

export const COMPETITIONS_URL = 'http://www.strepla.de/scs/ws/competition.ashx?cmd=active';

export default class extends Adapter {
  async query(store, type /*, query */) {
    assert('Query `type` must be `strepla-competition`', type.modelName === 'strepla-competition');

    try {
      return await ajax(COMPETITIONS_URL);
    } catch (errorResponse) {
      let error = new Error(`${type.modelName}: query() failed`);
      error.response = errorResponse;
      throw error;
    }
  }
}
