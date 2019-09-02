//=========== This component provided DWD Rain Radar Overlay
import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

export default class extends Component {
  @service aircraft;
  @service ddb;
  @service filter;
  @service('map') mapService;

  tagName = '';

  @alias('mapService.map') map;

  layer = new TileLayer({
    visible: true,
    source: new TileWMS({
      url: 'https://maps.dwd.de:443/geoserver/dwd/wms',
      params: {
        FORMAT: 'image/png',
        VERSION: '1.1.1',
        tiled: true,
        LAYERS: 'dwd:FX-Produkt',
        exceptions: 'application/vnd.ogc.se_inimage',
        tilesOrigin: -15.074981 + ',' + 34.7373759815055,
      },
      opacity: 1.0,
    }),
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
