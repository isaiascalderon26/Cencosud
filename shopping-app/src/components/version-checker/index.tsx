import React from 'react';
import { App, AppInfo } from '@capacitor/app';
import { isPlatform } from "@ionic/react";
import { IonContent, IonPage, IonGrid, IonRow, IonCol } from '@ionic/react';

// styles
import './index.less';
// components
import ErrorModal, { IErrorModalProps } from '../error-modal';
// clients
import RemoteConfigClient from '../../clients/RemoteConfigClient';
// lib
import EurekaConsole from '../../lib/EurekaConsole';


const UNIQUE_CLASS = 'bbmzuknsjl';
const MODAL_UNIQUE_CLASS = 'agdoqmmokb';
const eureka = EurekaConsole({ label: "version-checker" });

interface IProps {
  onCheckComplete: () => void;
}

interface IState {
  error_modal?: IErrorModalProps,
}

export default class VersionChecker extends React.Component<IProps, IState> {
  state: IState = {
  }

  componentDidMount = async () => {
    try {
      const [appInfo, minimumBuildNumber] = await Promise.all([
        this.getAppInfo(),
        this.getMinimumBuildNumber()
      ]);
      const currentBuildNumber = Number(appInfo.build);

      // check if current version is supported
      if (currentBuildNumber <= minimumBuildNumber) {
        this.setState({
          error_modal: {
            title: 'Necesitas actualizar',
            message: 'Por favor, actualiza tu aplicación para poder disfrutar de una mejor experiencia.',
            retryMessage: 'Actualizar',
            onRetry: async () => {
              console.log('Opening the app store')

              let url: string = await RemoteConfigClient.get("IOS_URL_APP_STORE",process.env.REACT_APP_IOS_URL_APP_STORE);

              if (isPlatform('android')) {
                url = await RemoteConfigClient.get("ANDROID_URL_APP_STORE", process.env.REACT_APP_ANDROID_URL_APP_STORE);
              }

              window.open(url, "_blank")

            },
          },
        });
        return;
      }

      this.props.onCheckComplete();
    } catch (error) {
      eureka.error('Unexpected error checking app version', error);

      // continue to avoid breaking the app
      this.props.onCheckComplete();
    }
  }

  getAppInfo = async () => {
    // add support to web
    if (!isPlatform("capacitor")) {
      // change this value to test in web
      return { build: `${Number.MAX_VALUE}` } as AppInfo;
    }

    const appInfo = await App.getInfo();
    return appInfo;
  }

  getMinimumBuildNumber = async () => {
    try {
      let key: string = 'IOS_MINIMUM_SUPPORTED_BUILD_NUMBER';
      if (isPlatform("android")) {
        key = 'ANDROID_MINIMUM_SUPPORTED_BUILD_NUMBER';
      }

      const minimumBuildNumber = await RemoteConfigClient.getNumber(key, Number.MIN_VALUE);
      return minimumBuildNumber;
    } catch (error) {
      eureka.error('Unexpected error getting minimum build number', error);

      return Number.MIN_VALUE;
    }
  }

  render() {
    const { error_modal } = this.state;

    return (
      <IonPage className={UNIQUE_CLASS}>
        <IonContent>
          <IonGrid>
            <IonRow>
              <IonCol>
                {error_modal && <ErrorModal cssClass={MODAL_UNIQUE_CLASS} title={error_modal.title} message={error_modal.message} cancelMessage={error_modal.cancelMessage} retryMessage={error_modal.retryMessage} onRetry={error_modal.onRetry} onCancel={error_modal.onCancel} />}
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    )
  }
}