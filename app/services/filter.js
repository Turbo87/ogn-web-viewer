import Service from '@ember/service';
import { notEmpty } from '@ember/object/computed';

export default class extends Service {
  filter = [];

  @notEmpty('filter') hasFilter;

  add(...records) {
    this.set('filter', [...this.filter, ...records]);
  }
}
