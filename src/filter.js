import axios from 'axios';
import neatCSV from 'neat-csv';

export async function loadFilter(url) {
  // TODO we should find a better solution for this...
  let response = await axios(`https://cors-anywhere.herokuapp.com/${url}`, {
    responseType: 'text',
  });

  let data = await neatCSV(response.data);

  return data.map(row => ({
    ...row,
    HANDICAP: parseFloat(row.HANDICAP),
  }));
}
