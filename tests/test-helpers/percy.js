import QUnit from 'qunit';
import { percySnapshot as _percySnapshot } from 'ember-percy';

export async function percySnapshot(nameSuffix, options = {}) {
  let { testName, module } = QUnit.config.current;
  let name = `${module.name}: ${testName}`;
  if (nameSuffix) {
    name += ` (${nameSuffix})`;
  }

  await _percySnapshot(name, options);
}
