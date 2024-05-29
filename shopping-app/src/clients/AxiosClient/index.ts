import axios, {
  AxiosInstance,
  AxiosPromise,
  AxiosRequestConfig,
  Method,
} from 'axios';
import { template } from 'lodash';
import { config } from 'process';
import 'reflect-metadata';
import {
  AXIOS_CLIENT_BASE_URL,
  AXIOS_CLIENT_INSTANCE,
  AXIOS_CLIENT_PARAMETERS,
} from './metadatas';

const getAxiosInstance = (target: any): AxiosInstance => {
  const inst =
    Reflect.getMetadata(AXIOS_CLIENT_INSTANCE, target) ??
    Reflect.getMetadata(AXIOS_CLIENT_INSTANCE, target.constructor);

  if (!inst) {
    throw new Error(`Missing class: ${target.name} metadata`);
  }
  return inst;
};

export type AxiosClientResponse<T> = Promise<T> | void;

export const AxiosClient = (baseURL: string): ClassDecorator => {
  return (target) => {
    const i = axios.create({ baseURL });

    Reflect.defineMetadata(AXIOS_CLIENT_BASE_URL, baseURL, target);
    Reflect.defineMetadata(AXIOS_CLIENT_INSTANCE, i, target);
  };
};

export const UseRequestInterceptor = (
  interceptor: (config: AxiosRequestConfig) => void
): ClassDecorator => {
  return (target) => {
    const i = getAxiosInstance(target);

    i.interceptors.request.use((config) => {
      interceptor(config);
      return config;
    });
  };
};

export interface RequestConfig {
  path?: any;
  params?: Record<string, any>;
  data?: Record<string, any>;
  headers?: Record<string, string>;
}

const DecoratorFactory =
  (method: Method) =>
  <R, T extends RequestConfig = {}>(path: string = '') => {
    return <R, T extends RequestConfig>(
      target: any,
      property: PropertyKey,
      descriptor: TypedPropertyDescriptor<(config: T) => AxiosClientResponse<R>>
    ) => {
      const params = {};
      let pth = path;
      let match;

      while ((match = /\:(\d+)/.exec(pth))) {
        const a = 6;
        //todo handle params
      }

      descriptor.value = async (cfg: T = {} as T) => {
        const i = getAxiosInstance(target);

        let url = path;

        for (const p in params) {
          if (!(p in cfg.path))
            throw new Error(`Missing param: ${p} in route: ${path}`);
        }

        const resp = await i({
          method,
          url,
          data: cfg?.data,
          params: cfg?.params,
          headers: cfg?.headers,
        });

        return resp.data;
      };
    };
  };

export const Get = DecoratorFactory('GET');
export const Put = DecoratorFactory('PUT');
export const Post = DecoratorFactory('POST');
export const Delete = DecoratorFactory('DELETE');
export const Head = DecoratorFactory('HEAD');
