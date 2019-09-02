import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';




export default class extends Component {
  @service aircraft;
  @service ddb;
  @service filter;
  @service('map') mapService;

  tagName = '';

  @alias('mapService.map') map;

  layer = new VectorLayer({
    source: this.aircraft.source,
    style: (...args) => this._getFeatureStyle(...args),
  });

  didInsertElement() {
    super.didInsertElement(...arguments);
    this.map.addLayer(this.layer);
  }

  willDestroyElement() {
    this.map.removeLayer(this.layer);
    super.willDestroyElement(...arguments);
  }

}
