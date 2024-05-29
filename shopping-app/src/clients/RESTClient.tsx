import axios, { AxiosInstance } from "axios";
import { getAuthFromCache } from "./AuthenticationClient";
import { Storage } from '@capacitor/storage';
import { ILink } from "../models/ILink";

const LOCALIZATION = {
  ACCESS_DENIED: {
    TITLE: "Access Denied",
    MESSAGE: "Your session has expired, and you need to login again (Access Denied)"
  }
};

interface ICONFIG {
  baseURL: string,
}

export interface IListParams {
  query?: Record<string, any>;
  offset?: number;
  limit?: number;
  sort?: Record<string, 'asc' | 'desc'>;
}

export interface IArrayRestResponse<TType> {
  data: Array<TType>,
  offset: number,
  limit: number,
  total: number,
  links?: Array<ILink>
}

export default class RESTClient {
  protected axios: AxiosInstance;
  protected baseUrl: string;

  constructor(config: ICONFIG) {
    const { baseURL } = config;
    this.baseUrl = baseURL;
    this.axios = axios.create({ baseURL });

    // Enable Mock for Axios
    /*
    Expr.whenTestMode(() => {
      const mocksAdapter = require('./../mocks').default;
      mocksAdapter(this.axios);
    })
    */

    this.axios.interceptors.request.use(
      async (config) => {
        const auth = await getAuthFromCache();
        const jwt = auth.user;
        config.headers["Authorization"] = `${jwt.token_type.toLowerCase()} ${jwt.access_token}`;

        return config;
      },
      error => {
        throw error;
      }
    );

    // Add a 401 response interceptor
    this.axios.interceptors.response.use(response => response, function (error) {
      if (!error.response) {
        throw error;
      }

      switch (error.response.status) {
        case 401:
          Storage.remove({ key: "@user" })
          //localStorage.removeItem();
          // TODO: Hide the alert because in android could not reload the pag
          window.location.reload();
          // alert(LOCALIZATION.ACCESS_DENIED.MESSAGE)
          throw error;
        case 403:
          throw error;
        default:
          throw error;
      }
    });
  }
}
