import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { COMPETITION_LIST_URL, COMPETITOR_LIST_URL } from 'ember-data-strepla/urls';

import { setupQunit as setupPolly } from '@pollyjs/core';

module('ember-data-strepla | strepla-competitor', function(hooks) {
  setupTest(hooks);
  setupPolly(hooks, { recordIfMissing: false });

  hooks.beforeEach(function() {
    this.server = this.polly.server;
    this.store = this.owner.lookup('service:store');
  });

  hooks.beforeEach(function() {
    this.server.get(COMPETITOR_LIST_URL).intercept((req, res) => {
      let classes = [];

      if (req.query.cID === '577') {
        classes.push(
          {
            id: 1,
            name: 'Mustermann, Max',
            country: 'LV Aachen',
            glider_name: 'Duo Discus',
            glider_callsign: 'D-9041',
            glider_index: '110.00',
            glider_cid: 'YD2',
            flarm_ID: '',
            logger1: '',
            logger2: '',
            logger3: '',
            className: 'Hasen',
          },
          {
            id: 2,
            name: 'Bieniek, Tobias',
            country: 'RSB Flugzeugpark n.e.V.',
            glider_name: 'LS 6a',
            glider_callsign: 'D-0816',
            glider_index: '111.00',
            glider_cid: 'SG',
            flarm_ID: 'DD123456',
            logger1: '6V7',
            logger2: '42',
            logger3: '',
            className: 'Igel',
          },
          {
            id: 3,
            name: 'Doe, John',
            country: 'FV Aachen',
            glider_name: 'ASW 28-18',
            glider_callsign: 'D-KWRL',
            glider_index: '114.00',
            glider_cid: '29',
            flarm_ID: '',
            logger1: '',
            logger2: '',
            logger3: '',
            className: 'Hasen',
          },
        );
      }

      return res.status(200).send(classes);
    });
  });

  module('query()', function() {
    test('requests data from the API and transforms it to Ember Data models', async function(assert) {
      let records = await this.store.query('strepla-competitor', { competitionId: 577 });

      assert.equal(records.length, 3);

      let record = records.objectAt(0);
      assert.strictEqual(record.id, '577-1');
      assert.equal(record.name, 'Mustermann, Max');

      record = records.objectAt(1);
      assert.strictEqual(record.id, '577-2');
      assert.equal(record.name, 'Bieniek, Tobias');
      assert.equal(record.type, 'LS 6a');
      assert.equal(record.registration, 'D-0816');
      assert.equal(record.callsign, 'SG');
      assert.equal(record.handicap, 111);
      assert.equal(record.flarmID, 'DD123456');
      assert.equal(record.logger1, '6V7');
      assert.equal(record.logger2, '42');
      assert.equal(record.logger3, '');
      assert.equal(record.className, 'Igel');

      record = records.objectAt(2);
      assert.strictEqual(record.id, '577-3');
      assert.equal(record.name, 'Doe, John');
    });

    test('accepts a `className` filter', async function(assert) {
      let records = await this.store.query('strepla-competitor', { competitionId: 577, className: 'Hasen' });

      assert.equal(records.length, 2);

      let record = records.objectAt(0);
      assert.strictEqual(record.id, '577-1');
      assert.equal(record.name, 'Mustermann, Max');

      record = records.objectAt(1);
      assert.strictEqual(record.id, '577-3');
      assert.equal(record.name, 'Doe, John');
    });

    test('caches Ember Data models in the store', async function(assert) {
      await this.store.query('strepla-competitor', { competitionId: 577 });
      assert.equal(this.store.peekAll('strepla-competitor').length, 3);
    });

    test('throws an error if the server responds with an error', async function(assert) {
      this.server.get(COMPETITOR_LIST_URL).intercept((req, res) => res.status(500).send());

      try {
        await this.store.query('strepla-competitor', { competitionId: 577 });
        assert.fail('query() unexpectedly did not fail');
      } catch (error) {
        assert.equal(error.toString(), 'Error: The adapter operation failed due to a server error');
        assert.equal(error.response.status, 500);
        assert.equal(this.store.peekAll('strepla-competitor').length, 0);
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

    let records = await this.store.query('strepla-competitor', { competitionId: 577 });
    let record = records.objectAt(0);

    let competition = await record.competition;
    assert.equal(competition.name, 'EuregioCup 2019');
  });
});
