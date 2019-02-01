import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  ddb: service(),

  afterModel() {
    this._super(...arguments);
    this.ddb.update();
  },
});
