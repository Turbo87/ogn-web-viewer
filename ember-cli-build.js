'use strict';

const Rollup = require('broccoli-rollup');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const getRepoInfo = require('git-repo-info');
const commonjs = require('rollup-plugin-commonjs');
const builtins = require('rollup-plugin-node-builtins');
const globals = require('rollup-plugin-node-globals');
const resolve = require('rollup-plugin-node-resolve');

module.exports = function(defaults) {
  let env = EmberApp.env();
  let isProductionEnv = env === 'production';

  let repoInfo = getRepoInfo();

  let pluginsToBlacklist = [];
  if (isProductionEnv) {
    pluginsToBlacklist.push('ember-freestyle');
    pluginsToBlacklist.push('freestyle');
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

    svgJar: {
      sourceDirs: ['public/svg'],
    },

    freestyle: {
      snippetSearchPaths: ['lib/freestyle/app'],
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

  let babelAddon = app.project.addons.find(addon => addon.name === 'ember-cli-babel');

  let workerTree = new Rollup('lib/aeroscore-worker', {
    rollup: {
      input: 'main.js',
      output: {
        file: 'assets/aeroscore-worker.js',
        format: 'iife',
        sourcemap: true,
      },
      plugins: [
        globals(),

        // rollup and webpack interpret ES6 imports from CommonJS modules differently
        // this special case for `@turf/sector` is currently needed to make rollup
        // not crash when trying to use the function from this module.
        resolve({
          mainFields: ['main'],
          only: ['@turf/sector'],
          preferBuiltins: true,
        }),

        resolve({
          mainFields: ['browser', 'module', 'main'],
          preferBuiltins: true,
        }),
        commonjs(),
        builtins(),
      ],
    },
  });

  workerTree = babelAddon.transpileTree(workerTree, {
    'ember-cli-babel': {
      compileModules: false,
    },
  });

  return app.toTree([workerTree]);
};
