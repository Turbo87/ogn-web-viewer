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
