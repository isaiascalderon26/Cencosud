import { IonPage } from '@ionic/react';
import React, { Fragment, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import AuthenticationClient from '../../clients/AuthenticationClient';
import { IArrayRestResponse } from '../../clients/RESTClient';
import SchedulesClient from '../../clients/SchedulesClient';
import BackdropLoading from '../../components/backdrop-loading';
import ErrorModal, { IErrorModalProps } from '../../components/error-modal';
import ListItem from '../../components/list-item';
import Page, { DefaultHeader } from '../../components/page';
import EurekaConsole from '../../lib/EurekaConsole';
import { IEvents } from '../../models/schedules/IEvents';
import ImageSchedule from '../../assets/media/schedule-default.png';
import './index.less';
import UserClient from '../../clients/UserClient';
import RegisterModal from '../../components/register_modal';
import { IUser } from '../../models/users/IUser';
type IMode = 'LOADING' | 'EVENTS' | 'LOGIN_REGISTER';

interface IProps extends RouteComponentProps<{}> { }
const ANIMATION_TIME = 200;
const eureka = EurekaConsole({ label: 'scheduled-events' });

export const EventListPage: React.FC<IProps> = (props) => {
  const [mode, setMode] = useState<IMode>('LOADING');
  const [loadingMessage, setLoadingMessage] = useState<string>('Cargando ...');
  const [error_modal, setStateErrorModal] = useState<IErrorModalProps>();
  const [navHistory, setNavHistory] = useState<IMode[]>([]);
  const [events, setEvents] = useState<IEvents[]>([]);

  const [user, setUser] = useState<IUser>();

  useEffect(() => {
    async function fetchData() {
      await fetchAllEvents();
    }
    fetchData();
  }, []);

  const fetchAllEvents = async () => {
    try {
      setMode('LOADING');
      const user = await UserClient.me();

      const events = (await SchedulesClient.getEvents({
        user_id: AuthenticationClient.getInfo().primarysid,
        mall_name: user.mall_selected?.name ?? window.localStorage.getItem("mall-selected")
      })) as unknown as IEvents[];

      setUser(user);

      if (user.email === "invited") {
        setMode('LOGIN_REGISTER');
        return;
      }

      setEvents(events);
      setMode('EVENTS');
    } catch (error) {
      eureka.error('Unexpected error 🚨 fetching all ', error);

      setStateErrorModal({
        title: 'Hubo un problema',
        message: 'No pudimos cargar toda la información. ¿Deseas reintentar?',
        onRetry: () => {
          setStateErrorModal(undefined);
          setTimeout(async () => {
            await fetchAllEvents();
          }, ANIMATION_TIME);
        },
        onCancel: () => {
          setStateErrorModal(undefined);
          setTimeout(() => {
            onbackHistory(true);
          }, ANIMATION_TIME);
        },
      });
    }
  };

  /**
   * Loading Render
   */
  const renderLOADING = () => {
    return (
      <Fragment>
        <BackdropLoading message={loadingMessage!} />
      </Fragment>
    );
  };

  const onLoginClickHandler = async () => {
    await AuthenticationClient.signOut();
    window.location.reload();
  }

  const onbackHistory = (navigate = true): void => {
    navHistory.pop();
    if (navigate) {
      if (!navHistory.length) {
        props.history.goBack();
        return;
      }
      setMode(navHistory[navHistory.length - 1]);
    }
  };

  const renderEVENTS = () => {
    return (
      <Page
        header={
          <DefaultHeader
            onBack={() => {
              onbackHistory(true);
            }}
          />
        }
        content={
          <Fragment>
            <div className="content-events">
              <div className="title">
                <h1>Disfruta de los mejores eventos y actividades</h1>
                <div className="subtitle">
                  Inscríbete y asegura tu asistencia a algún evento o agenda un
                  horario específico en las actividades que tenemos para tí.
                </div>
              </div>
            </div>
            <div className="list-events">
              {events.map((item: IEvents, i: number) => {
                return (
                  <Fragment key={i}>
                    <ListItem
                      avatar={item.image || ImageSchedule}
                      title={item.title}
                      subtitle={item.date}
                      cssClass={['events']}
                      tag={{
                        text: item.tag,
                        isComplete: item.isScheduled,
                      }}
                      onContinue={() => {
                        if (item.type === 'SCHEDULING') {
                          props.history.push(`/schedules/${item.id}`);
                        } else if (item.type === 'INSCRIPTION') {
                          props.history.push(`/event-inscription/${item.id}`);
                        }
                      }}
                      heightPx={90}
                      widthPercent={88}
                      marginLeftPx={24}
                      marginRightPx={34}
                      marginTopPx={20}
                      marginBottomPx={20}
                    />
                  </Fragment>
                );
              })}
            </div>
          </Fragment>
        }
      />
    );
  };

  const renderLOGIN_REGISTER = () => {
    return (
      <RegisterModal type='NEW' userInfo={user} onClose={() => onbackHistory()} onClick={() => onLoginClickHandler()} />
    )
  }

  const renders: Record<typeof mode, () => JSX.Element> = {
    LOADING: renderLOADING,
    EVENTS: renderEVENTS,
    LOGIN_REGISTER: renderLOGIN_REGISTER
  };

  /**
   * Main Render
   */
  const render = (mode: IMode) => {
    return (
      <IonPage
        className={`events-list ${mode
          .replaceAll('_', '-')
          .toLocaleLowerCase()}`}
      >
        {(() => {
          const customRender = renders[mode];
          if (!customRender) {
            return <div>{mode}</div>;
          }
          return customRender();
        })()}
        {error_modal && (
          <ErrorModal
            cssClass={error_modal.cssClass}
            icon={error_modal.icon}
            title={error_modal.title}
            message={error_modal.message}
            content={error_modal.content}
            cancelMessage={error_modal.cancelMessage}
            retryMessage={error_modal.retryMessage}
            onRetry={error_modal.onRetry}
            onCancel={error_modal.onCancel}
            displayButtonClose={error_modal.displayButtonClose}
          />
        )}
      </IonPage>
    );
  };

  return render(mode);
};
