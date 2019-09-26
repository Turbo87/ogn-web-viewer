import Component from '@glimmer/component';

import { FullScreen } from 'ol/control';

export default class extends Component {
  map = null;
  control = new FullScreen();

  constructor() {
    super(...arguments);
    this.args.map.addControl(this.control);
  }

  willDestroy() {
    this.args.map.removeControl(this.control);
    super.willDestroy();
  }
}
