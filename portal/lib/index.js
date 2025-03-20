import request from "request-promise";
import getAllFunctions from "./get_all_functions.js";

function normalizeError(err) {
  throw {
    statusCode: err.statusCode,
    error: err.error.error,
  };
}

class API {
  constructor(options) {
    this.base_url = "https://rest.entitysport.com/v2/";
    this.api_token = options.api_token;
    this.rq = request.defaults({ json: true });
  }

  async get(params) {
    params.data.token = this.api_token;
    try {
      const response = await this.rq({
        uri: this.base_url + params.url,
        qs: params.data,
        json: true,
      });
      return response;
    } catch (err) {
      normalizeError(err);
    }
  }

  async update(params) {
    try {
      const response = await this.rq({
        uri: this.base_url + params.url,
        qs: params.data,
        json: true,
      });
      return response;
    } catch (err) {
      normalizeError(err);
    }
  }
}

class EntityCricket {
  constructor(options) {
    const { api_token, token_expires } = options;

    if (!api_token) {
      throw new Error("`api_token` is mandatory");
    }

    if (!token_expires || token_expires < Math.floor(Date.now() / 1000)) {
      throw new Error("`token_expires` is mandatory/expired");
    }

    this.api = new API(options);
    this.addResources();
  }

  addResources() {
    this.cricket = getAllFunctions(this.api);
  }
}

export default EntityCricket;
