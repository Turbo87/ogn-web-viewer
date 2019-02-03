'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'ogn-web-viewer',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false,
      },
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    API_HOST: process.env.API_HOST || 'https://ogn.cloud',
    WS_HOST: (process.env.API_HOST && process.env.API_HOST.replace(/^http/, 'ws')) || 'wss://ogn.cloud',

    sentry: {
      development: true,
      dsn: 'https://fb74a283ef1f4414a61cd89e5eabcd10@sentry.io/1243387',
    },
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    ENV.API_HOST = '';

    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    ENV.sentry.development = false;
  }

  return ENV;
};
