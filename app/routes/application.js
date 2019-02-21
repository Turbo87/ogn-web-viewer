import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  ddb: service(),
  filter: service(),
  history: service(),
  ws: service(),

  afterModel() {
    this._super(...arguments);

    // remove loading spinner from the page (see `index.html`)
    let spinnner = document.querySelector('#initial-load-spinner');
    spinnner.classList.add('fade');
    setTimeout(() => spinnner.remove(), 1500);

    this.ddb.update();

    this.ws.start();
  },
});
