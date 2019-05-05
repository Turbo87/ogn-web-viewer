import DS from 'ember-data';
import fetch from 'fetch';

const { Adapter, NotFoundError, AdapterError, ConflictError, ForbiddenError, ServerError, UnauthorizedError } = DS;

export default class extends Adapter {
  async _request(url) {
    let response = await fetch(url);
    if (response.ok) {
      let json = await response.json();

      // The StrePla API sometimes responds with HTTP code 200, but only returns
      // an object with a `msg` key indicating an error

      if (json.msg) {
        let error;
        if (json.msg.indexOf('check access rights')) {
          error = new ForbiddenError(null, json.msg);
        } else {
          error = new AdapterError(null, json.msg);
        }

        error.response = response;
        throw error;
      }

      return json;
    }

    if (response.status) {
      let error;
      if (response.status === 401) {
        error = new UnauthorizedError();
      } else if (response.status === 403) {
        error = new ForbiddenError();
      } else if (response.status === 404) {
        error = new NotFoundError();
      } else if (response.status === 409) {
        error = new ConflictError();
      } else if (response.status >= 500) {
        error = new ServerError();
      }

      error.response = response;
      throw error;
    }

    throw new AdapterError();
  }
}
