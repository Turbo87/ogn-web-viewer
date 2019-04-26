import { module, test } from 'qunit';
import { normalizeDeviceId } from 'ogn-web-viewer/utils/normalize-device-id';

module('normalizeDeviceId()', function() {
  const TESTS = [
    ['FLRDDA5BA', 'FLRDDA5BA'],
    ['ICA4B0E3A', 'ICA4B0E3A'],
    ['OGNE95A16', 'OGNE95A16'],
    ['06DDA524', 'FLRDDA524'],
    ['DDA524', 'FLRDDA524'],
    ['XX123456', null],
    ['053E5E5C', 'ICA3E5E5C'],
    ['22D00442', 'FLRD00442'],
    ['3AA007', 'FLR3AA007'],
    ['XXXXXX', null],
    ['FLRXXXXXX', null],
    ['1234567890', null],
  ];

  for (let [input, expected] of TESTS) {
    test(`${input} -> ${expected}`, function(assert) {
      let output = normalizeDeviceId(input);
      assert.equal(output, expected);
    });
  }
});
