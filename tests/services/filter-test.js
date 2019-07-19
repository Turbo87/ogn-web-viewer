import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Service | filter', function(hooks) {
  setupTest(hooks);

  test('add() adds new records to the filter', async function(assert) {
    let filter = this.owner.lookup('service:filter');

    filter.setFilter([{
      id: 'FLRDD897F',
      registration: 'D-9106',
      callsign: 'C1',
      type: 'LS 4',
      handicap: 1.025,
      name: 'Jane Doe',
    }]);

    assert.equal(filter.filter.length, 1);
    assert.deepEqual(filter.filter[0].name, 'Jane Doe');
  });
});
