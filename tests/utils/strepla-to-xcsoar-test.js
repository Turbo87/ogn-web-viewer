import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { convertTask } from 'ogn-web-viewer/utils/strepla-to-xcsoar';

module('Utils | strepla-to-xcsoar | convertTask', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(async function() {
    let { readTaskFromString } = await import('aeroscore/dist/src/read-task');
    this.readTaskFromString = readTaskFromString;
  });

  test('can convert a racing task', function(assert) {
    let taskRecord = this.owner.lookup('service:store').createRecord('strepla-task');

    taskRecord.setProperties({
      ruleName: 'Racing-Task (RT)',
      turnpoints: [
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
      ],
    });

    let result = convertTask(taskRecord);

    assert.equal(
      result,
      [
        '<Task type="RT">',
        '  <Point type="Start">',
        '    <Waypoint id="178687" name="AP Zwickau West A72 BAB010">',
        '      <Location latitude="50.6383333333333" longitude="12.44"/>',
        '    </Waypoint>',
        '    <ObservationZone type="Line" length="20000"/>',
        '  </Point>',
        '  <Point type="Turn">',
        '    <Waypoint id="178900" name="Marienberg Markt">',
        '      <Location latitude="50.6508333333333" longitude="13.1633333333333"/>',
        '    </Waypoint>',
        '    <ObservationZone type="Keyhole"/>',
        '  </Point>',
        '  <Point type="Finish">',
        '    <Waypoint id="178672" name="Zwickau FP EDBI">',
        '      <Location latitude="50.7033333333333" longitude="12.4591666666667"/>',
        '    </Waypoint>',
        '    <ObservationZone type="Cylinder" radius="5000"/>',
        '  </Point>',
        '</Task>',
      ].join('\n'),
    );

    let task = this.readTaskFromString(result);
    assert.ok(task);
  });

  test('can convert an area task', function(assert) {
    let taskRecord = this.owner.lookup('service:store').createRecord('strepla-task');

    taskRecord.setProperties({
      ruleName: 'Speed Assigned Area Task (AAT)',
      minTime: 192,
      turnpoints: [
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
            type: 'AAT SECTOR',
            radius: 10000,
            radial1: 0,
            radial2: 0,
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
      ],
    });

    let result = convertTask(taskRecord);

    assert.equal(
      result,
      [
        '<Task aat_min_time="192" type="AAT">',
        '  <Point type="Start">',
        '    <Waypoint id="178687" name="AP Zwickau West A72 BAB010">',
        '      <Location latitude="50.6383333333333" longitude="12.44"/>',
        '    </Waypoint>',
        '    <ObservationZone type="Line" length="20000"/>',
        '  </Point>',
        '  <Point type="Turn">',
        '    <Waypoint id="178900" name="Marienberg Markt">',
        '      <Location latitude="50.6508333333333" longitude="13.1633333333333"/>',
        '    </Waypoint>',
        '    <ObservationZone type="Cylinder" radius="10000"/>',
        '  </Point>',
        '  <Point type="Finish">',
        '    <Waypoint id="178672" name="Zwickau FP EDBI">',
        '      <Location latitude="50.7033333333333" longitude="12.4591666666667"/>',
        '    </Waypoint>',
        '    <ObservationZone type="Cylinder" radius="5000"/>',
        '  </Point>',
        '</Task>',
      ].join('\n'),
    );

    let task = this.readTaskFromString(result);
    assert.ok(task);
  });
});
