import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupQunit as setupPolly } from '@pollyjs/core';

module('Service | ddb', function(hooks) {
  setupTest(hooks);
  setupPolly(hooks, { recordIfMissing: false });

  test('update() downloads the device database', async function(assert) {
    const { server } = this.polly;

    let ddb = this.owner.lookup('service:ddb');

    server.get('/api/ddb').intercept((req, res) =>
      res.status(200).send({
        FLRDDACF7: { model: 'Cirrus Std', registration: 'SE-UXA', callsign: 'A1', category: 1 },
        ICA4B43F4: { model: 'Robinson R44', registration: 'HB-ZTC', callsign: 'CHC', category: 4 },
      }),
    );

    await ddb.update();

    assert.equal(ddb.devices['FLRDDACF7'].model, 'Cirrus Std');
    assert.equal(ddb.devices['ICA4B43F4'].registration, 'HB-ZTC');
  });
});
