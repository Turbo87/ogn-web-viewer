import Component from '@ember/component';

import Zoom from 'ol/control/Zoom';

export default Component.extend({
  tagName: '',

  map: null,

  init() {
    this._super(...arguments);
    this.control = new Zoom();
  },

  didInsertElement() {
    this._super(...arguments);
    this.map.addControl(this.control);
  },

  willDestroyElement() {
    this.map.removeControl(this.control);
    this._super(...arguments);
  },
});
