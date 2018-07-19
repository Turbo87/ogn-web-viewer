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

import Sockette from 'sockette';

import ddbService from './services/ddb';
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

    this.map.on('moveend', () => this.sendBBox());

    this.ws = new Sockette('wss://ogn.fva.cloud/api/live', {
      onopen: e => {
        console.log('Connected!', e);
        this.sendBBox();
      },
      onmessage: e => this.handleMessage(e.data),
      onreconnect: e => console.log('Reconnecting...', e),
      onmaximum: e => console.log('Stop Attempting!', e),
      onclose: e => console.log('Closed!', e),
      onerror: e => console.log('Error:', e),
    });
  },

  mounted() {
    ddbService.update();

    this.map.setTarget('map');
  },

  beforeDestroy() {
    this.ws.close();
    this.ws = null;

    this.map.setTarget(null);
  },

  methods: {
    handleMessage(msg) {
      for (let line of msg.split('\n')) {
        this.handleRecordMessage(line);
      }
    },

    handleRecordMessage(msg) {
      let record = parseMessage(msg);

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

    sendBBox() {
      if (!this.ws) return;

      let extent = this.map.getView().calculateExtent();
      let command = ['bbox', ...transformExtent(extent, EPSG_3857, EPSG_4326)].join('|');

      try {
        this.ws.send(command);
      } catch (e) {
        // ignore
      }
    },
  },
};

function parseMessage(message) {
  var fields = message.split('|');

  return {
    id: fields[0],
    timestamp: parseInt(fields[1], 10),
    longitude: parseFloat(fields[2]),
    latitude: parseFloat(fields[3]),
    course: parseInt(fields[4], 10),
    altitude: parseInt(fields[5], 10),
  };
}
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
