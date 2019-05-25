import * as Sentry from '@sentry/browser';
import { Ember } from '@sentry/integrations/esm/ember';

import config from './config/environment';

export function startSentry() {
  Sentry.init({
    ...config.sentry,
    integrations: [new Ember()],

    beforeSend(event, hint) {
      let error = hint.originalException;

      if (error) {
        // ignore aborted route transitions from the Ember.js router
        if (error.name === 'TransitionAborted') {
          return null;
        }

        // ignore aborted requests from ember-fetch
        if (error.name === 'AbortError') {
          return null;
        }
      }

      return event;
    },
  });
}
