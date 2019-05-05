import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupQunit as setupPolly } from '@pollyjs/core';

module('ember-data-strepla | strepla-competition', function(hooks) {
  setupTest(hooks);
  setupPolly(hooks, { recordIfMissing: false });

  hooks.beforeEach(function() {
    this.server = this.polly.server;
    this.store = this.owner.lookup('service:store');
  });

  module('query()', function(hooks) {
    hooks.beforeEach(function() {
      this.server.get('http://www.strepla.de/scs/ws/competition.ashx?cmd=active').intercept((req, res) =>
        res.status(200).send([
          {
            id: 577,
            name: 'EuregioCup 2019',
            Location: 'Aachen-Merzbrück',
            firstDay: '2019-06-06T00:00:00',
            lastDay: '2019-06-10T00:00:00',
            fnLogo: '',
          },
          {
            id: 571,
            name: 'DM Club- und Standardklasse 2017',
            Location: 'VLP Zwickau',
            firstDay: '2017-05-20T00:00:00',
            lastDay: '2017-05-31T00:00:00',
            fnLogo: 'logo.png',
          },
          {
            id: 487,
            name: 'Internationaler Bayreuth Wettbewerb 2018',
            Location: 'Bayreuth-Bindlacher Berg (EDQD)',
            firstDay: '2018-05-23T00:00:00',
            lastDay: '2018-06-01T00:00:00',
            fnLogo: 'logo.jpg',
          },
        ]),
      );
    });

    test('requests data from the API and transforms it to Ember Data models', async function(assert) {
      let records = await this.store.query('strepla-competition', {});

      assert.equal(records.length, 3);

      let comp1 = records.objectAt(0);
      assert.strictEqual(comp1.id, '577');
      assert.equal(comp1.name, 'EuregioCup 2019');
      assert.equal(comp1.location, 'Aachen-Merzbrück');
      assert.equal(comp1.firstDay.getTime(), Date.parse('2019-06-06T00:00:00'));
      assert.equal(comp1.lastDay.getTime(), Date.parse('2019-06-10T00:00:00'));
      assert.strictEqual(comp1.logoFilename, null);

      let comp2 = records.objectAt(1);
      assert.strictEqual(comp2.id, '571');
      assert.equal(comp2.name, 'DM Club- und Standardklasse 2017');
      assert.equal(comp2.logoFilename, 'logo.png');

      let comp3 = records.objectAt(2);
      assert.strictEqual(comp3.id, '487');
    });

    test('caches Ember Data models in the store', async function(assert) {
      await this.store.query('strepla-competition', {});

      assert.equal(this.store.peekAll('strepla-competition').length, 3);

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
});
