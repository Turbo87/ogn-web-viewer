<template>
  <table class="score-table">
    <tr>
      <th></th>
      <th></th>
      <th style="text-align: left">Name</th>
      <th style="text-align: right">Altitude</th>
      <th style="text-align: left">Aircraft</th>
      <th style="text-align: right">Start</th>
      <th style="text-align: right">Time</th>
      <th style="text-align: right">Distance</th>
      <th style="text-align: right">Speed</th>
      <th style="text-align: right">Score</th>
    </tr>
    <tr v-for="row in rows" :key="row[1]">
      <td>{{row[0]}}</td>
      <td>{{row[1]}}</td>
      <td>{{row[2]}}</td>
      <td style="text-align: right">{{row[9]}}</td>
      <td>{{row[3]}}</td>
      <td style="text-align: right">{{row[4]}}</td>
      <td style="text-align: right">{{row[5]}}</td>
      <td style="text-align: right">{{row[6]}}</td>
      <td style="text-align: right">{{row[7]}}</td>
      <td style="text-align: right">{{row[8]}}</td>
    </tr>
  </table>
</template>

<style>
.score-table {
  width: 100%;

  border-collapse: collapse;

  font-size: 14px;
  font-family: sans-serif;
}

.score-table tr:nth-child(even) {
  background: #f3f3f3;
}

.score-table tr:hover {
  background: #e3e3e3;
}

.score-table td,
.score-table th {
  padding: 4px;
}
</style>

<script>
import VueTimers from 'vue-timers/mixin';

import {
  calculateDayFactors,
  calculateDayResult,
  compareDayResults,
  createInitialDayResult,
  createIntermediateDayResult,
} from 'aeroscore/dist/src/scoring';
import AreaTaskSolver from 'aeroscore/dist/src/task/solver/area-task-solver';
import RacingTaskSolver from 'aeroscore/dist/src/task/solver/racing-task-solver';
import { formatDuration, formatTime } from 'aeroscore/dist/src/format-result';
import deviceFilter from '../services/filter';

import history from '../services/history';

export default {
  mixins: [VueTimers],

  name: 'ScoreTable',

  props: {
    task: Object,
  },

  timers: {
    update: { time: 3000, autostart: true, immediate: true, repeat: true },
  },

  data() {
    return { dayFactors: null, results: [], rows: [] };
  },

  computed: {
    initialDayFactors() {
      return {
        // Task Distance [km]
        // Dt: task.distance / 1000,

        // Minimum Task Time [s]
        // Td: task.options.aatMinTime || 0,

        // Lowest Handicap (H) of all competitors
        Ho: Math.min(...deviceFilter.filter.map(it => it.HANDICAP)),

        // Minimum Handicapped Distance to validate the Day [km]
        Dm: 100,
      };
    },
  },

  methods: {
    update() {
      let results = deviceFilter.filter.map(filterRow => {
        let fixes = history.forId(filterRow.ID);

        let solver = this.task.options.isAAT ? new AreaTaskSolver(this.task) : new RacingTaskSolver(this.task);

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
          let H = filterRow.HANDICAP / 100;

          dayResult =
            landed || result.completed || this.task.options.isAAT
              ? createInitialDayResult(result, this.initialDayFactors, H)
              : createIntermediateDayResult(result, this.initialDayFactors, H, this.task, Date.now() / 1000);
        } catch (error) {
          console.error(error);

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

        return [
          `${result.landed || result._completed ? ' ' : '!'} ${i + 1}`,
          filterRow.CN,
          filterRow.NAME,
          filterRow.TYPE,
          result.startTimestamp ? formatTime(result.startTimestamp) : '',
          result._T ? formatDuration(result._T) : '',
          result._D ? `${result._D.toFixed(1)} km` : '',
          result._V ? `${result._V.toFixed(2)} km/h` : '',
          result.S,
          result.altitude !== null ? `${Math.round(result.altitude)} m` : '',
        ];
      });
    },
  },
};
</script>
