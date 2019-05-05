import { equal } from '@ember/object/computed';
import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default class extends Model {
  @attr() name;
  @attr() distance;
  @attr() ruleName;
  @attr('strepla-duration') minTime;
  @attr() turnpoints;

  @equal('ruleName', 'Racing-Task (RT)') isRacing;
  @equal('ruleName', 'Speed Assigned Area Task (AAT)') isAAT;

  @belongsTo('strepla-competition', { inverse: null }) competition;
  @belongsTo('strepla-competition-day', { inverse: null }) competitionDay;
}
