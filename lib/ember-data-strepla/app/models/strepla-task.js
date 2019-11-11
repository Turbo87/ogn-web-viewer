import { equal } from '@ember/object/computed';
import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default class extends Model {
  @attr() name;
  @attr() distance;
  @attr() ruleName;
  @attr('strepla-duration') minTime;
  @attr() turnpoints;

  get isRacing() {
    return this.ruleName === 'Racing-Task (RT)' || this.ruleName === 'Racing-Task (RT) Regatta Start';
  }

  @equal('ruleName', 'Speed Assigned Area Task (AAT)') isAAT;

  @belongsTo('strepla-competition', { inverse: null }) competition;
  @belongsTo('strepla-competition-day', { inverse: null }) competitionDay;
}
