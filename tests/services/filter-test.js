import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Service | filter', function(hooks) {
  setupTest(hooks);

  test('add() adds new records to the filter', async function(assert) {
    let filter = this.owner.lookup('service:filter');

    filter.add({
      ID: 'FLRDD897F',
      CALL: 'D-9106',
      CN: 'C1',
      TYPE: 'LS 4',
      HANDICAP: 1.025,
      NAME: 'Jane Doe',
    });

    assert.equal(filter.filter.length, 1);
    assert.deepEqual(filter.filter[0].NAME, 'Jane Doe');
  });
});
