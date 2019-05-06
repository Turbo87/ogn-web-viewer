import Service from '@ember/service';
import { inject as service } from '@ember/service';

import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';

const EPSG_4326 = 'EPSG:4326';
const EPSG_3857 = 'EPSG:3857';

export default class extends Service {
  @service ws;

  source = new VectorSource({ features: [] });

  init() {
    super.init(...arguments);
    this.ws.on('record', this, 'handleRecord');
  }

  willDestroy() {
    this.ws.off('record', this, 'handleRecord');
    super.willDestroy(...arguments);
  }

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
  }
}
