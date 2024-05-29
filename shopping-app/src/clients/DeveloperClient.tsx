import PouchDB from 'pouchdb';
import { IPaymentMetadataPushNotification } from '../jobs/PushNotificationsJob';
import EventStreamer from '../lib/EventStreamer';
import WithBootedClient from '../lib/WithBootedClient';
import SettingsClient from './SettingsClient';

interface IConfig {
  task_db_name: string,
  queue_db_name: string
}
class DeveloperClient extends WithBootedClient {
  private config: IConfig;

  constructor(config: IConfig) {
    super();
    this.config = config;
  }

  async boot(): Promise<void> { }

  async wipeOutData(): Promise<Boolean> {
    await SettingsClient.remove("FIRST_TIME");

    const { task_db_name, queue_db_name } = this.config;

    const db_task = new PouchDB(task_db_name);
    await db_task.destroy();

    const db_queue = new PouchDB(queue_db_name);
    await db_queue.destroy();

    return true;
  }
}

export default new DeveloperClient({
  task_db_name: process.env.REACT_APP_POUCHDB_DB_TASK_NAME!,
  queue_db_name: process.env.REACT_APP_POUCHDB_DB_OFFLINE_QUEUE_NAME!
});
