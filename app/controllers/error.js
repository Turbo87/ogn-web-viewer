import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

import * as Sentry from '@sentry/browser';

export default class extends Controller {
  @service intl;

  @computed('error')
  get fetchResponse() {
    if (this.error.response) {
      return this.error.response;
    }

    if ('statusText' in this.error) {
      return this.error;
    }

    return null;
  }

  setError(error) {
    this.showDialog = true;
    this.error = error;

    if (!this.isFetchError) {
      Sentry.captureException(error);
    }
  }
}
