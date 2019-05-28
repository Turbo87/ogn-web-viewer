import Route from '@ember/routing/route';

export default class extends Route {
  activate() {
    super.activate(...arguments);
    this.controllerFor('application').set('onlyOutlet', true);
  }

  deactivate() {
    super.deactivate(...arguments);
    this.controllerFor('application').set('onlyOutlet', false);
  }
}
