import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupQunit as setupPolly } from '@pollyjs/core';

const URL = 'https://gist.githubusercontent.com/Turbo87/1234567890/raw/club-filter.csv';

module('Service | filter', function(hooks) {
  setupTest(hooks);
  setupPolly(hooks, { recordIfMissing: false });

  test('load() downloads filter file', async function(assert) {
    const { server } = this.polly;

    let filter = this.owner.lookup('service:filter');

    server.get(URL).intercept((req, res) => {
      let file = [
        'ID,CALL,CN,TYPE,HANDICAP,NAME',
        'FLRDDA7EA,D-0681,Z,LS 1d,0.984,John Doe',
        'XXXXXXXXX,D-6713,EL,ASW 19; B,1.004,Foo Bar',
        'FLRDD897F,D-9106,C1,LS 4,1.025,Jane Doe',
      ].join('\n');

      return res.status(200).send(file);
    });

    await filter.load(URL);

    assert.equal(filter.filter.length, 3);
    assert.deepEqual(filter.filter[2], {
      ID: 'FLRDD897F',
      CALL: 'D-9106',
      CN: 'C1',
      TYPE: 'LS 4',
      HANDICAP: 1.025,
      NAME: 'Jane Doe',
    });
  });
});
