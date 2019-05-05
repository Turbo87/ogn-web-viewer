import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default class extends Model {
  @attr() name;
  @attr() distance;
  @attr() ruleName;
  @attr('strepla-duration') minTime;
  @attr() turnpoints;

  @belongsTo('strepla-competition', { inverse: null }) competition;
  @belongsTo('strepla-competition-day', { inverse: null }) competitionDay;
}
