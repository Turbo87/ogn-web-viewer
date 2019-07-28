import Service, { inject as service } from '@ember/service';
import Ember from 'ember';

import { Map, View } from 'ol';
import { Attribution, ScaleLine } from 'ol/control';
import { defaults as interactionDefaults } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import OSMSource from 'ol/source/OSM';
import XYZSource from 'ol/source/XYZ';

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
