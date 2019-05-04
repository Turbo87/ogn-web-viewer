import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { setupReplay } from 'igc-replay/test-support';

module('Application', function(hooks) {
  setupApplicationTest(hooks);
  setupReplay(hooks);

  test('visiting / shows the map', async function(assert) {
    await visit('/');

    assert.dom('#map').exists();
    assert.dom('.scores-wrapper').doesNotExist();
  });
});
