import RESTClient, { IArrayRestResponse, IListParams } from './RESTClient';
// models
import { AxiosResponse } from 'axios';
import IVehicle, { ICreateVehicle } from '../models/vehicles/IVehicles';

interface IConfig {
  baseURL: string
}

/**
 * Client to manage vehicles
 * 
 * @class VehiclesClient
 */
class VehicleClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
   * Get Vehicle by id
   * @param id 
   * @returns {Promise<IVehicle>}
   * @memberof VehicleClient
   */
  async getById(id: string): Promise<IVehicle> {
    const response = await this.axios.get(`/vehicles/${id}`);
    return response.data;
  }

  /**
   * List Vehicles using params
   * @param params List params
   * @returns {Promise<IArrayRestResponse<IVehicle>>}
   * @memberof VehicleClient
   */
  async list(params: IListParams): Promise<IArrayRestResponse<IVehicle>> {
    const response = await this.axios.get(`/vehicles`, { params });
    return response.data;
  }

  /**
   * Create a new Vehicle
   * @param data 
   * @returns {Promise<ICreateVehicle>}
   * @memberof VehicleClient
   */
  async create(data: ICreateVehicle): Promise<IVehicle> {
    const response = await this.axios.post('/vehicles', data);
    return response.data;
  }

  async remove(plate: string): Promise<AxiosResponse<any>> {
    const response = await this.axios.delete(`/vehicles/${plate}`);
    return response
  }

}

export default new VehicleClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
