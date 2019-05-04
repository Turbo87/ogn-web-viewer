import { setupQunit as setupPolly } from '@pollyjs/core';

export function setupDDBMock(hooks, response = {}) {
  setupPolly(hooks, { recordIfMissing: false });

  hooks.beforeEach(function() {
    this.polly.server.get('/api/ddb').intercept((req, res) => res.status(200).send(response));
  });
}
