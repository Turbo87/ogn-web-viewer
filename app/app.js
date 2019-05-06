import Application from '@ember/application';

import loadInitializers from 'ember-load-initializers';

import { hashToQueryParams } from 'ogn-web-viewer/utils/hash-to-qp';

import config from './config/environment';
import Resolver from './resolver';

hashToQueryParams();

const App = Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,
});

loadInitializers(App, config.modulePrefix);

export default App;
