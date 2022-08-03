import axios from 'axios';
const { version } = require('../package.json');

export const DEFAULT_API_URL = 'http://localhost:9112';

//axios.defaults.withCredentials = true;
export type ApiHttpResponse = {
  status: 'ok' | 'failed';
  data?: any;
  error?: string;
};
export enum HttpProtocolMethod {
  'get',
  'post',
  'option',
}
export type HttpRequest = (
  method: string,
  params?: Params,
  type?: HttpProtocolMethod,
) => Promise<any>;

export interface Params {
  [key: string]: any;
}

export class base {
  url: string;
  httpRequest: HttpRequest;

  constructor(baseUrl: string, httpRequest?: HttpRequest) {
    this.url = baseUrl;
    this.httpRequest = httpRequest || this.newHttpRequest();
  }

  newHttpRequest() {
    return async (
      method: string,
      _params: Params = {},
      type: HttpProtocolMethod = HttpProtocolMethod.get,
      cfg: {} = {},
    ) => {
      const baseUrl = this.url;
      const params = { ..._params, version };
      let axiosRes;
      switch (type) {
        case HttpProtocolMethod.get:
          axiosRes = await axios.get(`${baseUrl}/${method}`, {
            params,
            ...cfg,
          });
          break;

        case HttpProtocolMethod.post:
          axiosRes = await axios.post(
            `${baseUrl}/${method}`,
            {
              data: params,
            },
            cfg,
          );
          break;

        default:
          throw new Error(`unsupported HttpRequestType, ${type}`);
      }
      if (axiosRes.status !== 200) {
        throw new Error(`http request fails, ${axiosRes}`);
      }

      const response = axiosRes.data;
      return response;
    };
  }

  async ping() {
    return await this.httpRequest('ping');
  }

  setUrl(newUrl: string) {
    if (newUrl.startsWith('http')) {
      this.url = newUrl;
    } else {
      this.url = `http://${newUrl}`;
    }
  }

  getUrl() {
    return this.url;
  }
}

export class Api extends base {
  constructor(url?: string, httpRequest?: HttpRequest) {
    const newHttpRequest = async (
      method: string,
      params: Object = {},
      type: HttpProtocolMethod = HttpProtocolMethod.get,
    ) => {
      const response: ApiHttpResponse = await super.newHttpRequest()(
        method,
        params,
        type,
      );
      if (response.status === 'failed')
        throw new Error(`httpRequest server error: ${response.error}`);
      return response.data;
    };
    super(url || DEFAULT_API_URL, httpRequest || newHttpRequest);
  }

  async getRoomInfo() {
    return await this.httpRequest('get_room_info', {}, HttpProtocolMethod.get);
  }

  async pollMsg() {
    return await this.httpRequest('poll_msg', {}, HttpProtocolMethod.get);
  }

  async sendMsg() {
    return await this.httpRequest('send_msg', {}, HttpProtocolMethod.get);
  }
}
