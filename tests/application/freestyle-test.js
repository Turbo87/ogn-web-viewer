import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { setupDDBMock } from 'ogn-web-viewer/tests/test-helpers/ddb';
import { percySnapshot } from 'ogn-web-viewer/tests/test-helpers/percy';

module('Component Playground', function(hooks) {
  setupApplicationTest(hooks);
  setupDDBMock(hooks);

  test('visiting /freestyle shows the component playground', async function(assert) {
    // we just want to make sure that no exceptions are thrown and run
    // a visual regression test on the components
    assert.expect(0);

    await visit('/freestyle?m=false');
    await percySnapshot();
  });
});
