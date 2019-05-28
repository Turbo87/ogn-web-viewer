import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { setupMockServer } from 'igc-replay/test-support';

module('Application | 404', function(hooks) {
  setupApplicationTest(hooks);
  setupMockServer(hooks);

  test('visiting /does-not-exist shows the 404 page', async function(assert) {
    await visit('/does-not-exist');

    assert.dom('[data-test-404]').exists();
  });
});
