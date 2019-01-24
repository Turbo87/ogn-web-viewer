import GeoJSON from 'ol/format/GeoJSON';

const geoJson = new GeoJSON({
  featureProjection: 'EPSG:3857',
});

export default geoJson;
