import Route from '@ember/routing/route';

export default Route.extend({
  afterModel() {
    let hash = location.hash || '';
    let params = new URLSearchParams(hash.substr(1));

    let filterURL = params.get('lst');
    let taskURL = params.get('tsk');

    if (filterURL || taskURL) {
      console.log({filterURL, taskURL});
      this.transitionTo({
        queryParams: { filterURL, taskURL },
      });
    }
  },

  setupController(controller) {
    this._super(...arguments);
    controller.loadDataTask.perform();
  },
});
