import { helper } from '@ember/component/helper';

/**
 * This helper is roughly similar to the `did-update` render modifier, but
 * does not require an element to run it on. This means it can also be used
 * in situations where the component has no template contents, such as the
 * layer components in this project.
 */
export default helper(function callOnUpdate(params) {
  params[0]();
});
