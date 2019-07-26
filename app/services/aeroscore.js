import Service from '@ember/service';

import PromiseWorker from 'promise-worker';

export default class extends Service {
  init() {
    super.init(...arguments);

    this.worker = new PromiseWorker(new Worker('/assets/aeroscore-worker.js'));
  }

  async setTask(task) {
    return await this.worker.postMessage({ type: 'setTask', data: task });
  }

  async setPilots(pilots) {
    return await this.worker.postMessage({ type: 'setPilots', data: pilots });
  }

  async addFixes(fixesPerPilot) {
    return await this.worker.postMessage({ type: 'addFixes', data: fixesPerPilot });
  }

  async getResults() {
    return await this.worker.postMessage({ type: 'getResults' });
  }
}
