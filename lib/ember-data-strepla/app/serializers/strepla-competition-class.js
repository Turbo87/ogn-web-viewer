import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import DS from 'ember-data';

const { Serializer } = DS;

export default class extends Serializer {
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
      id: resourceHash.id,
      type: modelClass.modelName,
      attributes: {
        name: resourceHash.name,
        ruleName: resourceHash.rulename,
      },
    };

    this.applyTransforms(modelClass, data.attributes);

    return { data, included: [] };
  }

  applyTransforms(typeClass, data) {
    let attributes = typeClass.attributes;

    typeClass.eachTransformedAttribute((key, typeClass) => {
      if (data[key] !== undefined) {
        let transform = this.transformFor(typeClass);
        let transformMeta = attributes.get(key);
        data[key] = transform.deserialize(data[key], transformMeta.options);
      }
    });

    return data;
  }

  transformFor(attributeType) {
    let transform = getOwner(this).lookup(`transform:${attributeType}`);

    assert(`Unable to find the transform for \`attr('${attributeType}')\``, transform);

    return transform;
  }
}
