import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Ember from 'ember';

import * as Sentry from '@sentry/browser';
import { formatDuration, formatTime } from 'aeroscore/dist/src/format-result';
import {
  calculateDayFactors,
  calculateDayResult,
  compareDayResults,
  createInitialDayResult,
  createIntermediateDayResult,
} from 'aeroscore/dist/src/scoring';
import AreaTaskSolver from 'aeroscore/dist/src/task/solver/area-task-solver';
import RacingTaskSolver from 'aeroscore/dist/src/task/solver/racing-task-solver';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';

export default class extends Component {
  @service filter;
  @service history;

  dayFactors = null;
  results = [];
  @tracked rows = [];

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

  @task
  updateTask = function*() {
    while (!Ember.testing) {
      this.update();
      yield timeout(3000);
    }
  };

  update() {
    let results = this.filter.filter.map(filterRow => {
      let fixes = this.history.forId(filterRow.id);

      let solver = this.args.task.options.isAAT
        ? new AreaTaskSolver(this.args.task)
        : new RacingTaskSolver(this.args.task);

      let dayResult, landed, startTimestamp, altitude;
      try {
        solver.consume(fixes);

        let lastFix = fixes[fixes.length - 1];
        altitude = lastFix ? lastFix.altitude : null;

        let result = solver.result;

        landed = false; // TODO

        let start = result.path[0];
        startTimestamp = start && result.distance ? start.time : null;

        // Competitor’s Handicap, if handicapping is being used; otherwise H=1
        let H = filterRow.handicap / 100;

        dayResult =
          landed || result.completed || this.args.task.options.isAAT
            ? createInitialDayResult(result, this.initialDayFactors, H)
            : createIntermediateDayResult(result, this.initialDayFactors, H, this.args.task, Date.now() / 1000);
      } catch (error) {
        Sentry.captureException(error);

        altitude = null;
        landed = false;
        startTimestamp = null;
        dayResult = {
          completed: false,
          distance: 0,
          time: 0,
        };
      }

      return { ...dayResult, landed, filterRow, startTimestamp, altitude };
    });

    this.dayFactors = calculateDayFactors(results, this.initialDayFactors);

    this.results = results.map(result => calculateDayResult(result, this.dayFactors)).sort(compareDayResults);

    this.rows = this.results.map((result, i) => {
      let { filterRow } = result;

      return {
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
    });
  }
}
