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
import VectorLayer from 'ol/layer/Vector';
import { transform, transformExtent } from 'ol/proj';
import OSMSource from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';

import Sockette from 'sockette';

let EPSG_4326 = 'EPSG:4326';
let EPSG_3857 = 'EPSG:3857';

export default {
  name: 'app',

  beforeCreate() {
    this.aircraftSource = new VectorSource({ features: [] });
    this.aircraftStyles = new WeakMap();
    this.shadowStyles = new WeakMap();

    this.map = new olMap({
      interactions: interactionDefaults({
        altShiftDragRotate: false,
        pinchRotate: false,
      }),

      layers: [
        new TileLayer({
          source: new OSMSource(),
        }),
        new VectorLayer({
          source: this.aircraftSource,
          style: (feature, resolution) => this.getAircraftFeatureStyle(feature, resolution),
        }),
        new VectorLayer({
          opacity: 0.2,
          source: this.aircraftSource,
          style: (feature, resolution) => this.getShadowFeatureStyle(feature, resolution),
        }),
      ],

      view: new View({
        center: [750998, 6567417],
        zoom: 7,
      }),
    });

    this.map.on('moveend', () => this.sendBBox());

    this.ws = new Sockette('wss://ogn.fva.cloud/api/live', {
      timeout: 5e3,
      maxAttempts: 10,
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
    this.map.setTarget('map');
  },

  beforeDestroy() {
    this.ws.close();
    this.ws = null;

    this.map.setTarget(null);
  },

  methods: {
    handleMessage(msg) {
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

    getAircraftFeatureStyle(feature) {
      let { course } = feature.getProperties();
      let rotation = course * (Math.PI / 180);

      let style = this.aircraftStyles.get(feature);
      if (style) {
        style.getImage().setRotation(rotation);
      } else {
        style = new Style({
          image: new Icon({
            src: 'https://skylines.aero/images/glider_symbol.svg',
            rotation,
            rotateWithView: true,
          }),
        });

        this.aircraftStyles.set(feature, style);
      }

      return style;
    },

    getShadowFeatureStyle(feature) {
      let { course, altitude } = feature.getProperties();
      let rotation = course * (Math.PI / 180);
      let sin = Math.sin(rotation);
      let cos = Math.cos(rotation);

      let shadowDistance = Math.min(0.2, altitude / 10000);
      let anchor = [0.5 - shadowDistance * sin, 0.5 - shadowDistance * cos];

      let style = this.shadowStyles.get(feature);
      if (style) {
        let icon = style.getImage();
        icon.setRotation(rotation);
        icon.setAnchor(anchor);
      } else {
        style = new Style({
          image: new CustomIcon({
            anchor,
            src: 'https://skylines.aero/images/glider_symbol.png',
            rotation,
            rotateWithView: true,
          }),
        });

        this.shadowStyles.set(feature, style);
      }

      return style;
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

// see https://github.com/openlayers/openlayers/pull/8383
class CustomIcon extends Icon {
  setAnchor(anchor) {
    this.anchor_ = anchor.slice();
    this.normalizedAnchor_ = null;
  }
}

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
