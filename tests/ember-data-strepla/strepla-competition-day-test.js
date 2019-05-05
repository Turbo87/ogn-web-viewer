import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupQunit as setupPolly } from '@pollyjs/core';

import { COMPETITION_LIST_URL, COMPETITION_DAY_LIST_URL } from 'ember-data-strepla/urls';

module('ember-data-strepla | strepla-competition-day', function(hooks) {
  setupTest(hooks);
  setupPolly(hooks, { recordIfMissing: false });

  hooks.beforeEach(function() {
    this.server = this.polly.server;
    this.store = this.owner.lookup('service:store');
  });

  hooks.beforeEach(function() {
    this.server.get(COMPETITION_DAY_LIST_URL).intercept((req, res) => {
      let classes = [];

      if (req.query.cID === '577') {
        classes.push(
          {
            DT_RowId: 1,
            idCD: '5377',
            date: '2017-04-05T00:00:00',
            idCC: '856',
            nameCC: 'Gem.',
            state: '0',
            sState: 'Ungeplant',
          },
          {
            DT_RowId: 2,
            idCD: '5380',
            date: '2017-04-05T00:00:00',
            idCC: '868',
            nameCC: '18m',
            state: '60',
            sState: 'Neutralisiert',
          },
          {
            DT_RowId: 3,
            idCD: '5383',
            date: '2017-04-06T00:00:00',
            idCC: '856',
            nameCC: 'Gem.',
            state: '50',
            sState: 'Endgültige Wertung',
          },
          {
            DT_RowId: 4,
            idCD: '5386',
            date: '2017-04-06T00:00:00',
            idCC: '868',
            nameCC: '18m',
            state: '50',
            sState: 'Endgültige Wertung',
          },
        );
      }

      return res.status(200).send(classes);
    });
  });

  module('query()', function() {
    test('requests data from the API and transforms it to Ember Data models', async function(assert) {
      let records = await this.store.query('strepla-competition-day', { competitionId: 577 });

      assert.equal(records.length, 4);

      let c1 = records.objectAt(0);
      assert.strictEqual(c1.id, '5377');
      assert.equal(c1.className, 'Gem.');
      assert.equal(c1.date.getTime(), Date.parse('2017-04-05T00:00:00'));

      let c2 = records.objectAt(1);
      assert.strictEqual(c2.id, '5380');
      assert.equal(c2.className, '18m');
    });

    test('caches Ember Data models in the store', async function(assert) {
      await this.store.query('strepla-competition-day', { competitionId: 577 });
      assert.equal(this.store.peekAll('strepla-competition-day').length, 4);
    });

    test('throws an error if the server responds with an error', async function(assert) {
      this.server.get(COMPETITION_DAY_LIST_URL).intercept((req, res) => res.status(500).send());

      try {
        await this.store.query('strepla-competition-day', { competitionId: 577 });
        assert.fail('query() unexpectedly did not fail');
      } catch (error) {
        assert.equal(error.toString(), 'Error: The adapter operation failed due to a server error');
        assert.equal(error.response.status, 500);
        assert.equal(this.store.peekAll('strepla-competition-day').length, 0);
      }
    });
  });

  test('has an async `competition` relationship', async function(assert) {
    this.server.get(COMPETITION_LIST_URL).intercept((req, res) =>
      res.status(200).send([
        {
          id: 577,
          name: 'EuregioCup 2019',
          Location: 'Aachen-Merzbrück',
          firstDay: '2019-06-06T00:00:00',
          lastDay: '2019-06-10T00:00:00',
          fnLogo: '',
        },
      ]),
    );

    let records = await this.store.query('strepla-competition-day', { competitionId: 577 });
    let record = records.objectAt(0);

    let competition = await record.competition;
    assert.equal(competition.name, 'EuregioCup 2019');
  });

  test('has an async `class` relationship', async function(assert) {
    let records = await this.store.query('strepla-competition-day', { competitionId: 577 });
    let record = records.objectAt(0);

    // `await record.class` does not work because `findRecord()` is not implemented for
    // the `strepla-competition-class` adapter, but at least we can access the ID
    // of the related record

    assert.equal(record.belongsTo('class').id(), '856');
  });
});
