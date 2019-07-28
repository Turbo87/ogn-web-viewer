import Service, { inject as service } from '@ember/service';
import Ember from 'ember';

import { Map, View } from 'ol';
import { Attribution, ScaleLine } from 'ol/control';
import { defaults as interactionDefaults } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import OSMSource from 'ol/source/OSM';
import XYZSource from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';

export default class extends Service {
  @service media;

  _map = null;

  get map() {
    if (!this._map) {
      let controls = [new ScaleLine(), new Attribution()];

      let layers = [];
      if (!Ember.testing) {
        layers = [
          new TileLayer({
            opacity: 0.5,
            source: new OSMSource({
              crossOrigin: 'anonymous',
            }),
          }),

          //=========== DWD SAT Image Overlay
          new TileLayer({
             visible: true,
             source: new TileWMS({
             url: 'https://maps.dwd.de:443/geoserver/dwd/wms',
             params: {'FORMAT': 'image/png',
                   'VERSION': '1.1.1',
                    tiled: true,
                    "LAYERS": 'dwd:SAT_WELT_KOMPOSIT',
                    "exceptions": 'application/vnd.ogc.se_inimage',
                    tilesOrigin: -15.074981 + "," + 34.7373759815055
                    },
             opacity: 0.5,
             attributions: ['Source <a href="https://www.dwd.de">Deutscher Wetterdienst</a>',],
             }),
          }),

          //=========== DWD Rain Radar Overlay
          new TileLayer({
             visible: true,
             source: new TileWMS({
             url: 'https://maps.dwd.de:443/geoserver/dwd/wms',
             params: {'FORMAT': 'image/png',
                   'VERSION': '1.1.1',
                    tiled: true,
                    "LAYERS": 'dwd:FX-Produkt',
                    "exceptions": 'application/vnd.ogc.se_inimage',
                    tilesOrigin: -15.074981 + "," + 34.7373759815055
                    },
             opacity: 1.0,
             }),
          }),

          //=========== Airspace Layer from skylines
          new TileLayer({
            maxResolution: 2500,
            source: new XYZSource({
              url: 'https://skylines.aero/mapproxy/tiles/1.0.0/airspace+airports/EPSG3857/{z}/{x}/{y}.png',
            }),
          }),
        ];
      }

      this._map = new Map({
        controls,
        keyboardEventTarget: document,
        interactions: interactionDefaults({
          altShiftDragRotate: false,
          pinchRotate: false,
        }),

        layers,

        view: new View({
          center: [750998, 6567417],
          zoom: 7,
        }),
      });
    }

    return this._map;
  }
}
