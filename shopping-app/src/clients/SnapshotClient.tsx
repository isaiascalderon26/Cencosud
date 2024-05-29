import PouchDB from 'pouchdb';
import WithBootedClient from '../lib/WithBootedClient';
import AuthenticationClient from './AuthenticationClient';
import ISnapshotStack, { SnapshotTypes } from '../models/ISnapshotStack';
import RESTClient from './RESTClient';
import EurekaConsole from '../lib/EurekaConsole';

const eureka = EurekaConsole({ label: "snapshot-client" });

interface IConfig {
  db_name: string,
  baseURL: string
}

class SnapshotClient extends RESTClient implements WithBootedClient {
  private db: PouchDB.Database;

  constructor(config: IConfig) {
    super({ baseURL: config.baseURL });

    this.db = new PouchDB(config.db_name, {
      revs_limit: 1
    })
  }

  async boot() { }


  /**
   * Send snapshots to backend
   * @param snapshots 
   * @returns {Promise<void>}
   * @memberof SnapshotClient
   */
  async sendToCloud(snapshots: Array<ISnapshotStack>): Promise<void> {
    const result = await this.axios.post(`/snapshots/bulk`, snapshots.map((snapshot) => {
      return {
        type: snapshot.type,
        executor: snapshot.executor,
        data: snapshot.data,
        created_at: snapshot.created_at,
      }
    }));
    eureka.info(`snapshots synced to cloud`)

    return result.data;
  }

  /**
   * Take an snapshot from the current time
   * with the data that was passed
   *
   * @param {Task} task Task to make the snapshot
   * @param {string} snapshotLabel The of the snapshot
   * @param {*} snapshot
   * @returns {Promise<ISynchronizationStack>}
   * @memberof SynchronizerClient
   */
  async takeSnapshot(type: SnapshotTypes, snapshot: any): Promise<void> {
    if (!AuthenticationClient.isAuthenticated()) {
      return;
    }

    const { primarysid, unique_name } = AuthenticationClient.getInfo();
    const created_at = new Date();

    const newStack: PouchDB.Core.PutDocument<ISnapshotStack> = {
      _id: `${primarysid}-${created_at.toISOString()}`,
      created_at,
      type: type,
      executor: {
        id: primarysid,
        name: unique_name,
      },
      data: snapshot,
    };
    await (this.db.put<ISnapshotStack>(newStack))

    eureka.debug(`snapshot saved: ${type} labeled`)
  };
}

export default new SnapshotClient({
  db_name: process.env.REACT_APP_POUCHDB_DB_OFFLINE_QUEUE_NAME!,
  baseURL: process.env.REACT_APP_API_ENDPOINT!
});
