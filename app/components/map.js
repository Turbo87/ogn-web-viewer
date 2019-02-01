import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

import { Feature, Map as olMap, View } from 'ol';
import { scaleFromCenter } from 'ol/extent';
import { Point, LineString } from 'ol/geom';
import { defaults as interactionDefaults } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { transform, transformExtent } from 'ol/proj';
import TileJSON from 'ol/source/TileJSON';
import VectorSource from 'ol/source/Vector';
import XYZSource from 'ol/source/XYZ';
import { Style, Stroke, Fill } from 'ol/style';
import { defaults as defaultControls, ScaleLine, FullScreen } from 'ol/control.js';

import { AircraftLayer, AircraftShadowLayer } from '../layers';
import GeoJSON from '../geojson-converter';

const EPSG_4326 = 'EPSG:4326';
const EPSG_3857 = 'EPSG:3857';

const TASK_LEGS_STYLE = new Style({
  stroke: new Stroke({
    color: '#5590ff',
    width: 3,
  }),
});

const TASK_AREA_STYLE = new Style({
  stroke: new Stroke({
    color: '#5590ff',
    width: 3,
  }),
  fill: new Fill({
    color: '#5590ff22',
  }),
});

export default Component.extend({
  media: service(),
  ddb: service(),
  filter: service(),
  history: service(),
  ws: service(),

  tagName: '',

  hasDeviceFilter: alias('filter.hasFilter'),

  didInsertElement() {
    this._super(...arguments);

    this.aircraftSource = new VectorSource({ features: [] });
    this.taskSource = new VectorSource({ features: [] });

    this.aircraftLayer = new AircraftLayer({
      ddbService: this.ddb,
      deviceFilter: this.filter,

      source: this.aircraftSource,
    });

    let controls = defaultControls();
    controls.push(new ScaleLine());
    if (!this.media.isStandalone) {
      controls.push(new FullScreen({ source: this.element }));
    }

    this.map = new olMap({
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

        new VectorLayer({
          source: this.taskSource,
          style(feature) {
            let id = feature.getId();
            return id === 'legs' ? TASK_LEGS_STYLE : TASK_AREA_STYLE;
          },
        }),

        this.aircraftLayer,

        new AircraftShadowLayer({
          ddbService: this.ddb,

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

    this.map.on('moveend', () => {
      if (!this.filter.hasFilter) {
        this.ws.setBBox(this.getBBox());
      }
    });

    if (this.filter.hasFilter) {
      for (let row of this.filter.filter) {
        this.ws.subscribeToId(row.ID);
      }

      this.history.loadForIds(...this.filter.filter.map(row => row.ID));
    }

    this.map.setTarget('map');

    if (this.task) {
      let legsFeature = new Feature({
        geometry: new LineString(this.task.points.map(pt => transform(pt.shape.center, EPSG_4326, EPSG_3857))),
      });
      legsFeature.setId('legs');

      let areas = this.task.points.map(pt => GeoJSON.readFeature(pt.shape.toGeoJSON()));

      this.taskSource.addFeature(legsFeature);
      this.taskSource.addFeatures(areas);

      // zoom map in on the task area
      let bbox = this.task.bbox.slice();
      scaleFromCenter(bbox, 0.3);
      let extent = transformExtent(bbox, EPSG_4326, EPSG_3857);

      this.map.getView().fit(extent);
    }

    this.ddb.update();

    this.ws.start();
    this.ws.on('record', this, 'handleRecord');
  },

  willDestroyElement() {
    this.ws.off('record', this, 'handleRecord');
    this.ws.stop();

    this.map.setTarget(null);

    this._super(...arguments);
  },

  handleRecord(record) {
    if (this.filter.hasFilter) {
      this.history.addRecords(record.id, [
        {
          time: record.timestamp * 1000,
          coordinate: [record.longitude, record.latitude],
          valid: true,
          altitude: record.altitude,
        },
      ]);
    }

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
});
