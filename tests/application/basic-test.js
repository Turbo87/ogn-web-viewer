import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { setupMockServer } from 'igc-replay/test-support';

module('Application', function(hooks) {
  setupApplicationTest(hooks);
  setupMockServer(hooks);

  test('visiting / shows the map', async function(assert) {
    await visit('/');

    assert.dom('[data-test-map]').exists();
    assert.dom('[data-test-scores]').doesNotExist();
  });
});
