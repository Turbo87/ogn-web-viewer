import { notEmpty } from '@ember/object/computed';
import Service from '@ember/service';

export default class extends Service {
  filter = [];

  @notEmpty('filter') hasFilter;

  add(...records) {
    this.set('filter', [...this.filter, ...records]);
  }
}
