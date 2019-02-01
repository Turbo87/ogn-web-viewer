import Route from '@ember/routing/route';

export default Route.extend({
  setupController(controller) {
    this._super(...arguments);

    // remove loading spinner from the page (see `index.html`)
    let spinnner = document.querySelector('#initial-load-spinner');
    spinnner.classList.add('fade');
    setTimeout(() => spinnner.remove(), 1500);

    controller.loadDataTask.perform();
  },
});
