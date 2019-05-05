import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupQunit as setupPolly } from '@pollyjs/core';

import { COMPETITION_LIST_URL, TASK_URL } from 'ember-data-strepla/urls';

module('ember-data-strepla | strepla-task', function(hooks) {
  setupTest(hooks);
  setupPolly(hooks, { recordIfMissing: false });

  hooks.beforeEach(function() {
    this.server = this.polly.server;
    this.store = this.owner.lookup('service:store');
  });

  hooks.beforeEach(function() {
    this.server.get(TASK_URL).intercept((req, res) => {
      if (req.query.cID === '577' && req.query.idDay === '5917') {
        return res.status(200).send({
          id: '6553',
          name: 'Tagesaufgabe A',
          distance: '361 km',
          numLegs: '4',
          rule: 'Racing-Task (RT)',
          tps: [
            {
              scoring: {
                type: 'LINE',
                width: 20000,
              },
              tp: {
                id: '178687',
                name: 'AP Zwickau West A72 BAB010',
                lat: 50.6383333333333,
                lng: 12.44,
              },
            },
            {
              scoring: {
                type: 'KEYHOLE',
                radiusCylinder: 500,
                radiusSector: 10000,
                angle: 90,
              },
              tp: {
                id: '178900',
                name: 'Marienberg Markt',
                lat: 50.6508333333333,
                lng: 13.1633333333333,
              },
            },
            {
              scoring: {
                type: 'CYLINDER',
                radius: 5000,
              },
              tp: {
                id: '178672',
                name: 'Zwickau FP EDBI',
                lat: 50.7033333333333,
                lng: 12.4591666666667,
              },
            },
          ],
        });
      } else {
        return res.status(500).send();
      }
    });
  });

  module('queryRecord()', function() {
    test('requests data from the API and transforms it to an Ember Data model', async function(assert) {
      let record = await this.store.queryRecord('strepla-task', { competitionId: 577, competitionDayId: 5917 });

      assert.ok(record);
      assert.strictEqual(record.id, '6553');
      assert.equal(record.name, 'Tagesaufgabe A');
      assert.equal(record.distance, '361 km');
      assert.equal(record.ruleName, 'Racing-Task (RT)');
      assert.deepEqual(record.turnpoints, [
        {
          tp: {
            id: '178687',
            name: 'AP Zwickau West A72 BAB010',
            lat: 50.6383333333333,
            lng: 12.44,
          },
          scoring: {
            type: 'LINE',
            width: 20000,
          },
        },
        {
          tp: {
            id: '178900',
            name: 'Marienberg Markt',
            lat: 50.6508333333333,
            lng: 13.1633333333333,
          },
          scoring: {
            type: 'KEYHOLE',
            angle: 90,
            radiusCylinder: 500,
            radiusSector: 10000,
          },
        },
        {
          tp: {
            id: '178672',
            name: 'Zwickau FP EDBI',
            lat: 50.7033333333333,
            lng: 12.4591666666667,
          },
          scoring: {
            type: 'CYLINDER',
            radius: 5000,
          },
        },
      ]);
    });

    test('caches the Ember Data model in the store', async function(assert) {
      await this.store.queryRecord('strepla-task', { competitionId: 577, competitionDayId: 5917 });
      assert.equal(this.store.peekAll('strepla-task').length, 1);
    });

    test('throws an error if the server responds with an error', async function(assert) {
      this.server.get(TASK_URL).intercept((req, res) => res.status(500).send());

      try {
        await this.store.queryRecord('strepla-task', { competitionId: 577, competitionDayId: 5917 });
        assert.fail('queryRecord() unexpectedly did not fail');
      } catch (error) {
        assert.equal(error.toString(), 'Error: strepla-task: queryRecord() failed');
        assert.equal(error.response.status, 500);
        assert.equal(this.store.peekAll('strepla-task').length, 0);
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

    let record = await this.store.queryRecord('strepla-task', { competitionId: 577, competitionDayId: 5917 });

    let competition = await record.competition;
    assert.equal(competition.name, 'EuregioCup 2019');
  });

  test('has an async `competitionDay` relationship', async function(assert) {
    let record = await this.store.queryRecord('strepla-task', { competitionId: 577, competitionDayId: 5917 });

    // `await record.competitionDay` does not work because `findRecord()` is not
    // implemented for the `strepla-competition-day` adapter, but at least we
    // can access the ID of the related record

    assert.equal(record.belongsTo('competitionDay').id(), '5917');
  });
});
