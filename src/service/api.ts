import axios from 'axios';
import { Base64Str, HexNum, Utf8Str } from 'types';
import { Buffer } from 'buffer';
const { version } = require('../../package.json');

export const DEFAULT_API_URL = 'http://accu.cc:8080';
export const DEFAULT_WS_API_URL = 'ws://accu.cc:8080/ws';

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

export interface Envelop {
  AESIV: string;
  AESKey: string;
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
      return response;
    };
    super(url || DEFAULT_API_URL, httpRequest || newHttpRequest);
  }

  async getAesEnvelop(rsaPublicKey: Base64Str): Promise<Envelop | null> {
    return await this.httpRequest(
      'getAesEnvelop',
      {
        rsaPublicKey,
      },
      HttpProtocolMethod.get,
    );
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

export interface WsApiHandler {
  onMsgHandler?: (msg: any) => any;
  onOpenHandler?: () => any;
}

export class WsApi {
  private ws: WebSocket;

  constructor(url?: string, wsHandler?: WsApiHandler) {
    this.ws = new WebSocket(url || DEFAULT_WS_API_URL);

    this.ws.onopen = wsHandler?.onOpenHandler || this.handleOpen;
    this.ws.onmessage = wsHandler?.onMsgHandler || this.handleMessage;
    this.ws.onerror = this.handleError;
    this.ws.onclose = this.handleClose;
  }

  isConnected() {
    if (this.ws == null) return false;

    if (this.ws.readyState === WebSocket.OPEN) {
      return true;
    } else {
      return false;
    }
  }

  async _send(data: string | ArrayBuffer) {
    if (this.ws.readyState === WebSocket.OPEN) {
      await this.ws.send(data);
    } else {
      console.log('ws not open, abort send msg..');
    }
  }

  handleClose(event: any, callBack?: any) {
    console.log('ws close!', event);
    if (callBack) {
      callBack();
    }
  }

  handleOpen(event: any) {
    console.log('ws connected!', event);
  }

  handleError(event: any) {
    console.error('error =>', event);
    if (this.ws) {
      this.ws.close();
    }
  }

  handleMessage(event: any, callback?: (msg: any) => any) {
    const msg = event.data;
    console.log('msg received =>', msg);
    if (callback != null) {
      callback(msg);
    }
  }

  async sendMsg(userId: number, msg: Utf8Str) {
    const msgBuf = encodeMsg(userId, msg);
    await this._send(msgBuf);
  }

  async sendSimpleMsg(userId: number | string, msg: Utf8Str) {
    const data = encodeSimpleMsg(userId, msg);
    await this._send(data);
  }
}

export function encodeSimpleMsg(userId: number | string, msg: Utf8Str): string {
  return `${userId}:${msg}`;
}

export function decodeSimpleMsg(msg: string) {
  const value = msg.split(':');
  if (value.length < 2) {
    throw new Error('decode simple msg failed..');
  }
  return {
    userId: value[0],
    msg: value[1],
  };
}

export function encodeMsg(userId: number, msg: Utf8Str): Buffer {
  const msgBytes = utf8StrToBuffer(msg);
  const msgSize = u32ToLEBuffer(msgBytes.length);
  const id = u32ToLEBuffer(userId);
  return Buffer.concat([id, msgSize, msgBytes]);
}

export function decodeMsg(msgInfo: Buffer) {
  const userIdBuf = msgInfo.slice(0, 4);
  const msgSizeBuf = msgInfo.slice(4, 8);
  const msgBuf = msgInfo.slice(8);

  const userIdNumber = LEBufferToU32(userIdBuf);
  const msg = bufferToUtf8Str(msgBuf);
  const msgSize = LEBufferToU32(msgSizeBuf);
  return {
    userId: userIdNumber,
    msgSize,
    msg,
  };
}

export function u32ToLEBuffer(u32: number): Buffer {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(u32);
  return buf;
}

export function LEBufferToU32(buf: Buffer): number {
  const value = buf.readUInt32LE();
  return value;
}

export function utf8StrToBuffer(msg: Utf8Str): Buffer {
  const encoder = new TextEncoder();
  var uint8array = encoder.encode(msg);
  return Buffer.from(uint8array);
}

export function bufferToUtf8Str(buf: Buffer) {
  const decoder = new TextDecoder();
  const string = decoder.decode(buf);
  return string;
}
