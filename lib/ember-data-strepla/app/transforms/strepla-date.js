import DS from 'ember-data';

const { Transform } = DS;

export default class extends Transform {
  deserialize(serialized) {
    let time = Date.parse(serialized);
    if (isNaN(time)) {
      throw new Error(`Invalid date: ${serialized}`);
    }

    return new Date(time);
  }
}
