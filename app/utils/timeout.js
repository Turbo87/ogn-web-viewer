/**
 * Alternative to the `timeout()` function from `ember-concurrency` that
 * does not use the Ember runloop. By not using the Ember runloop it causes
 * it to not block any async tests.
 */
export default async function timeout(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}
