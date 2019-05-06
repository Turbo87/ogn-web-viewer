import { module, test } from 'qunit';

import window, { setupWindowMock } from 'ember-window-mock';

import { hashToQueryParams } from 'ogn-web-viewer/utils/hash-to-qp';

module('Utils | hashToQueryParams', function(hooks) {
  setupWindowMock(hooks);

  hooks.beforeEach(function() {
    window.location.hash = '';
    window.location.search = '';
  });

  test('empty hash -> empty QP', function(assert) {
    hashToQueryParams();
    assert.equal(window.location.hash, '');
    assert.equal(window.location.search, '');
  });

  test('lst hash -> lst QP', function(assert) {
    window.location.hash = `#lst=foo.csv`;

    hashToQueryParams();
    assert.equal(window.location.hash, '');
    assert.equal(window.location.search, '?lst=foo.csv');
  });

  test('tsk hash -> tsk QP', function(assert) {
    window.location.hash = `#tsk=foo.tsk`;

    hashToQueryParams();
    assert.equal(window.location.hash, '');
    assert.equal(window.location.search, '?tsk=foo.tsk');
  });

  test('foo hash -> foo hash', function(assert) {
    window.location.hash = `#foo=bar`;

    hashToQueryParams();
    assert.equal(window.location.hash, '#foo=bar');
    assert.equal(window.location.search, '');
  });

  test('multiple params', function(assert) {
    window.location.hash = `#lst=foo.csv&tsk=bar.tsk`;

    hashToQueryParams();
    assert.equal(window.location.hash, '');
    assert.equal(window.location.search, '?lst=foo.csv&tsk=bar.tsk');
  });

  test('multiple params with existing QP', function(assert) {
    window.location.search = `?foo=bar&baz`;
    window.location.hash = `#lst=foo.csv&tsk=bar.tsk&qux`;

    hashToQueryParams();
    assert.equal(window.location.hash, '#qux=');
    assert.equal(window.location.search, '?foo=bar&baz=&lst=foo.csv&tsk=bar.tsk');
  });

  test('realistic', function(assert) {
    window.location.search = ``;
    window.location.hash = `#tsk=https://gist.githubusercontent.com/Turbo87/62167f4f16f3e94f7bd04d7d6388d79d/raw/club.tsk&lst=https://gist.githubusercontent.com/Turbo87/62167f4f16f3e94f7bd04d7d6388d79d/raw/club-filter.csv`;

    hashToQueryParams();
    assert.equal(window.location.hash, '');
    assert.equal(
      window.location.search,
      '?lst=https%3A%2F%2Fgist.githubusercontent.com%2FTurbo87%2F62167f4f16f3e94f7bd04d7d6388d79d%2Fraw%2Fclub-filter.csv&tsk=https%3A%2F%2Fgist.githubusercontent.com%2FTurbo87%2F62167f4f16f3e94f7bd04d7d6388d79d%2Fraw%2Fclub.tsk',
    );
  });
});
