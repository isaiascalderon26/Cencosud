import PouchDB from 'pouchdb';

// lib
import Job from '../lib/Job';
import EurekaConsole from '../lib/EurekaConsole';
// clients
import EventClient from '../clients/EventClient';
// models
import IEvent from '../models/events/IEvent';

const eureka = EurekaConsole({ label: "event-job" });

interface IConfig {
  db_name: string
}

class EventJob extends Job {
  private db: PouchDB.Database;

  constructor(config: IConfig) {
    super({
      runEveryInSeconds: 2,
      waitBeforeFirstRunInSeconds: 1
    });

    this.db = new PouchDB(config.db_name);
  }

  /**
   * Synchronize all the remaining events, and clear the events stack
   * @memberof EventJob
   */
  async doTheJob() {
    const allDocs = await this.db.allDocs({ include_docs: true });

    const eventsLength = allDocs.rows.length;
    if (eventsLength > 0) {
      // Send in one package all the events collected by the time
      await EventClient.sendToCloud(allDocs.rows.map((record) => {
        return record.doc as any as IEvent;
      }));

      for (let index = 0; eventsLength > index; index++) {
        const event = allDocs.rows[index];
        await this.db.remove(event.id, event.value.rev);
      }

      await this.db.compact();

      eureka.debug(`finished: ${eventsLength} events uploaded`)
    }
  }
}

export default new EventJob({
  db_name: process.env.REACT_APP_POUCHDB_DB_EVENT_NAME!
});
