import {
  IonPage,
  IonContent,
  IonIcon,
  withIonLifeCycle,
  IonHeader,
  IonToolbar,
  IonList,
  IonItem,
  IonThumbnail,
  IonImg,
  IonLabel,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import _ from 'lodash';
import moment from 'moment';
import React, { Fragment } from 'react';
import { arrowBack } from 'ionicons/icons';
import { IonSkeletonText } from '@ionic/react';
import { RouteComponentProps } from 'react-router';
import { RefresherEventDetail } from '@ionic/core';
import { ellipsisHorizontalOutline } from 'ionicons/icons';

/**
 * Styles
 */
import './index.less';

/**
 * Libs
 */
import EurekaConsole from '../../lib/EurekaConsole';

/**
 * Clients
 */
import NotificationClient from '../../clients/NotificationClient';

/**
 * Models
 */
import { IArrayRestResponse } from '../../clients/RESTClient';
import AuthenticationClient from '../../clients/AuthenticationClient';
import { INotification } from '../../models/notifications/INotification';

/**
 * Assets
 */
import parkingLogo from './../../assets/media/parking.png';
import foodieLogo from '../../assets/media/foodie/foodie-logo.svg';
import NoNotificationsSvg from '../../assets/media/no-notifications.svg';
import NotificationLogClient from '../../clients/NotificationLogClient';

const eureka = EurekaConsole({ label: 'notifications' });

interface IState {
  mode:
    | 'INITIAL_STATE'
    | 'PAGE_LOADED'
    | 'NOTIFICATION_DETAILS'
    | 'NOTIFICATION_DETAILS_SKELETON';
  task_to_show?: string;
  notifications: IArrayRestResponse<INotification>;
  notificationSelected?: INotification;
}
export default withIonLifeCycle(
  class NotificationsPage extends React.Component<RouteComponentProps, IState> {
    state: IState = {
      mode: 'INITIAL_STATE',
      notifications: {
        data: [],
        offset: 0,
        limit: 10,
        total: 0,
      },
    };

    /**
     * Ionic State Reset
     * More info: https://ionicframework.com/docs/react/lifecycle
     */
    ionViewWillEnter() {
      this.setState({
        mode: 'INITIAL_STATE',
      });
    }

    ionViewDidEnter() {
      setTimeout(() => this.getNotifications(), 175);
    }

    getNotifications = async () => {
      try {
        this.setState({
          mode: 'INITIAL_STATE',
        });
        const userAuth = await AuthenticationClient.getInfo();
        const { offset, limit } = this.state.notifications;
        let notifications = await NotificationClient.getNotifications(
          { user_id: userAuth.primarysid },
          offset,
          limit
        );

        notifications.data.sort(
          (d1, d2) =>
            new Date(d2.created_at).getTime() -
            new Date(d1.created_at).getTime()
        );

        this.setState({
          mode: 'PAGE_LOADED',
          notifications,
        });
      } catch (error) {
        eureka.error(
          'An error has occurred trying to get notifications',
          error
        );
        eureka.debug((error as Error).message);
      }
    };

    onBackButtonClickHandler = async () => {
      this.props.history.goBack();
    };

    renderNotificationItem = (notification: INotification) => {
      return (
        <IonItemSliding className="notification-item" key={notification.id}>
          {!notification.read && (
            <IonItemOptions side="start">
              <IonItemOption
                onClick={() => this.readNotificationHandler(notification)}
              >
                Leída
              </IonItemOption>
            </IonItemOptions>
          )}

          <IonItem
            button
            onClick={() => this.selectNotificationHandler(notification)}
          >
            <IonThumbnail slot="start">
              <IonImg src={this.getLogo(notification)} />
            </IonThumbnail>
            <IonLabel aria-expanded>
              <div className="content">
                <p className="datetime">
                  {moment(notification.created_at).fromNow()}
                </p>
                <h1 className="subject one-line">{notification.title}</h1>
                <p className="bodyText one-line">{notification.body}</p>
              </div>
            </IonLabel>
          </IonItem>

          <IonItemOptions side="end">
            <IonItemOption
              color="danger"
              onClick={() => this.deleteNotificationHandler(notification)}
            >
              Eliminar
            </IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      );
    };

    getLogo = (notification: INotification) => {
      if (notification.metadata?.foodie) {
        return foodieLogo;
      }
      return parkingLogo;
    };

    selectNotificationHandler = (notification: INotification) => {
      //mark read notification
      this.readNotificationHandler(notification);

      if (notification.metadata?.foodie) {
        this.props.history.push(
          `/foodie/voucher/payment:${notification.metadata?.foodie}`
        );
      } else {
        this.props.history.push(`/notifications/${notification.id}`);
      }
    };

    readNotificationHandler = async (notification: INotification) => {
      try {
        notification.read = true;
        const updated = await NotificationClient.updateNotification(
          notification
        );
        if (notification.metadata?.notification_log_id) {
          await NotificationLogClient.updateNotificationLog({
            id: notification.metadata.notification_log_id,
            status: 'READ',
          });
        }
        this.setState((old: IState) => {
          return {
            ...old,
            notifications: {
              ...old.notifications,
              data: old.notifications.data.map((n) =>
                n.id === notification.id ? updated : n
              ),
            },
          };
        });
      } catch (error) {
        eureka.error('An error has occurred when read notification', error);
        eureka.debug((error as Error).message);
      }
    };

    deleteNotificationHandler = async (notification: INotification) => {
      try {
        await NotificationClient.deleteNotification(notification);
        this.setState((old: IState) => {
          return {
            ...old,
            notifications: {
              ...old.notifications,
              data: old.notifications.data.filter(
                (n) => n.id !== notification.id
              ),
            },
          };
        });
      } catch (error) {
        eureka.error('An error has occurred when delete notification', error);
        eureka.debug((error as Error).message);
      }
    };

    onRefreshHandler = async (event: CustomEvent<RefresherEventDetail>) => {
      try {
        const userAuth = await AuthenticationClient.getInfo();
        const { offset, limit } = this.state.notifications;
        const notifications = await NotificationClient.getNotifications(
          { user_id: userAuth.primarysid },
          offset,
          limit
        );
        this.setState({
          notifications,
        });
      } catch (error) {
        eureka.error(
          'An error has occurred trying to refresh notifications',
          error
        );
        eureka.debug((error as Error).message);
      } finally {
        event.detail.complete();
      }
    };

    render() {
      const { mode } = this.state;
      return (
        <IonPage
          className={`root-page ${mode.replace(/_/gi, '-').toLowerCase()}`}
        >
          {(() => {
            const customRender: Function = (this as any)[`render${mode}`];
            if (!customRender) {
              return <div>{mode}</div>;
            }
            return customRender();
          })()}
        </IonPage>
      );
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
              <div
                className="back-button"
                onClick={this.onBackButtonClickHandler}
              >
                <IonIcon icon={arrowBack} />
              </div>
            </IonToolbar>

            <h1>Notificaciones</h1>
          </IonHeader>
          <IonContent>
            {_.times(3, (i) => {
              return (
                <div
                  className="custom-skeleton"
                  key={i}
                  style={{ margin: '5% 0 10%' }}
                >
                  <div />
                  <div />
                  <div>
                    <div>
                      <IonSkeletonText
                        animated={true}
                        style={{
                          margin: '5%',
                          width: '3.5em',
                          height: '3.5em',
                          borderRadius: '10px',
                        }}
                      />
                    </div>
                    <div>
                      <IonSkeletonText
                        animated={true}
                        style={{
                          margin: '1.5% 5%',
                          width: '50%',
                          height: '0.8em',
                          borderRadius: '10px',
                        }}
                      />
                      <IonSkeletonText
                        animated={true}
                        style={{
                          margin: '1.5% 5%',
                          width: '80%',
                          height: '0.8em',
                          borderRadius: '10px',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </IonContent>
        </Fragment>
      );
    };

    /**
     * User notification list
     * This state show the notifications list
     */
    renderPAGE_LOADED = () => {
      const { notifications } = this.state;
      const news = notifications?.data.filter((n) => !n.read);
      const olds = notifications?.data.filter((n) => n.read);

      return (
        <Fragment>
          <IonHeader className="ion-no-border">
            <IonToolbar>
              <div
                className="back-button"
                onClick={this.onBackButtonClickHandler}
              >
                <IonIcon icon={arrowBack} />
              </div>
            </IonToolbar>
            <h1>Notificaciones</h1>
          </IonHeader>
          {news?.length || olds?.length ? (
            <IonContent>
              <IonRefresher slot="fixed" onIonRefresh={this.onRefreshHandler}>
                <IonRefresherContent
                  pullingIcon={ellipsisHorizontalOutline}
                  refreshingSpinner="dots"
                ></IonRefresherContent>
              </IonRefresher>
              {news?.length ? (
                <div className="notifications-list">
                  <h3>Nuevas</h3>
                  <IonList lines="none">
                    {news.length &&
                      news!.map((notification) => {
                        return this.renderNotificationItem(notification);
                      })}
                  </IonList>
                </div>
              ) : (
                <div className="no-notifications">
                  <IonIcon src={NoNotificationsSvg}></IonIcon>
                  <p>No tienes notificaciones nuevas</p>
                </div>
              )}
              {olds.length > 0 ? (
                <div className="notifications-list readed">
                  <h3>Leídas</h3>
                  <IonList lines="none">
                    {olds!.map((notification) => {
                      return this.renderNotificationItem(notification);
                    })}
                  </IonList>
                  <br />
                  <br />
                  <br />
                </div>
              ) : null}
            </IonContent>
          ) : (
            <IonContent>
              <IonRefresher slot="fixed" onIonRefresh={this.onRefreshHandler}>
                <IonRefresherContent
                  pullingIcon={ellipsisHorizontalOutline}
                  refreshingSpinner="dots"
                ></IonRefresherContent>
              </IonRefresher>
              <div className="no-notifications-large">
                <h2>No te has perdido de nada!!</h2>
                <p>No tienes notificaciones nuevas</p>
              </div>
            </IonContent>
          )}
        </Fragment>
      );
    };
  }
);
