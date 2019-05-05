import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default class extends Model {
  @attr() name;
  @attr() ruleName;

  @belongsTo('strepla-competition', { inverse: null }) competition;
}
