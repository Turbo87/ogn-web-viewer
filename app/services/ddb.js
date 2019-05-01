import Service from '@ember/service';
import { task } from 'ember-concurrency-decorators';
import ajax from 'ember-fetch/ajax';

import config from '../config/environment';

export default class extends Service {
  devices = {};

  update() {
    return this.updateTask.perform();
  }

  @task
  updateTask = function*() {
    this.set('devices', yield ajax(`${config.API_HOST}/api/ddb`));
  };
}
