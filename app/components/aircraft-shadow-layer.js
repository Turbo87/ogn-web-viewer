import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import VectorLayer from 'ol/layer/Vector';
import { Icon, Style } from 'ol/style';

import { imageSrcForDevice } from './aircraft-layer';

export default class extends Component {
  @service aircraft;
  @service ddb;
  @service filter;
  @service('map') mapService;

  @alias('mapService.map') map;

  _iconStyles = new WeakMap();

  layer = new VectorLayer({
    source: this.aircraft.source,
    opacity: 0.2,
    maxResolution: 500,
    style: (...args) => this._getFeatureStyle(...args),
  });

  constructor() {
    super(...arguments);
    this.map.addLayer(this.layer);
  }

  willDestroy() {
    this.map.removeLayer(this.layer);
    super.willDestroy();
  }

  _getFeatureStyle(feature) {
    let { id } = feature.getProperties();
    let device = this.ddb.devices[id] || {};

    let filterRow = this.filter.filter.find(row => row.id === id) || {};
    let hasFilter = this.filter.filter.length !== 0;
    let isFiltered = hasFilter && !filterRow.id;

    if (isFiltered) {
      return [];
    }

    let imageSrc = imageSrcForDevice(device);

    let style = this._iconStyles.get(feature);
    if (!style || style.getImage().getSrc() !== imageSrc) {
      style = new Style({
        image: new Icon({
          src: imageSrc,
          rotateWithView: true,
        }),
      });

      this._iconStyles.set(feature, style);
    }

    let { course, altitude } = feature.getProperties();

    let rotation = course * (Math.PI / 180);
    let sin = Math.sin(rotation);
    let cos = Math.cos(rotation);

    let shadowDistance = Math.min(0.2, altitude / 10000);
    let anchor = [0.5 - shadowDistance * sin, 0.5 - shadowDistance * cos];

    let icon = style.getImage();
    icon.setRotation(rotation);
    icon.setAnchor(anchor);

    return style;
  }
}
