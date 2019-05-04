import Route from '@ember/routing/route';

export default class extends Route {
  activate() {
    super.activate(...arguments);
    this.controllerFor('application').set('onFreestyleRoute', true);
  }

  deactivate() {
    super.deactivate(...arguments);
    this.controllerFor('application').set('onFreestyleRoute', false);
  }
}
