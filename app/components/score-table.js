import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Ember from 'ember';

import { formatDuration, formatTime } from 'aeroscore/dist/src/format-result';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';

export default class extends Component {
  @service aeroscore;
  @service filter;
  @service history;

  tagName = '';

  dayFactors = null;
  results = [];
  rows = [];

  @computed('filter.filter')
  get initialDayFactors() {
    return {
      // Task Distance [km]
      // Dt: task.distance / 1000,

      // Minimum Task Time [s]
      // Td: task.options.aatMinTime || 0,

      // Lowest Handicap (H) of all competitors
      Ho: Math.min(...this.filter.filter.map(it => it.handicap)),

      // Minimum Handicapped Distance to validate the Day [km]
      Dm: 100,
    };
  }

  didInsertElement() {
    super.didInsertElement(...arguments);
    this.updateTask.perform();
  }

  willDestroyElement() {
    super.willDestroyElement(...arguments);
    this.updateTask.cancelAll();
  }

  @task
  updateTask = function*() {
    while (!Ember.testing) {
      this.set('results', yield this.aeroscore.getResults());
      this.update();

      yield timeout(300);
    }
  };

  update() {
    this.set(
      'rows',
      this.results.map((result, i) => {
        let { filterRow } = result;

        return {
          id: filterRow.id,
          num: `${result.landed || result._completed ? ' ' : '!'} ${i + 1}`,
          cn: filterRow.callsign,
          name: filterRow.name,
          type: filterRow.type,
          startTime: result.startTimestamp ? formatTime(result.startTimestamp) : '',
          time: result._T ? formatDuration(result._T) : '',
          distance: result._D ? `${result._D.toFixed(1)} km` : '',
          speed: result._V ? `${result._V.toFixed(2)} km/h` : '',
          score: result.S,
          altitude: result.altitude !== null ? `${Math.round(result.altitude)} m` : '',
        };
      }),
    );
  }
}
