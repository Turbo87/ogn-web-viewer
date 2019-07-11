import Route from '@ember/routing/route';

export default class extends Route {
  async model({ id }) {
    return await this.store.findRecord('strepla-competition', id);
  }
}
