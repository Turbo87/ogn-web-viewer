import DS from 'ember-data';

const { Model, attr } = DS;

export default class extends Model {
  @attr() name;
  @attr() ruleName;
}
