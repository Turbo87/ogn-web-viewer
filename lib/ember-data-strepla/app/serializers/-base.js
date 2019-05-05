import DS from 'ember-data';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';

const { Serializer } = DS;

export default class extends Serializer {
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
