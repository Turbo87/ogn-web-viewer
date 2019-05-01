import Component from '@ember/component';

import { FullScreen } from 'ol/control';

export default class extends Component {
  tagName = '';

  map = null;
  control = new FullScreen();

  didInsertElement() {
    super.didInsertElement(...arguments);
    this.map.addControl(this.control);
  }

  willDestroyElement() {
    this.map.removeControl(this.control);
    super.willDestroyElement(...arguments);
  }
}
