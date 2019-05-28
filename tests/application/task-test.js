import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { setupMockServer } from 'igc-replay/test-support';

const URL = 'https://euregiocup.aero/igel.tsk';

module('Application | task', function(hooks) {
  setupApplicationTest(hooks);
  setupMockServer(hooks);

  hooks.beforeEach(function() {
    Object.defineProperty(this, 'map', {
      get() {
        return this.owner.lookup('service:map').map;
      },
    });
  });

  test('using the `tsk` query param loads the task from the specified URL', async function(assert) {
    const { server } = this.server.polly;

    // redirect task URL request to the igc-replay task URL
    server
      .get(URL)
      .on('request', request => (request.url = '/igc-replay/Bayreuth-2018-05-27/task.tsk'))
      .passthrough();

    await visit(`/?tsk=${URL}`);

    let layers = this.map.getLayers();
    let taskLayer = layers.getArray().find(it => it.get('id') === 'task');
    let taskSource = taskLayer.getSource();
    let taskFeatures = taskSource.getFeatures();

    // legs line string + one feature per turnpoint
    assert.equal(taskFeatures.length, 5);
  });

  test('404 shows an error dialog', async function(assert) {
    const { server } = this.server.polly;
    server.get(URL).intercept((req, res) => res.status(404).send());

    await visit(`/?tsk=${URL}`);

    assert.dom('[data-test-error-dialog]').exists();
    assert.dom('[data-test-error]').includesText('404 Not Found');

    await click('[data-test-close]');
    assert.dom('[data-test-error-dialog]').doesNotExist();
  });

  test('invalid task shows an error dialog', async function(assert) {
    const { server } = this.server.polly;
    server.get(URL).intercept((req, res) => res.status(200).send('Internal Server Error'));

    await visit(`/?tsk=${URL}`);

    assert.dom('[data-test-error-dialog]').exists();
    assert.dom('[data-test-error]').includesText('Text data outside of root node');

    await click('[data-test-close]');
    assert.dom('[data-test-error-dialog]').doesNotExist();
  });
});
