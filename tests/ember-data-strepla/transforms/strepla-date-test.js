import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('ember-data-strepla | Transforms | strepla-date', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.transform = this.owner.lookup('transform:strepla-date');
  });

  module('deserialize()', function() {
    test('deserializes ISO date strings from the StrePla API', function(assert) {
      let result = this.transform.deserialize('2019-06-06T00:00:00');

      assert.equal(typeof result, 'object');
      assert.equal(result.constructor.name, 'Date');

      assert.equal(result.getFullYear(), 2019);
      assert.equal(result.getMonth(), 5);
      assert.equal(result.getDate(), 6);
      assert.equal(result.getHours(), 0);
      assert.equal(result.getMinutes(), 0);
      assert.equal(result.getSeconds(), 0);
      assert.equal(result.getMilliseconds(), 0);
    });

    test('throws errors for invalid dates', function(assert) {
      assert.throws(() => this.transform.deserialize('ff'), /Invalid date: ff/);
    });
  });

  module('serialize()', function() {
    test('is not available', function(assert) {
      assert.strictEqual(this.transform.serialize, null);
    });
  });
});
