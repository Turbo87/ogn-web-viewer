import lolex from 'lolex';

export default function setupLolex(hooks, config = {}) {
  hooks.beforeEach(function() {
    this.clock = lolex.install(config);
  });

  hooks.afterEach(function() {
    this.clock.uninstall();
  });
}
