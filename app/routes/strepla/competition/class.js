import Route from '@ember/routing/route';

export default class extends Route {
  async model({ class_name: className }) {
    let competition = this.modelFor('strepla.competition');

    let classes = await this.store.query('strepla-competition-class', { competitionId: competition.id });
    let classRecord = classes.find(it => it.name === className);
    if (!classRecord) {
      throw new Error(`Competition class ${className} could not be found`);
    }

    return classRecord;
  }
}
