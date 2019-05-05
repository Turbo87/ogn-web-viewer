import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default class extends Model {
  @attr() className;
  @attr('strepla-date') date;
  @attr('number') state;
  @attr() stateDescription;

  @belongsTo('strepla-competition', { inverse: null }) competition;
  @belongsTo('strepla-competition-class', { inverse: null }) class;
}
