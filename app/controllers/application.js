import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default class extends Controller {
  @service filter;
  @service scoring;

  @alias('filter.hasFilter') hasDeviceFilter;
}
