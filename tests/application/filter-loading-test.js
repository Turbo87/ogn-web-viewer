import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { setupQunit as setupPolly } from '@pollyjs/core';
import window, { setupWindowMock } from 'ember-window-mock';

const URL = 'https://gist.githubusercontent.com/Turbo87/1234567890/raw/club-filter.csv';

module('Application | filter-loading', function(hooks) {
  setupApplicationTest(hooks);
  setupPolly(hooks, { recordIfMissing: false });
  setupWindowMock(hooks);

  test('visiting / loads the filter file when available', async function(assert) {
    const { server } = this.polly;

    server.get('https://maps.tilehosting.com/*').passthrough();
    server.get('/api/ddb').intercept((req, res) => res.status(200).send({}));
    server.get('/api/records/:ids').intercept((req, res) => res.status(200).send({}));

    server.get(URL).intercept((req, res) => {
      let file = [
        'ID,CALL,CN,TYPE,HANDICAP,NAME',
        'FLRDDA7EA,D-0681,Z,LS 1d,0.984,John Doe',
        'XXXXXXXXX,D-6713,EL,ASW 19; B,1.004,Foo Bar',
        'FLRDD897F,D-9106,C1,LS 4,1.025,Jane Doe',
      ].join('\n');

      return res.status(200).send(file);
    });

    window.location.hash = `#lst=${URL}`;
    await visit('/');

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
});
