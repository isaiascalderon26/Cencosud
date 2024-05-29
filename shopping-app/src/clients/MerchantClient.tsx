import RESTClient, { IArrayRestResponse } from './RESTClient';
// models
import { IMerchant } from '../models/merchants/IMerchant';
import axios from "axios";
import EurekaConsole from "../lib/EurekaConsole";

interface IConfig {
  baseURL: string
}

const eureka = EurekaConsole({ label: "merchant-client" });

/**
 * Client to manage widgets
 *
 * @class MerchantsClient
 */
class MerchantsClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
   * List widgets using params
   * @param placeId placeId placeId
   * @returns {Promise<IArrayRestResponse<IMerchant>>}
   * @memberof WidgetsClient
   */
  async list(placeId: string): Promise<IArrayRestResponse<IMerchant>> {
    const apiKey = process.env.REACT_APP_LAZARILLO_API_KEY;
    const storeUrl = process.env.REACT_APP_LAZARILLO_STORES_URL;

    if (!apiKey || !storeUrl) {
      window.alert("Parámetros de configuración de tiendas indefinidos");
      return {
        data: [],
        offset: 0,
        total: 0,
        limit: 1000
      }
    }

    const url = storeUrl + "/findStoresByMall?token=" + apiKey + "&place_id=" + placeId;
    const response = await axios.get<any[]>(url);
    eureka.log(`${response.data.length} merchants downloaded.`);

    const valids = response.data.filter((item: IMerchant) => item.web !== "https://www.dunkindonuts.com");
    let notValids = response.data.filter((item: IMerchant) => item.web === "https://www.dunkindonuts.com");
    notValids = notValids.map((item: IMerchant) => {
      item.web = "https://dunkin.cl";
      return item;
    });

    return {
      data: [...valids, ...notValids],
      offset: 0,
      total: response.data.length,
      limit: 1000
    }
  }

  async getSites(mallName:string): Promise<IMerchant[]> {
    const response = await this.axios.get<any>(`/merchants?offset=0&limit=8&query=%7B%22store.keyword_is%22:%22${mallName}%22%7D`);
    return response?.data?.data?.map((item: IMerchant) => item as IMerchant) ?? [];
  }
}

export default new MerchantsClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
