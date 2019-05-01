import Route from '@ember/routing/route';

export default class extends Route {
  setupController(controller) {
    super.setupController(...arguments);
    controller.loadDataTask.perform();
  }
}
