import PouchDB from 'pouchdb';

import RESTClient from './RESTClient';
// lib
import EurekaConsole from '../lib/EurekaConsole';
// models
import IEvent from '../models/events/IEvent';

const eureka = EurekaConsole({ label: "event-client" });

interface IConfig {
  db_name: string,
  baseURL: string
}

/**
 * 
 * @class EventClient
 */
class EventClient extends RESTClient {
  private db: PouchDB.Database;

  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });

    this.db = new PouchDB(config.db_name, {
      revs_limit: 1
    })
  }

  /**
   * Create a new event
   * @param data 
   * @returns {Promise<IEvent>}
   * @memberof EventClient
   */
  async create(data: IEvent): Promise<IEvent> {
    try {
      const created: IEvent = {
        _id: `${new Date().valueOf()}`,
        ...data,
        details: this.overrideDetails(data.type, data.details),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await this.db.put<IEvent>(created);
      eureka.debug(`Event ${data.type} created`);

      return created;
    } catch (error) {
      eureka.error('Unexpected error trying to create an event', error);

      // provide fallback
      return data;
    }
  }

  /**
   * Send events to backend
   * @param events 
   * @returns {Promise<void>}
   * @memberof EventClient
   */
  async sendToCloud(events: Array<IEvent>): Promise<void> {
    const result = await this.axios.post(`/events/bulk`, events);
    eureka.info(`events synced to cloud`)

    return result.data;
  }

  private overrideDetails(event: string, details: Record<string, unknown>): Record<string, unknown> {
    return Object.keys(details).reduce<Record<string, unknown>>((acc, key) => {
      const prefix = event.trim().replace(/\./g, '_');
      acc[`${prefix}_${key}`] = details[key];
      return acc;
    }, {});
  }

}

export default new EventClient({
  db_name: process.env.REACT_APP_POUCHDB_DB_EVENT_NAME!,
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
