import { assert } from '@ember/debug';

import BaseSerializer from './-base';

export default class extends BaseSerializer {
  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    assert(`Unknown \`requestType\`: ${requestType}`, ['query'].indexOf(requestType) !== -1);

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
      id: resourceHash.idCD,
      type: modelClass.modelName,
      attributes: {
        date: resourceHash.date,
        className: resourceHash.nameCC,
        state: resourceHash.state,
        stateDescription: resourceHash.sState,
      },
      relationships: {
        class: {
          data: {
            id: resourceHash.idCC,
            type: 'strepla-competition-class',
          },
        },
      },
    };

    if ('competitionId' in resourceHash) {
      data.relationships.competition = {
        data: {
          id: resourceHash.competitionId,
          type: 'strepla-competition',
        },
      };
    }

    this.applyTransforms(modelClass, data.attributes);

    return { data, included: [] };
  }
}
