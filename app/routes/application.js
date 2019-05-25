import { getOwner } from '@ember/application';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class extends Route {
  @service ddb;
  @service filter;
  @service history;
  @service intl;
  @service ws;

  async beforeModel(transition) {
    if (transition.to.queryParams.replay) {
      let replay = getOwner(this).lookup('service:igc-replay');
      await replay.start();
    }

    let locale = this.intl.negotiateLocale();
    await this.intl.loadTranslations(locale);
    this.intl.setLocale(locale);
  }

  afterModel() {
    super.afterModel(...arguments);

    // remove loading spinner from the page (see `index.html`)
    let spinnner = document.querySelector('#initial-load-spinner');
    if (spinnner) {
      spinnner.classList.add('fade');
      setTimeout(() => spinnner.remove(), 1500);
    }

    this.ddb.update();

    this.ws.start();
  }
}
