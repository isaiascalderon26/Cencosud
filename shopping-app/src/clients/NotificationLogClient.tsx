import WithBootedClient from '../lib/WithBootedClient';
import RESTClient, { IArrayRestResponse } from './RESTClient';
import { INotificationIntentionLog } from '../models/notifications/INotificationLog';

interface IConfig {
  baseURL: string
}

class NotificationLogClient extends RESTClient implements WithBootedClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  async boot() { }

  async getNotificationsLog(filters: { id_notification_intention: string }, offset: number, limit: number): Promise<IArrayRestResponse<INotificationIntentionLog>> {
    const response = await this.axios.get('/notification-log', 
      { params: { filters, offset, limit } });
      
    return response.data;
  }
  
  async updateNotificationLog(notification: INotificationIntentionLog): Promise<INotificationIntentionLog> {
    const response = await this.axios.put(`/notification-log/${notification.id}`, notification);
    return response.data;
  }

}

export default new NotificationLogClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
