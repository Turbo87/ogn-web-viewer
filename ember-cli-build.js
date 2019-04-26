'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const getRepoInfo = require('git-repo-info');

module.exports = function(defaults) {
  let env = EmberApp.env();
  let isProductionEnv = env === 'production';

  let repoInfo = getRepoInfo();

  let pluginsToBlacklist = [];
  if (!process.env.REPLAY) {
    pluginsToBlacklist.push('igc-replay');
  }

  let app = new EmberApp(defaults, {
    addons: {
      blacklist: pluginsToBlacklist,
    },
    babel: {
      plugins: [require('ember-auto-import/babel-plugin')],
    },
    autoImport: {
      webpack: {
        node: {
          fs: 'empty',
        },
      },
    },
    sourcemaps: {
      enabled: true,
      extensions: ['css', 'js'],
    },
    fingerprint: {
      // see https://github.com/davewasmer/ember-cli-favicon/issues/78
      exclude: ['android-chrome', 'coast', 'firefox_app', 'yandex-browser'],
    },
    'ember-cli-favicon': {
      enabled: env !== 'test',
      faviconsConfig: {
        appName: 'OGN WebViewer',
        appShortName: 'OGN',
        appDescription: 'WebViewer for the OpenGliderNet live tracking service',
        developerName: 'Tobias Bieniek',
        developerURL: 'https://github.com/Turbo87/',
        version: repoInfo.abbreviatedSha,
        background: '#fff',
        theme_color: '#d3382f',
        icons: {
          favicons: true,
          android: true,
          appleIcon: isProductionEnv,
          appleStartup: false,
          coast: isProductionEnv,
          firefox: isProductionEnv,
          windows: isProductionEnv,
          yandex: isProductionEnv,
        },
      },
    },
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  app.import('node_modules/ol/ol.css');

  return app.toTree();
};
