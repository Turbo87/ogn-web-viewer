<template>
  <div id="app">
    <div id="map"></div>
  </div>
</template>

<script>
import 'ol/ol.css';

import { Feature, Map as olMap, View } from 'ol';
import { Point } from 'ol/geom';
import { defaults as interactionDefaults } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import { transform, transformExtent } from 'ol/proj';
import TileJSON from 'ol/source/TileJSON';
import VectorSource from 'ol/source/Vector';
import XYZSource from 'ol/source/XYZ';

import ddbService from './services/ddb';
import ws from './services/ws';
import { AircraftLayer, AircraftShadowLayer } from './layers';

let EPSG_4326 = 'EPSG:4326';
let EPSG_3857 = 'EPSG:3857';

export default {
  name: 'app',

  beforeCreate() {
    this.aircraftSource = new VectorSource({ features: [] });

    this.aircraftLayer = new AircraftLayer({
      source: this.aircraftSource,
    });

    this.map = new olMap({
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

        this.aircraftLayer,

        new AircraftShadowLayer({
          opacity: 0.2,
          maxResolution: 500,
          source: this.aircraftSource,
        }),
      ],

      view: new View({
        center: [750998, 6567417],
        zoom: 7,
      }),
    });

    this.map.on('moveend', () => ws.setBBox(this.getBBox()));
  },

  mounted() {
    ddbService.update();

    ws.start();
    ws.$on('record', this.handleRecord);

    this.map.setTarget('map');
  },

  beforeDestroy() {
    ws.$off('record', this.handleRecord);
    ws.stop();

    this.map.setTarget(null);
  },

  methods: {
    handleRecord(record) {
      let geometry = new Point(transform([record.longitude, record.latitude], EPSG_4326, EPSG_3857));

      let feature = this.aircraftSource.getFeatureById(record.id);
      if (feature) {
        let props = feature.getProperties();
        if (props.timestamp >= record.timestamp) return;

        feature.setGeometry(geometry);
      } else {
        feature = new Feature(geometry);
        feature.setId(record.id);

        this.aircraftSource.addFeature(feature);
      }

      feature.setProperties(record);
    },

    getBBox() {
      let extent = this.map.getView().calculateExtent();
      return transformExtent(extent, EPSG_3857, EPSG_4326);
    },
  },
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
}

html,
body,
#app,
#map {
  width: 100%;
  height: 100%;
}
</style>
