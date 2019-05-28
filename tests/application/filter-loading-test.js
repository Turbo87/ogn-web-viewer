import { visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { setupMockServer } from 'igc-replay/test-support';

const URL = 'https://gist.githubusercontent.com/Turbo87/1234567890/raw/club-filter.csv';

module('Application | filter-loading', function(hooks) {
  setupApplicationTest(hooks);
  setupMockServer(hooks);

  test('visiting / loads the filter file when available', async function(assert) {
    const { server } = this.server.polly;

    server.get(URL).intercept((req, res) => {
      let file = [
        'ID,CALL,CN,TYPE,HANDICAP,NAME',
        'FLRDDA7EA,D-0681,Z,LS 1d,0.984,John Doe',
        'XXXXXXXXX,D-6713,EL,ASW 19; B,1.004,Foo Bar',
        'FLRDD897F,D-9106,C1,LS 4,1.025,Jane Doe',
      ].join('\n');

      return res.status(200).send(file);
    });

    await visit(`/?lst=${URL}`);

    let filter = this.owner.lookup('service:filter');

    assert.equal(filter.filter.length, 3);
    assert.deepEqual(filter.filter[2], {
      id: 'FLRDD897F',
      registration: 'D-9106',
      callsign: 'C1',
      type: 'LS 4',
      handicap: 1.025,
      name: 'Jane Doe',
    });
  });

  test('404 shows an error dialog', async function(assert) {
    const { server } = this.server.polly;
    server.get(URL).intercept((req, res) => res.status(404).send());

    await visit(`/?lst=${URL}`);

    assert.dom('[data-test-error-dialog]').exists();
    assert.dom('[data-test-error]').includesText('404 Not Found');

    await click('[data-test-close]');
    assert.dom('[data-test-error-dialog]').doesNotExist();
  });
});
