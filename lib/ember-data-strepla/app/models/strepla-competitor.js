import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default class extends Model {
  @attr() name;
  @attr() country;

  @attr() type;
  @attr() registration;
  @attr() callsign;
  @attr('number') handicap;

  @attr() flarmID;
  @attr() logger1;
  @attr() logger2;
  @attr() logger3;

  @attr() className;

  @belongsTo('strepla-competition', { inverse: null }) competition;
}
