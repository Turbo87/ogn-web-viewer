import { module, test } from 'qunit';
import { normalizeDeviceId } from 'ogn-web-viewer/utils/normalize-device-id';

module('normalizeDeviceId()', function() {
  const TESTS = [
    ['FLRDDA5BA', 'FLRDDA5BA'],
    ['ICA4B0E3A', 'ICA4B0E3A'],
    ['OGNE95A16', 'OGNE95A16'],
    ['06DDA524', 'FLRDDA524'],
    ['DDA524', 'FLRDDA524'],
  ];

  for (let [input, expected] of TESTS) {
    test(`${input} -> ${expected}`, function(assert) {
      let output = normalizeDeviceId(input);
      assert.equal(output, expected);
    });
  }
});
