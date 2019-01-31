import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { waitUntil } from '@ember/test-helpers';
import { Server } from 'mock-socket';

import config from 'ogn-web-viewer/config/environment';
import { parseMessage } from 'ogn-web-viewer/services/ws';

module('Service | ws', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.server = new Server(`${config.WS_HOST}/api/live`);
  });

  hooks.afterEach(function() {
    this.server.stop();
    this.server = null;
  });

  module('start()', function() {
    test('opens a connection to /api/live', async function(assert) {
      let ws = this.owner.lookup('service:ws');

      await new Promise(resolve => {
        once(this.server, 'connection', resolve);
        ws.start();
      });

      assert.equal(this.server.clients().length, 1);
    });

    test('reconnects automatically', async function(assert) {
      let ws = this.owner.lookup('service:ws');

      let serverSocket = await new Promise(resolve => {
        once(this.server, 'connection', resolve);
        ws.start();
      });

      await new Promise(resolve => {
        once(this.server, 'connection', resolve);
        serverSocket.close({ code: 1012 });
      });

      assert.equal(this.server.clients().length, 1);
    });
  });

  module('stop()', function() {
    test('closes the connection', async function(assert) {
      let ws = this.owner.lookup('service:ws');

      await new Promise(resolve => {
        once(this.server, 'connection', resolve);
        ws.start();
      });

      assert.equal(this.server.clients().length, 1);

      await new Promise(resolve => {
        once(this.server, 'close', resolve);
        ws.stop();
      });

      assert.equal(this.server.clients().length, 0);
    });
  });

  test('received records trigger events', async function(assert) {
    let ws = this.owner.lookup('service:ws');

    let serverSocket = await new Promise(resolve => {
      once(this.server, 'connection', resolve);
      ws.start();
    });

    let receivedRecords = [];
    ws.on('record', record => receivedRecords.push(record));

    serverSocket.send('FLRDF1685|1548442393|9.948150|50.498117|0|905');
    serverSocket.send('ICA4B43CD|1548442398|7.429783|46.928783|157|1025');

    await waitUntil(() => receivedRecords.length === 2);

    assert.equal(receivedRecords[0].id, 'FLRDF1685');
    assert.strictEqual(receivedRecords[1].timestamp, 1548442398);
  });

  module('subscribeToId()', function() {
    test('sends out a `+id` message', async function(assert) {
      let ws = this.owner.lookup('service:ws');

      let serverSocket = await new Promise(resolve => {
        once(this.server, 'connection', resolve);
        ws.start();
      });

      let receivedMessages = [];
      serverSocket.on('message', message => receivedMessages.push(message));

      ws.subscribeToId('FLRDF1685');

      await waitUntil(() => receivedMessages.length === 1);
      assert.equal(receivedMessages[0], '+id|FLRDF1685');
    });

    test('resubscribes when reconnecting', async function(assert) {
      let ws = this.owner.lookup('service:ws');

      let serverSocket = await new Promise(resolve => {
        once(this.server, 'connection', resolve);
        ws.start();
      });

      let receivedMessages = [];
      serverSocket.on('message', message => receivedMessages.push(message));

      ws.subscribeToId('FLRDF1685');

      await waitUntil(() => receivedMessages.length === 1);
      assert.equal(receivedMessages[0], '+id|FLRDF1685');

      serverSocket = await new Promise(resolve => {
        once(this.server, 'connection', resolve);
        serverSocket.close({ code: 1012 });
      });
      serverSocket.on('message', message => receivedMessages.push(message));

      await waitUntil(() => receivedMessages.length === 2);
      assert.equal(receivedMessages[1], '+id|FLRDF1685');
    });
  });

  module('unsubscribeFromId()', function() {
    test('sends out a `-id` message', async function(assert) {
      let ws = this.owner.lookup('service:ws');

      let serverSocket = await new Promise(resolve => {
        once(this.server, 'connection', resolve);
        ws.start();
      });

      let receivedMessages = [];
      serverSocket.on('message', message => receivedMessages.push(message));

      ws.unsubscribeFromId('FLRDF1685');

      await waitUntil(() => receivedMessages.length === 1);
      assert.equal(receivedMessages[0], '-id|FLRDF1685');
    });
  });

  module('setBBox()', function() {
    test('sends out a `bbox` message', async function(assert) {
      let ws = this.owner.lookup('service:ws');

      let serverSocket = await new Promise(resolve => {
        once(this.server, 'connection', resolve);
        ws.start();
      });

      let receivedMessages = [];
      serverSocket.on('message', message => receivedMessages.push(message));

      ws.setBBox([-12.521, 25.171, 28.704, 61.963]);

      await waitUntil(() => receivedMessages.length === 1);
      assert.equal(receivedMessages[0], 'bbox|-12.521|25.171|28.704|61.963');
    });

    test('resubscribes when reconnecting', async function(assert) {
      let ws = this.owner.lookup('service:ws');

      let serverSocket = await new Promise(resolve => {
        once(this.server, 'connection', resolve);
        ws.start();
      });

      let receivedMessages = [];
      serverSocket.on('message', message => receivedMessages.push(message));

      ws.setBBox([-12.521, 25.171, 28.704, 61.963]);

      await waitUntil(() => receivedMessages.length === 1);
      assert.equal(receivedMessages[0], 'bbox|-12.521|25.171|28.704|61.963');

      serverSocket = await new Promise(resolve => {
        once(this.server, 'connection', resolve);
        serverSocket.close({ code: 1012 });
      });
      serverSocket.on('message', message => receivedMessages.push(message));

      await waitUntil(() => receivedMessages.length === 2);
      assert.equal(receivedMessages[1], 'bbox|-12.521|25.171|28.704|61.963');
    });
  });

  module('parseMessage()', function() {
    test('parses OGN position record messages', function(assert) {
      let record = parseMessage('FLRC04EFE|1531605102|-75.117233|45.493900|16|743');
      assert.strictEqual(record.id, 'FLRC04EFE');
      assert.strictEqual(record.timestamp, 1531605102);
      assert.strictEqual(record.longitude, -75.117233);
      assert.strictEqual(record.latitude, 45.4939);
      assert.strictEqual(record.course, 16);
      assert.strictEqual(record.altitude, 743);
    });
  });
});

function once(target, type, callback) {
  let wrappedCallback = (...args) => {
    callback(...args);
    target.removeEventListener(type, wrappedCallback);
  };

  target.addEventListener(type, wrappedCallback);
}
