import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default class extends Controller {
  @service filter;
  @service scoring;

  @alias('filter.hasFilter') hasDeviceFilter;
}
