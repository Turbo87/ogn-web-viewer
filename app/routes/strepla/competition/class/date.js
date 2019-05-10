import Route from '@ember/routing/route';

import { toDateString } from 'ogn-web-viewer/utils/date';

export default class extends Route {
  async model({ date }) {
    let competition = this.modelFor('strepla.competition');
    let classRecord = this.modelFor('strepla.competition.class');

    let days = await this.store.query('strepla-competition-day', { competitionId: competition.id });
    let day = days.find(it => it.belongsTo('class').id() === classRecord.id && toDateString(it.date) === date);
    if (!day) {
      throw new Error(`No competition day matching "${date}" found for the "${classRecord.name}" competition class`);
    }

    return day;
  }

  serialize(model) {
    return { date: toDateString(model.date) };
  }
}
