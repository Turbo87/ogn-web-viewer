import Service from '@ember/service';
import { task } from 'ember-concurrency';
import ajax from 'ember-fetch/ajax';

import config from '../config/environment';

export default Service.extend({
  init() {
    this._super(...arguments);
    this.set('devices', {});
  },

  update() {
    return this.updateTask.perform();
  },

  updateTask: task(function*() {
    this.set('devices', yield ajax(`${config.API_HOST}/api/ddb`));
  }),
});
