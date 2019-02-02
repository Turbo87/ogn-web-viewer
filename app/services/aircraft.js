import Service from '@ember/service';
import { inject as service } from '@ember/service';

import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import Point from 'ol/geom/Point';
import { transform } from 'ol/proj';

const EPSG_4326 = 'EPSG:4326';
const EPSG_3857 = 'EPSG:3857';

export default Service.extend({
  ws: service(),

  source: null,

  init() {
    this._super(...arguments);
    this.set('source', new VectorSource({ features: [] }));
    this.ws.on('record', this, 'handleRecord');
  },

  willDestroy() {
    this.ws.off('record', this, 'handleRecord');
    this._super(...arguments);
  },

  handleRecord(record) {
    let geometry = new Point(transform([record.longitude, record.latitude], EPSG_4326, EPSG_3857));

    let feature = this.source.getFeatureById(record.id);
    if (feature) {
      let props = feature.getProperties();
      if (props.timestamp >= record.timestamp) return;

      feature.setGeometry(geometry);
    } else {
      feature = new Feature(geometry);
      feature.setId(record.id);

      this.source.addFeature(feature);
    }

    feature.setProperties(record);
  },
});
