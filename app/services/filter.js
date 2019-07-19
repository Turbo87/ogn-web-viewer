import { notEmpty } from '@ember/object/computed';
import Service from '@ember/service';

export default class extends Service {
  filter = [];

  @notEmpty('filter') hasFilter;

  setFilter(records) {
    this.set('filter', records);
  }
}
