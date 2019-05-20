export function setupMockServer(hooks, options = {}) {
  hooks.beforeEach(function() {
    this.server = this.owner.lookup('service:mock-server');
    this.server.start(options);
  });

  hooks.afterEach(function() {
    if (this.server) {
      this.server.stop();
    }
  });
}

export function setupReplay(hooks, options = {}) {
  hooks.beforeEach(function() {
    this.replay = this.owner.lookup('service:igc-replay');
    this.replay.start(options);
  });

  hooks.afterEach(function() {
    if (this.replay) {
      this.replay.stop();
    }
  });
}
