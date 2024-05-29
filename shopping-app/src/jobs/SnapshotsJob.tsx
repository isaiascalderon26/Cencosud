import PouchDB from 'pouchdb';
import Job from '../lib/Job';
import EurekaConsole from '../lib/EurekaConsole';
import SnapshotClient from '../clients/SnapshotClient';
import ISnapshotStack from '../models/ISnapshotStack';
import AuthenticationClient from '../clients/AuthenticationClient';

const eureka = EurekaConsole({ label: "snapshot-job" });

interface IConfig {
  db_name: string
}

class SnapshotJob extends Job {
  private db: PouchDB.Database;

  constructor(config: IConfig) {
    super({
      runEveryInSeconds: 60,
      waitBeforeFirstRunInSeconds: 2
    });

    this.db = new PouchDB(config.db_name);
  }

  /**
   * Synchronize all the remaining data, and clear the snapshot stack
   * @memberof SnapshotJob
   */
  async doTheJob() {
     // If the user hasn't logged yet we cant send to the cloud,
     // because we need the authenticated user to get the JWT
     // for authentication
     if (!AuthenticationClient.isAuthenticated()) {
      return;
    }
    
    const allDocs = await this.db.allDocs({ include_docs: true });

    const snapshotLength = allDocs.rows.length;
    if (snapshotLength > 0) {
      // Send in one package all the snapshot collected by the time
      await SnapshotClient.sendToCloud(allDocs.rows.map((record) => {
        return record.doc as any as ISnapshotStack;
      }));

      for (let index = 0; snapshotLength > index; index++) {
        const snapshot = allDocs.rows[index];
        await this.db.remove(snapshot.id, snapshot.value.rev);
      }

      await this.db.compact();

      eureka.debug(`finished: ${snapshotLength} snapshots uploaded`)
    }
  }
}

export default new SnapshotJob({
  db_name: process.env.REACT_APP_POUCHDB_DB_OFFLINE_QUEUE_NAME!
});
