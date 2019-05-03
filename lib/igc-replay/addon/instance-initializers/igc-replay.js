import window from 'ember-window-mock';

export function initialize(appInstance) {
  let params = new URLSearchParams(window.location.search);
  if (params.has('replay')) {
    appInstance.lookup('service:igc-replay').start();
  }
}

export default { initialize };
