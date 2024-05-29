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
class SchedulesClient extends RESTClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  /**
   * Create a new ScheduleBooking
   * @param data 
   * @returns {Promise<IScheduleBooking>}
   * @memberof SchedulesClient
   */
  async create(data: IScheduleBooking): Promise<IScheduleBooking> {
    const response = await this.axios.post('/schedules-booking', data);
    return response.data;
  }

  /**
   * Allow update partialy ScheduleBookings Object
   * @param data 
   * @returns {Promise<IScheduleBooking>}
   * @memberof SchedulesClient
   */
    async updatePartial(id: string, data: Partial<IScheduleBooking>): Promise<IScheduleBooking> {
      const response = await this.axios.patch(`/schedules-booking/${id}`, data);
      return response.data;
    }

  /**
  * List ScheduleBookings using params
  * @param params
  * @returns {Promise<IArrayRestResponse<IScheduleBooking>> | error }
  * @memberof SchedulesClient
  */
  async listScheduleBookings(params: Record<string, unknown>): Promise<IArrayRestResponse<IScheduleBooking>> {
    const response = await this.axios.get('/schedules-booking', { params } );
    return response.data;
  }

  /**
   * Get ScheduleBookings by id
   * @param id
   * @returns @returns {Promise<IArrayRestResponse<IScheduleBooking>> | error }
   * @memberof SchedulesClient
   */
  async getScheduleBookingById(id: string): Promise<IArrayRestResponse<IScheduleBooking>> {
    const response = await this.axios.get(`/schedules-booking/${id}`);
    return response.data;
  }

  /**
   * Patch ScheduleBookings by id and data
   * @param id
   * @returns @returns {Promise<IScheduleBooking> | error }
   * @memberof SchedulesClient
   */
  async updateScheduleBooking(data: IScheduleBooking): Promise<IScheduleBooking> {
    const response = await this.axios.patch(`/schedules-booking/${data.id}`, data);
    return response.data;
  }

  /**
   * Get Schedules-Context by id
   * @param id
   * @returns {Promise<ISchedulingContext>}
   * @memberof SchedulesClient
   */
  async getById(id: string): Promise<ISchedulingContext> {
    const response = await this.axios.get(`/schedules-context/${id}`);
    return response.data;
  }
  /**
   * Get Schedules-Context by params
   * @param params 
   * @returns {Promise<ISchedulingContext>}
   * @memberof SchedulesClient
   */
  async listSchedulesContext(params: Record<string, unknown>): Promise<IArrayRestResponse<ISchedulingContext>> {
    const response = await this.axios.get(`/schedules-context/`, { params });
    return response.data;
  }

  /**
  * list dates using params
  * @param params
  * @returns {Promise<IArrayRestResponse<IDates>> | error }
  * @memberof SchedulesClient
  */
  async getContextDates(params: Record<string, any>): Promise<IArrayRestResponse<IDates>> { 
    const response = await this.axios.get('/schedules-context/dates', { params } );
    return response.data;
  }

  /**
  * list slots using params
  * @param params
  * @returns {Promise<IArrayRestResponse<ISlot>> | error }
  * @memberof SchedulesClient
  */
  async getSlots(params: Record<string, any>): Promise<IArrayRestResponse<ISlot>> { 
    const response = await this.axios.get('/schedules-context/slots', { params } );
    return response.data;
  }

  /**
  * list events using params
  * @param params
  * @returns {Promise<IArrayRestResponse<IEvents>> | error }
  * @memberof SchedulesClient
  */

  async getEvents(params: Record<string, any>): Promise<IArrayRestResponse<IEvents>> {
    const response = await this.axios.get('/schedules-context/events', { params } );
    return response.data;
  }

}

export default new SchedulesClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT_SCHEDULING_CONTEXT!
});
