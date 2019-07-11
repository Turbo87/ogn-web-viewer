import Route from '@ember/routing/route';

import { toDateString } from 'ogn-web-viewer/utils/date';

export default class extends Route {
  async beforeModel() {
    let competition = this.modelFor('strepla.competition');
    let classRecord = this.modelFor('strepla.competition.class');

    let days = await this.store.query('strepla-competition-day', { competitionId: competition.id });
    let classDays = days.filter(it => it.belongsTo('class').id() === classRecord.id);
    if (classDays.length === 0) {
      throw new Error(`No competition days found for the "${classRecord.name}" competition class`);
    }

    let now = new Date();
    let selectedDay;
    if (now < classDays[0].date) {
      // the competition has not started yet
      selectedDay = classDays[0];
    } else if (now > classDays[classDays.length - 1].date) {
      // the competition has ended or it is the last day
      selectedDay = classDays[classDays.length - 1];
    } else {
      // the competition is ongoing
      selectedDay = toDateString(now);
    }

    this.replaceWith('strepla.competition.class.date', competition.id, classRecord.name, selectedDay);
  }
}
