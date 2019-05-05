import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupQunit as setupPolly } from '@pollyjs/core';

import { COMPETITION_CLASS_LIST_URL } from 'ember-data-strepla/urls';

module('ember-data-strepla | strepla-competition-class', function(hooks) {
  setupTest(hooks);
  setupPolly(hooks, { recordIfMissing: false });

  hooks.beforeEach(function() {
    this.server = this.polly.server;
    this.store = this.owner.lookup('service:store');
  });

  hooks.beforeEach(function() {
    this.server.get(COMPETITION_CLASS_LIST_URL).intercept((req, res) => {
      let classes = [];

      if (req.query.cID === '577') {
        classes.push(
          { id: 856, name: 'Gem.', rulename: '1000 Punkte Handicap' },
          { id: 868, name: '18m', rulename: '1000 Punkte Handicap' },
        );
      }

      return res.status(200).send(classes);
    });
  });

  module('query()', function() {
    test('requests data from the API and transforms it to Ember Data models', async function(assert) {
      let records = await this.store.query('strepla-competition-class', { competitionId: 577 });

      assert.equal(records.length, 2);

      let c1 = records.objectAt(0);
      assert.strictEqual(c1.id, '856');
      assert.equal(c1.name, 'Gem.');
      assert.equal(c1.ruleName, '1000 Punkte Handicap');

      let c2 = records.objectAt(1);
      assert.strictEqual(c2.id, '868');
      assert.equal(c2.name, '18m');
    });

    test('caches Ember Data models in the store', async function(assert) {
      await this.store.query('strepla-competition-class', { competitionId: 577 });
      assert.equal(this.store.peekAll('strepla-competition-class').length, 2);
    });

    test('throws an error if the server responds with an error', async function(assert) {
      this.server.get(COMPETITION_CLASS_LIST_URL).intercept((req, res) => res.status(500).send());

      try {
        await this.store.query('strepla-competition-class', { competitionId: 577 });
        assert.fail('query() unexpectedly did not fail');
      } catch (error) {
        assert.equal(error.toString(), 'Error: strepla-competition-class: query() failed');
        assert.equal(error.response.status, 500);
        assert.equal(this.store.peekAll('strepla-competition-class').length, 0);
      }
    });
  });
});
