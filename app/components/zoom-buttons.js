import Component from '@ember/component';

import Zoom from 'ol/control/Zoom';

export default class extends Component {
  tagName = '';

  map = null;
  control = new Zoom();

  didInsertElement() {
    super.didInsertElement(...arguments);
    this.map.addControl(this.control);
  }

  willDestroyElement() {
    this.map.removeControl(this.control);
    super.willDestroyElement(...arguments);
  }
}
