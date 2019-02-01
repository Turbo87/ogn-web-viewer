import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';

import { Feature } from 'ol';
import { LineString } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Style, Stroke, Fill } from 'ol/style';

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
  mapService: service('map'),

  tagName: '',

  task: null,

  map: alias('mapService.map'),

  source: computed('task', function() {
    let taskSource = new VectorSource({ features: [] });

    if (this.task) {
      let legsFeature = new Feature({
        geometry: new LineString(this.task.points.map(pt => transform(pt.shape.center, EPSG_4326, EPSG_3857))),
      });
      legsFeature.setId('legs');
      taskSource.addFeature(legsFeature);

      let areas = this.task.points.map(pt => GeoJSON.readFeature(pt.shape.toGeoJSON()));
      taskSource.addFeatures(areas);
    }

    return taskSource;
  }),

  didInsertElement() {
    this._super(...arguments);

    this.set(
      'layer',
      new VectorLayer({
        source: this.source,
        style(feature) {
          let id = feature.getId();
          return id === 'legs' ? TASK_LEGS_STYLE : TASK_AREA_STYLE;
        },
      }),
    );

    this.map.addLayer(this.layer);
  },

  didUpdateAttrs() {
    this._super(...arguments);
    this.layer.setSource(this.source);
  },

  willDestroyElement() {
    this.map.removeLayer(this.layer);
    this._super(...arguments);
  },
});
