import { createTask } from 'aeroscore/dist/src/create-task';
import {
  calculateDayFactors,
  calculateDayResult,
  compareDayResults,
  createInitialDayResult,
  createIntermediateDayResult,
} from 'aeroscore/dist/src/scoring';
import AreaTaskSolver from 'aeroscore/dist/src/task/solver/area-task-solver';
import RacingTaskSolver from 'aeroscore/dist/src/task/solver/racing-task-solver';

export default class AeroscoreWorker {
  constructor() {
    this.task = null;
    this.setPilots([]);
  }

  setTask(task) {
    console.log('setTask', task);
    this.task = createTask(task);
  }

  setPilots(pilots) {
    console.log('setPilots', pilots.length);
    this.pilots = pilots;

    this.solvers = Object.create(null);
    this.fixesPerPilot = Object.create(null);
  }

  addFixes(fixesPerPilot) {
    for (let pilotId of Object.keys(fixesPerPilot)) {
      let newFixes = fixesPerPilot[pilotId].sort((a, b) => a.time - b.time);
      this._addFixesForPilot(pilotId, newFixes);
    }
  }

  _addFixesForPilot(pilotId, newFixes) {
    let oldFixes = this.fixesPerPilot[pilotId];
    if (!oldFixes || oldFixes.length === 0) {
      this.fixesPerPilot[pilotId] = newFixes;

      let solver = this._newSolver();
      solver.consume(newFixes);
      this.solvers[pilotId] = solver;
      return;
    }

    let lastFix = oldFixes[oldFixes.length - 1];
    if (newFixes.every(it => it.time >= lastFix.time)) {
      oldFixes.push(...newFixes);

      let solver = this.solvers[pilotId];
      solver.consume(newFixes);

      return;
    }

    oldFixes.push(...newFixes);
    oldFixes.sort();

    let solver = this._newSolver();
    solver.consume(oldFixes);
    this.solvers[pilotId] = solver;
  }

  getResults() {
    if (!this.task) return [];

    let initialResults = this.pilots.map(filterRow => {
      let fixes = this.fixesPerPilot[filterRow.id] || [];
      let solver = this.solvers[filterRow.id] || this._newSolver();

      let dayResult, landed, startTimestamp, altitude;
      try {
        let lastFix = fixes[fixes.length - 1];
        altitude = lastFix ? lastFix.altitude : null;

        let result = solver.result;

        landed = false; // TODO

        let start = result.path[0];
        startTimestamp = start && result.distance ? start.time : null;

        // Competitor’s Handicap, if handicapping is being used; otherwise H=1
        let H = filterRow.handicap / 100;

        dayResult =
          landed || result.completed || this.task.options.isAAT
            ? createInitialDayResult(result, this.initialDayFactors, H)
            : createIntermediateDayResult(result, this.initialDayFactors, H, this.task, Date.now() / 1000);
      } catch (error) {
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

    let dayFactors = calculateDayFactors(initialResults, this.initialDayFactors);

    let results = initialResults.map(result => calculateDayResult(result, dayFactors)).sort(compareDayResults);

    // console.log(results);

    return results;
  }

  _newSolver() {
    console.log('new solver');
    return this.task.options.isAAT ? new AreaTaskSolver(this.task) : new RacingTaskSolver(this.task);
  }

  get initialDayFactors() {
    return {
      // Task Distance [km]
      // Dt: task.distance / 1000,

      // Minimum Task Time [s]
      // Td: task.options.aatMinTime || 0,

      // Lowest Handicap (H) of all competitors
      Ho: Math.min(...this.pilots.map(it => it.handicap)),

      // Minimum Handicapped Distance to validate the Day [km]
      Dm: 100,
    };
  }
}
