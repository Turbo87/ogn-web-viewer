import axios from 'axios';

class DDBService {
  constructor() {
    this.devices = {};
  }

  async update() {
    let response = await axios(`${process.env.VUE_APP_API_HOST}/api/ddb`);
    this.devices = response.data;
  }
}

let service = new DDBService();

export default service;
