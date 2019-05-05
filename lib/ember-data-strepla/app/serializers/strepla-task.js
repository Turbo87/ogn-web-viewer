import { assert } from '@ember/debug';

import BaseSerializer from './-base';

export default class extends BaseSerializer {
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    assert(`Unknown \`requestType\`: ${requestType}`, ['queryRecord'].indexOf(requestType) !== -1);

    return this.normalize(primaryModelClass, payload);
  }

  normalize(modelClass, resourceHash) {
    let data = {
      id: resourceHash.id,
      type: modelClass.modelName,
      attributes: {
        name: resourceHash.name,
        distance: resourceHash.distance,
        numLegs: resourceHash.numLegs,
        ruleName: resourceHash.rule,
        turnpoints: resourceHash.tps,
      },
      relationships: {
        competition: {
          data: {
            id: resourceHash.competitionId,
            type: 'strepla-competition',
          },
        },
        competitionDay: {
          data: {
            id: resourceHash.competitionDayId,
            type: 'strepla-competition-day',
          },
        },
      },
    };

    this.applyTransforms(modelClass, data.attributes);

    return { data, included: [] };
  }
}
