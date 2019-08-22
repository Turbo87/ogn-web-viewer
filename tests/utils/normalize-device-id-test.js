import { module, test } from 'qunit';

import { normalizeDeviceId } from 'ogn-web-viewer/utils/normalize-device-id';

module('Utils | normalizeDeviceId()', function() {
  const TESTS = [
    [undefined, null],
    [null, null],
    ['', null],
    ['FLRDDA5BA', 'FLRDDA5BA'],
    ['ICA4B0E3A', 'ICA4B0E3A'],
    ['OGNE95A16', 'OGNE95A16'],
    ['06DDA524', 'FLRDDA524'],
    ['DDA524', 'FLRDDA524'],
    ['XX123456', null],
    ['053E5E5C', 'ICA3E5E5C'],
    ['22D00442', 'FLRD00442'],
    ['3AA007', 'ICA3AA007'],
    ['XXXXXX', null],
    ['FLRXXXXXX', null],
    ['1234567890', null],
    // Generic tests for boundaries of 6-digit Flarm ID ranges
    ['D00000', 'FLRD00000'],
    ['DFFFFF', 'FLRDFFFFF'],
    ['004000', 'ICA004000'],
    ['E94FFF', 'ICAE94FFF'],
    ['000000', 'OGN000000'],
    ['003FFF', 'OGN003FFF'],
    // Some test cases taken from reality - here DM Stendal 2019 competition - open class
    ['3ED364', 'ICA3ED364'],
    ['DF0EDE', 'FLRDF0EDE'],
    ['D003B7', 'FLRD003B7'],
    ['3F0678', 'ICA3F0678'],
    ['DF1407', 'FLRDF1407'],
  ];

  for (let [input, expected] of TESTS) {
    test(`${input} -> ${expected}`, function(assert) {
      let output = normalizeDeviceId(input);
      assert.equal(output, expected);
    });
  }
});
