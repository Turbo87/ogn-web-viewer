import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import DS from 'ember-data';

import { setupQunit as setupPolly } from '@pollyjs/core';

const { NotFoundError } = DS;

module('ember-data-strepla | strepla-competition', function(hooks) {
  setupTest(hooks);
  setupPolly(hooks, { recordIfMissing: false });

  hooks.beforeEach(function() {
    this.server = this.polly.server;
    this.store = this.owner.lookup('service:store');
  });

  hooks.beforeEach(function() {
    this.server.get('http://www.strepla.de/scs/ws/competition.ashx?cmd=active').intercept((req, res) => {
      let competitions = [
        {
          id: 577,
          name: 'EuregioCup 2019',
          Location: 'Aachen-Merzbrück',
          firstDay: '2019-06-06T00:00:00',
          lastDay: '2019-06-10T00:00:00',
          fnLogo: '',
        },
        {
          id: 487,
          name: 'Internationaler Bayreuth Wettbewerb 2018',
          Location: 'Bayreuth-Bindlacher Berg (EDQD)',
          firstDay: '2018-05-23T00:00:00',
          lastDay: '2018-06-01T00:00:00',
          fnLogo: 'logo.jpg',
        },
      ];

      let { daysPeriod } = req.query;
      if (daysPeriod && daysPeriod >= 360) {
        competitions.push({
          id: 571,
          name: 'DM Club- und Standardklasse 2017',
          Location: 'VLP Zwickau',
          firstDay: '2017-05-20T00:00:00',
          lastDay: '2017-05-31T00:00:00',
          fnLogo: 'logo.png',
        });
      }

      return res.status(200).send(competitions);
    });
  });

  module('query()', function() {
    test('requests data from the API and transforms it to Ember Data models', async function(assert) {
      let records = await this.store.query('strepla-competition', {});

      assert.equal(records.length, 2);

      let comp1 = records.objectAt(0);
      assert.strictEqual(comp1.id, '577');
      assert.equal(comp1.name, 'EuregioCup 2019');
      assert.equal(comp1.location, 'Aachen-Merzbrück');
      assert.equal(comp1.firstDay.getTime(), Date.parse('2019-06-06T00:00:00'));
      assert.equal(comp1.lastDay.getTime(), Date.parse('2019-06-10T00:00:00'));
      assert.strictEqual(comp1.logoFilename, null);

      let comp2 = records.objectAt(1);
      assert.strictEqual(comp2.id, '487');
      assert.equal(comp2.name, 'Internationaler Bayreuth Wettbewerb 2018');
      assert.equal(comp2.logoFilename, 'logo.jpg');
    });

    test('supports the `daysPeriod` parameter', async function(assert) {
      let records = await this.store.query('strepla-competition', { daysPeriod: 360 });

      assert.equal(records.length, 3);

      let comp1 = records.objectAt(0);
      assert.strictEqual(comp1.id, '577');
      assert.equal(comp1.name, 'EuregioCup 2019');

      let comp2 = records.objectAt(1);
      assert.strictEqual(comp2.id, '487');
      assert.equal(comp2.name, 'Internationaler Bayreuth Wettbewerb 2018');

      let comp3 = records.objectAt(2);
      assert.strictEqual(comp3.id, '571');
      assert.equal(comp3.name, 'DM Club- und Standardklasse 2017');
    });

    test('caches Ember Data models in the store', async function(assert) {
      await this.store.query('strepla-competition', {});

      assert.equal(this.store.peekAll('strepla-competition').length, 2);

      let comp = this.store.peekRecord('strepla-competition', '577');
      assert.strictEqual(comp.id, '577');
      assert.equal(comp.name, 'EuregioCup 2019');

      assert.strictEqual(this.store.peekRecord('strepla-competition', '123'), null);
    });

    test('throws an error if the server responds with an error', async function(assert) {
      this.server
        .get('http://www.strepla.de/scs/ws/competition.ashx?cmd=active')
        .intercept((req, res) => res.status(500).send());

      try {
        await this.store.query('strepla-competition', {});
        assert.fail('query() unexpectedly did not fail');
      } catch (error) {
        assert.equal(error.toString(), 'Error: strepla-competition: query() failed');
        assert.equal(error.response.status, 500);
        assert.equal(this.store.peekAll('strepla-competition').length, 0);
      }
    });
  });

  module('findRecord()', function() {
    test('requests data from the API and transforms it to Ember Data models', async function(assert) {
      let record = await this.store.findRecord('strepla-competition', 577);

      assert.ok(record);
      assert.strictEqual(record.id, '577');
      assert.equal(record.name, 'EuregioCup 2019');
      assert.equal(record.location, 'Aachen-Merzbrück');
      assert.equal(record.firstDay.getTime(), Date.parse('2019-06-06T00:00:00'));
      assert.equal(record.lastDay.getTime(), Date.parse('2019-06-10T00:00:00'));
      assert.strictEqual(record.logoFilename, null);
    });

    test('caches Ember Data models in the store', async function(assert) {
      await this.store.findRecord('strepla-competition', 577);

      assert.equal(this.store.peekAll('strepla-competition').length, 1);

      let comp = this.store.peekRecord('strepla-competition', '577');
      assert.strictEqual(comp.id, '577');
      assert.equal(comp.name, 'EuregioCup 2019');

      assert.strictEqual(this.store.peekRecord('strepla-competition', '123'), null);
    });

    test('throws a NotFoundError if the record does not exist', async function(assert) {
      try {
        await this.store.findRecord('strepla-competition', 123);
        assert.fail('findRecord() unexpectedly did not fail');
      } catch (error) {
        assert.ok(error instanceof NotFoundError);
        assert.equal(error.toString(), 'Error: Competition with ID 123 could not be found');
        assert.equal(this.store.peekAll('strepla-competition').length, 0);
      }
    });

    test('throws an error if the server responds with an error', async function(assert) {
      this.server
        .get('http://www.strepla.de/scs/ws/competition.ashx?cmd=active')
        .intercept((req, res) => res.status(500).send());

      try {
        await this.store.findRecord('strepla-competition', 577);
        assert.fail('findRecord() unexpectedly did not fail');
      } catch (error) {
        assert.equal(error.toString(), 'Error: strepla-competition: findRecord(577) failed');
        assert.equal(error.response.status, 500);
        assert.equal(this.store.peekAll('strepla-competition').length, 0);
      }
    });
  });
});
