import DS from 'ember-data';

import ajax from 'ember-fetch/ajax';

const { Adapter, NotFoundError, AdapterError, ConflictError, ForbiddenError, ServerError, UnauthorizedError } = DS;

export default class extends Adapter {
  async _request(url) {
    try {
      return await ajax(url);
    } catch (errorResponse) {
      if (errorResponse.status) {
        let error;
        if (errorResponse.status === 401) {
          error = new UnauthorizedError();
        } else if (errorResponse.status === 403) {
          error = new ForbiddenError();
        } else if (errorResponse.status === 404) {
          error = new NotFoundError();
        } else if (errorResponse.status === 409) {
          error = new ConflictError();
        } else if (errorResponse.status >= 500) {
          error = new ServerError();
        }

        error.response = errorResponse;
        throw error;
      }

      throw new AdapterError();
    }
  }
}
