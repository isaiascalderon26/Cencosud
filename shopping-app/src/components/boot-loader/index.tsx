import React from 'react';
import './index.less';

import { IonContent, IonPage, IonGrid, IonRow, IonCol } from '@ionic/react';
import AuthenticationClient from '../../clients/AuthenticationClient';
import SettingsClient from '../../clients/SettingsClient';
import SnapshotClient from '../../clients/SnapshotClient';
import DeveloperClient from '../../clients/DeveloperClient';
import DeepLinksClient from '../../clients/DeepLinksClient';
import ShoppingCartClient from '../../clients/ShoppingCartClient';
import Jobs from '../../jobs';
import Job from '../../lib/Job';
import { setLocale } from '../../lib/i18n';


interface IProps {
  onLoadComplete: (status: {}) => void;
}
interface IState {
  boostrapped: boolean
}

export default class BootLoader extends React.Component<IProps, IState> {
  state: IState = {
    boostrapped: false
  }

  componentDidMount() {
    this.callAllBoots();
  }

  /**
   * Because i need to use capacitors plugins like Storage Plugin,
   * The "constructor" are Promises!!, so i need to call, in order
   * to ensure, that the plugin will be loaded before "start the app"
   *
   * @memberof BootLoader
   */
  async callAllBoots() {

    // TODO: Fix the really deletion of the records from the PouchDB
    // Insights: 
    // - https://stackoverflow.com/questions/39471351/how-do-i-force-pouchdb-to-really-delete-records
    // - https://github.com/pouchdb/pouchdb/issues/802
    // Solution: 
    // Get all docs (witouth the deleted ones)
    // And copy into another database ^^, then destroy the old one, and 
    // replace with the new one without the "deleted documents"
    // - https://github.com/pouchdb/pouchdb/issues/7598


    // Client's Boot
    await DeepLinksClient.boot();
    await AuthenticationClient.boot();
    await DeveloperClient.boot();
    await SnapshotClient.boot();
    await ShoppingCartClient.boot()

    // Job's Boot
    Object.keys(Jobs).forEach((key: string) => {
      const job: Job = (Jobs as any)[key];
      job.boot();
    });

    // Set the language
    const language = SettingsClient.get("LANGUAGE", "es");
    setLocale(language);

    this.props.onLoadComplete({});

  }

  render() {
    return <IonPage className='boot-loader'>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol>
            
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  }
}