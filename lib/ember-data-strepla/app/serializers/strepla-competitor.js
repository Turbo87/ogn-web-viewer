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
      id: `${resourceHash.competitionId}-${resourceHash.id}`,
      type: modelClass.modelName,
      attributes: {
        name: resourceHash.name,
        country: resourceHash.country,
        type: resourceHash.glider_name,
        registration: resourceHash.glider_callsign,
        callsign: resourceHash.glider_cid,
        handicap: resourceHash.glider_index,
        flarmID: resourceHash.flarm_ID,
        logger1: resourceHash.logger1,
        logger2: resourceHash.logger2,
        logger3: resourceHash.logger3,
        className: resourceHash.className,
      },
      relationships: {
        competition: {
          data: {
            id: resourceHash.competitionId,
            type: 'strepla-competition',
          },
        },
      },
    };

    this.applyTransforms(modelClass, data.attributes);

    return { data, included: [] };
  }
}
