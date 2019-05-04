import FreestyleController from 'ember-freestyle/controllers/freestyle';

export default class extends FreestyleController {
  components = findUsageComponents();
}

function findUsageComponents() {
  let pathPrefix = 'ogn-web-viewer/templates/components/usage/';

  return Object.keys(window.require.entries)
    .filter(path => path.indexOf(pathPrefix) === 0)
    .map(path => path.slice(pathPrefix.length))
    .sort();
}
