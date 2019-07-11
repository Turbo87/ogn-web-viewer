import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('ember-data-strepla | Transforms | strepla-duration', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.transform = this.owner.lookup('transform:strepla-duration');
  });

  module('deserialize()', function() {
    test('deserializes valid durations', function(assert) {
      assert.strictEqual(this.transform.deserialize('0:00'), 0);
      assert.strictEqual(this.transform.deserialize('00:00'), 0);
      assert.strictEqual(this.transform.deserialize('00:01'), 1);
      assert.strictEqual(this.transform.deserialize('00:42'), 42);
      assert.strictEqual(this.transform.deserialize('00:59'), 59);
      assert.strictEqual(this.transform.deserialize('01:00'), 60);
      assert.strictEqual(this.transform.deserialize('01:23'), 83);
      assert.strictEqual(this.transform.deserialize('12:34'), 754);
      assert.strictEqual(this.transform.deserialize('4:32'), 272);
    });

    test('deserializes empty values to `null`', function(assert) {
      assert.strictEqual(this.transform.deserialize(), null);
      assert.strictEqual(this.transform.deserialize(undefined), null);
      assert.strictEqual(this.transform.deserialize(null), null);
      assert.strictEqual(this.transform.deserialize(''), null);
    });

    test('throws errors for invalid durations', function(assert) {
      assert.throws(() => this.transform.deserialize(123), /Invalid duration: 123/);
      assert.throws(() => this.transform.deserialize({}), /Invalid duration: .+/);
      assert.throws(() => this.transform.deserialize('ff'), /Invalid duration: ff/);
      assert.throws(() => this.transform.deserialize('00:60'), /Invalid duration: 00:60/);
    });
  });

  module('serialize()', function() {
    test('is not available', function(assert) {
      assert.strictEqual(this.transform.serialize, null);
    });
  });
});
