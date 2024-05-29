import WithBootedClient from '../lib/WithBootedClient';
import RESTClient, { IArrayRestResponse } from './RESTClient';
import { INotification } from '../models/notifications/INotification';
import { INotificationIntentionLog } from '../models/notifications/INotificationLog';

interface IConfig {
  baseURL: string
}

class NotificationClient extends RESTClient implements WithBootedClient {
  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });
  }

  async boot() { }
  
  async getNotifications(filters: { user_id: string }, offset: number, limit: number): Promise<IArrayRestResponse<INotification>> {
    const response = await this.axios.get('/messages', 
      { params: { filters, offset, limit } });
    return response.data;
  }

  async getNotification(id: string): Promise<INotification> {
    const response = await this.axios.get(`/messages/${id}`);
    return response.data;
  }

  async updateNotification(notification: INotification): Promise<INotification> {
    const response = await this.axios.put(`/messages/${notification.id}`, notification);
    return response.data;
  }

  async deleteNotification(notification: INotification): Promise<void> {
    await this.axios.delete(`/messages/${notification.id}`);
  }
  async updateLogNotificationIntention(notification: INotificationIntentionLog): Promise<INotificationIntentionLog> {
    const response = await this.axios.put(`/notification-log/${notification.id}`, notification);
    return response.data;
  }

}

export default new NotificationClient({
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
