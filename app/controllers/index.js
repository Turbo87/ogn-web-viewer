import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { task } from 'ember-concurrency';

import fetchText from 'ogn-web-viewer/utils/fetch-text';

export default Controller.extend({
  filter: service(),

  task: null,
  hasDeviceFilter: alias('filter.hasFilter'),

  loadDataTask: task(function*() {
    let hash = location.hash || '';
    let params = new URLSearchParams(hash.substr(1));

    yield Promise.all([this.loadDeviceFilter(params.get('lst')), this.loadTask(params.get('tsk'))]);
  }),

  async loadDeviceFilter(url) {
    if (url) {
      await this.filter.load(url);
    }
  },

  async loadTask(url) {
    if (url) {
      let { readTaskFromString } = await import('aeroscore/dist/src/read-task');
      this.set('task', readTaskFromString(await fetchText(url)));
    }
  },
});
