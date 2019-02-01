import Service from '@ember/service';
import { inject as service } from '@ember/service';

import { Attribution, FullScreen, ScaleLine, Zoom } from 'ol/control';
import { Map, View } from 'ol';
import { defaults as interactionDefaults } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import TileJSON from 'ol/source/TileJSON';
import XYZSource from 'ol/source/XYZ';

export default Service.extend({
  media: service(),

  _map: null,

  get map() {
    if (!this._map) {
      let controls = [new ScaleLine(), new Attribution()];
      if (!this.media.coarsePointer) {
        controls.push(new Zoom());
      }
      if (!this.media.isStandalone) {
        controls.push(new FullScreen({ source: this.element }));
      }

      this._map = new Map({
        controls,

        interactions: interactionDefaults({
          altShiftDragRotate: false,
          pinchRotate: false,
        }),

        layers: [
          new TileLayer({
            source: new TileJSON({
              opacity: 0.5,
              url: 'https://maps.tilehosting.com/styles/topo.json?key=TT3Oo3SiDCq2wNJ6Rgs9',
              crossOrigin: 'anonymous',
            }),
          }),

          new TileLayer({
            maxResolution: 2500,
            source: new XYZSource({
              url: 'https://skylines.aero/mapproxy/tiles/1.0.0/airspace+airports/{z}/{x}/{y}.png',
            }),
          }),
        ],

        view: new View({
          center: [750998, 6567417],
          zoom: 7,
        }),
      });
    }

    return this._map;
  },
});