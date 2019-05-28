import Route from '@ember/routing/route';

export default class extends Route {
  setupController(controller, error) {
    controller.setError(error);
  }
}
