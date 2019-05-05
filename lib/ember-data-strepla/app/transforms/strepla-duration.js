import DS from 'ember-data';

const { Transform } = DS;

const RE_DURATION = /^(\d+):([0-5]\d)$/;

/**
 * Parses strings like "02:34" into `154` (2 hours + 34 minutes).
 */
export default class extends Transform {
  deserialize(serialized) {
    if (!serialized) return null;
    if (typeof serialized !== 'string') throw new Error(`Invalid duration: ${serialized}`);

    let match = serialized.match(RE_DURATION);
    if (!match) throw new Error(`Invalid duration: ${serialized}`);

    let hh = parseInt(match[1], 10);
    let mm = parseInt(match[2], 10);
    return hh * 60 + mm;
  }
}
