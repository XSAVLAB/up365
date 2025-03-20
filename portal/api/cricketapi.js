import { defaults } from "request-promise";

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
    this.rq = defaults({
      json: true,
    });
  }

  async get(params, cb) {
    params.data.token = this.api_token;
    try {
      return await this.rq
        .get({
          url: this.base_url + params.url,
          qs: params.data,
        });
    } catch (err) {
      return normalizeError(err);
    }
  }

  async update(params, cb) {
    try {
      return await this.rq
        .get({
          url: this.base_url + params.url,
          qs: params.data,
        });
    } catch (err) {
      return normalizeError(err);
    }
  }
}

class Entity_cricket {
  constructor(options) {
    let { api_token, token_expires } = options;

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
    Object.assign(this, {
      cricket: require("./get_all_functions.js")(this.api),
    });
  }
}

export default Entity_cricket;
