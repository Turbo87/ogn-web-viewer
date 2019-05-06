import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { setupQunit as setupPolly } from '@pollyjs/core';

import setupLolex from 'ogn-web-viewer/tests/test-helpers/lolex';

module('Service | history', function(hooks) {
  setupTest(hooks);
  setupPolly(hooks, { recordIfMissing: false });
  setupLolex(hooks, { now: Date.parse('2018-12-24T12:34:56Z') });

  test('loadForIds() loads records from the history API', async function(assert) {
    assert.expect(4);

    const { server } = this.polly;

    let history = this.owner.lookup('service:history');

    server.get('/api/records/FLRDDACF7,ICA4B43F4').intercept((req, res) => {
      assert.strictEqual(req.query.after, '1545626096');

      return res.status(200).send({
        FLRDDACF7: [
          '1548506536|7.134900|50.557434|211',
          '1548506537|7.134900|50.557434|213',
          '1548506557|7.134917|50.557434|213',
          '1548506576|7.134900|50.557468|220',
        ],
        ICA4B43F4: [],
      });
    });

    await history.loadForIds('FLRDDACF7', 'ICA4B43F4');

    assert.equal(history.forId('FLRDDACF7')[1].time, 1548506537000);
    assert.equal(history.forId('FLRDDACF7')[2].altitude, 213);
    assert.equal(history.forId('ICA4B43F4').length, 0);
  });
});
