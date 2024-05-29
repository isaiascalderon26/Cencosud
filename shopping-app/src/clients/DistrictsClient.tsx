import { IDates } from '../models/schedules/IDates';
import { IEvents } from '../models/schedules/IEvents';
import { IScheduleBooking } from '../models/schedules/IScheduleBooking';
import { ISchedulingContext } from '../models/schedules/ISchedulesContext';
import { ISlot } from '../models/schedules/ISlot';
import RESTClient, { IArrayRestResponse } from './RESTClient';

interface IConfig {
  baseURL: string
}

/**
 * Client to manage scheadules
 *
 * @class SchedulesClient
 */
class DistricsClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }
  async loadRegions(): Promise<any> {
    const response = await this.axios.get('/districs');
    return response.data;
  }

}

export default new DistricsClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
