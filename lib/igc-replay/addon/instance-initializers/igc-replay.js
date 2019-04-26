import Ember from 'ember';

export function initialize(appInstance) {
  if (!Ember.testing) {
    appInstance.lookup('service:igc-replay').start();
  }
}

export default { initialize };
