import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

import { Feature } from 'ol';
import { scaleFromCenter } from 'ol/extent';
import { Point, LineString } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { transform, transformExtent } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Style, Stroke, Fill } from 'ol/style';

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
  ddb: service(),
  filter: service(),
  history: service(),
  ws: service(),
  mapService: service('map'),

  tagName: '',

  hasDeviceFilter: alias('filter.hasFilter'),
  map: alias('mapService.map'),

  didInsertElement() {
    this._super(...arguments);

    this.aircraftSource = new VectorSource({ features: [] });

    this.aircraftLayer = new AircraftLayer({
      ddbService: this.ddb,
      deviceFilter: this.filter,

      source: this.aircraftSource,
    });

    this.map.addLayer(this.aircraftLayer);

    this.map.addLayer(
      new AircraftShadowLayer({
        ddbService: this.ddb,

        opacity: 0.2,
        maxResolution: 500,
        source: this.aircraftSource,
      }),
    );

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
      let taskSource = new VectorSource({ features: [] });

      let legsFeature = new Feature({
        geometry: new LineString(this.task.points.map(pt => transform(pt.shape.center, EPSG_4326, EPSG_3857))),
      });
      legsFeature.setId('legs');

      let areas = this.task.points.map(pt => GeoJSON.readFeature(pt.shape.toGeoJSON()));

      taskSource.addFeature(legsFeature);
      taskSource.addFeatures(areas);

      // zoom map in on the task area
      let bbox = this.task.bbox.slice();
      scaleFromCenter(bbox, 0.3);
      let extent = transformExtent(bbox, EPSG_4326, EPSG_3857);

      this.map.getView().fit(extent);

      this.map.addLayer(
        new VectorLayer({
          source: taskSource,
          style(feature) {
            let id = feature.getId();
            return id === 'legs' ? TASK_LEGS_STYLE : TASK_AREA_STYLE;
          },
        }),
      );
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
