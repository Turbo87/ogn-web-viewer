import Component from '@glimmer/component';

import Zoom from 'ol/control/Zoom';

export default class extends Component {
  map = null;
  control = new Zoom();

  constructor() {
    super(...arguments);
    this.args.map.addControl(this.control);
  }

  willDestroy() {
    this.args.map.removeControl(this.control);
    super.willDestroy(...arguments);
  }
}
