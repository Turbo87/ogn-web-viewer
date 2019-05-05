import { assert } from '@ember/debug';

import BaseSerializer from './-base';

export default class extends BaseSerializer {
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    assert(`Unknown \`requestType\`: ${requestType}`, ['query', 'findRecord'].indexOf(requestType) !== -1);

    if (requestType === 'findRecord') {
      return this.normalize(primaryModelClass, payload);
    }

    return payload.reduce(
      (documentHash, item) => {
        let { data, included } = this.normalize(primaryModelClass, item);
        documentHash.included.push(...included);
        documentHash.data.push(data);
        return documentHash;
      },
      { data: [], included: [] },
    );
  }

  normalize(modelClass, resourceHash) {
    let data = {
      id: resourceHash.id,
      type: modelClass.modelName,
      attributes: {
        name: resourceHash.name,
        location: resourceHash.Location,
        firstDay: resourceHash.firstDay,
        lastDay: resourceHash.lastDay,
        logoFilename: resourceHash.fnLogo || null,
      },
    };

    this.applyTransforms(modelClass, data.attributes);

    return { data, included: [] };
  }
}
