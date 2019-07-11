import EmberRouter from '@ember/routing/router';

import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

// eslint-disable-next-line array-callback-return
Router.map(function() {
  this.route('strepla', function() {
    this.route('competition', { path: '/:id' }, function() {
      this.route('class', { path: '/:class_name' }, function() {
        this.route('date', { path: '/:date' }, function() {});
      });
    });
  });

  this.route('404', { path: '/*path' });

  if (config.environment !== 'production') {
    this.route('freestyle');
  }
});

export default Router;
