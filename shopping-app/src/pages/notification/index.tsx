import React, { Fragment } from 'react';
import './index.less';
import { arrowBack, arrowBackOutline } from 'ionicons/icons';
import {
  IonPage,
  IonContent,
  IonIcon,
  withIonLifeCycle,
  IonHeader,
  IonToolbar,
  IonButton,
  IonButtons,
} from '@ionic/react';
import { IonSkeletonText } from '@ionic/react';
import { RouteComponentProps } from 'react-router';
import EurekaConsole from "../../lib/EurekaConsole";

import NotificationClient from '../../clients/NotificationClient';
import { INotification } from '../../models/notifications/INotification';

const eureka = EurekaConsole({ label: "notifications" });

interface IProps extends RouteComponentProps<{
  id: string
}> { }

interface IState {
  mode: "INITIAL_STATE" | "PAGE_LOADED",
  notification?: INotification,
}

export default withIonLifeCycle(class NotificationsPage extends React.Component<IProps, IState> {
  state: IState = {
    mode: "INITIAL_STATE",
  }

  /**
   * Ionic State Reset
   * More info: https://ionicframework.com/docs/react/lifecycle
   */
  ionViewWillEnter() {
    this.setState({
      mode: "INITIAL_STATE"
    })
  }

  ionViewDidEnter() {
    setTimeout(() => this.getNotification(), 175);
  }

  getNotification = async () => {
    try {
      const notification = await NotificationClient.getNotification(this.props.match.params.id);
      this.setState({ mode: "PAGE_LOADED", notification });
    } catch (error) {
      eureka.error('An error has occurred trying to get a notification', error)
      eureka.debug((error as Error).message)
    }
  }

  onBackButtonClickHandler = async () => {
    this.props.history.goBack();
  }

  render() {
    const { mode } = this.state;
    return <IonPage className={`notification ${mode.replace(/_/ig, '-').toLowerCase()}`}>
      {(() => {
        const customRender: Function = (this as any)[`render${mode}`];
        if (!customRender) {
          return <div>{mode}</div>;
        }
        return customRender();
      })()}
    </IonPage>
  }

  /**
   * Waiting Initial State
   *
   * @memberof RootPage
   */
  renderINITIAL_STATE = () => {

    return (
      <Fragment>
        <IonHeader className="ion-no-border">
          <IonToolbar>
            <div className="back-button" onClick={this.onBackButtonClickHandler}>
              <IonIcon icon={arrowBack} />
            </div>
          </IonToolbar>
          <div className="custom-skeleton"  style={{margin: "5% 0 10%"}}>
            <div>
              <div>
                <IonSkeletonText animated={true} style={{ margin: "1.5% 5%", width: "50%", height: "1em", borderRadius: "10px" }} />
              </div>
            </div>
          </div>
        </IonHeader>
        <IonContent>
          <div className="custom-skeleton" style={{margin: "5% 0 10%"}}>
            <div>
              <div>
                <IonSkeletonText animated={true} style={{ margin: "1.5% 5%", width: "90%", height: "0.8em", borderRadius: "10px" }} />
                <IonSkeletonText animated={true} style={{ margin: "1.5% 5%", width: "90%", height: "0.8em", borderRadius: "10px" }} />
                <IonSkeletonText animated={true} style={{ margin: "1.5% 5%", width: "90%", height: "0.8em", borderRadius: "10px" }} />
                <IonSkeletonText animated={true} style={{ margin: "1.5% 5%", width: "90%", height: "0.8em", borderRadius: "10px" }} />
              </div>
            </div>
          </div>
        </IonContent>
      </Fragment>
    )
  }
  
  /**
   * User notification list
   * This state show the notifications list
   */
  renderPAGE_LOADED = () => {
    const notification = this.state.notification!;

    return (
      <Fragment>
      <IonHeader className="ion-no-border">
        <IonToolbar>
            <div className="back-button" onClick={this.onBackButtonClickHandler}>
              <IonIcon icon={arrowBack} />
            </div>
          </IonToolbar>
          <h1>{notification.title}</h1>
        </IonHeader>
      <IonContent>
        <div>
          <p>{notification.body}</p>
        </div>
      </IonContent>
    </Fragment>
    )
  }

});
