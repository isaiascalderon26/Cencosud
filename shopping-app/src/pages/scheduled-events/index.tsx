import React, { Fragment, useEffect, useState } from 'react';
import { IonPage, IonButton, IonRefresher, IonRefresherContent } from '@ionic/react';
import { RefresherEventDetail } from '@ionic/core';
import { ellipsisHorizontalOutline } from 'ionicons/icons';
import { RouteComponentProps } from 'react-router';
import moment from 'moment';

/**
* Style
*/
import './index.less';

/**
* Assets
*/
import ImageSchedule from '../../assets/media/schedules-image.png';
import ImageAlert from '../../assets/media/delete-card.svg';
import ImageScheduleEmptyState from '../../assets/media/schedules-empty-state.svg'
import CheckedWhite from '../../assets/media/icon-checked-white-bg.svg';

/**
* Components
*/
import BackdropLoading from '../../components/backdrop-loading';
import ErrorModal, { IErrorModalProps } from '../../components/error-modal';
import Page, { DefaultHeader } from '../../components/page';
import ListItem from '../../components/list-item';
import EmptyModal from '../../components/empty-modal';

/**
* Clients
*/
import SchedulesClient from '../../clients/SchedulesClient';
import AuthenticationClient from '../../clients/AuthenticationClient';

/**
* Libs
*/
import EurekaConsole from '../../lib/EurekaConsole';
import StringFormatter from '../../lib/formatters/StringFormatter';

/**
* Models
*/
import { IScheduleBooking } from '../../models/schedules/IScheduleBooking';
import { IMall, ISchedulingContext } from '../../models/schedules/ISchedulesContext';
import HeaderText from '../../components/v2/typo/header-text';
import BottomNavigationBar from '../../components/v2/navigation/bottom-navigation-bar';

type IMode = "LOADING" | "EVENTS" | "EVENTS_EMPTY" | "CONFIRM_SURE" | "CANCEL_SUCCESS" | "CANCEL_INSCRIPTION_MODAL";

interface IProps extends RouteComponentProps<{
    id: string;
}> { };
interface IScheduleEvent {
    id: string;
    avatar: string;
    title: string;
    subtitle: string;
    start_event: Date;
    end_event?: Date;
    mall: IMall[];
    schedule_id: string;
    cancelId?: string;
    type?: string;
}

const ANIMATION_TIME = 200;
const eureka = EurekaConsole({ label: "scheduled-events" });

const ScheduledEventsPage: React.FC<IProps> = (props) => {

    const [mode, setMode] = useState<IMode>("LOADING");
    const [loadingMessage, setLoadingMessage] = useState<string>("Cargando ...");
    const [error_modal, setStateErrorModal] = useState<IErrorModalProps>();
    const [navHistory, setNavHistory] = useState<IMode[]>([]);
    const [scheduleEvent, setScheduleEvent] = useState<IScheduleEvent[]>([]);
    const [scheduleEventSelected, setScheduleEventSelected] = useState<IScheduleEvent>();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        async function fetchData() {
            await fetchAll();
        }
        fetchData();
    }, []);

    const fetchAll = async (hiddenLoading?: boolean) => {
        try {
            if (!hiddenLoading) {
                setMode("LOADING");
                setLoadingMessage("Cargando...");
            }

            const [
                scheduled_events,
                schedule_context,
            ] = await Promise.all([
                fetchScheduleBooking(),
                fetchSchedulingContext(),
            ]);

            if (scheduled_events && schedule_context) {
                const events = await onListEvents(scheduled_events, schedule_context);
                if (events.length != 0) {
                    setScheduleEvent(events);
                    setMode("EVENTS");
                    return;
                }
                setMode("EVENTS_EMPTY");
            }
        }
        catch (error) {
            eureka.error('Unexpected error 🚨 fetching all ', error);

            setStateErrorModal({
                title: "Hubo un problema",
                message: "No pudimos cargar toda la información. ¿Deseas reintentar?",
                onRetry: () => {
                    setStateErrorModal(undefined);
                    setTimeout(async () => {
                        await fetchAll();
                    }, ANIMATION_TIME);
                },
                onCancel: () => {
                    setStateErrorModal(undefined);
                    setTimeout(() => {
                        onbackHistory(true);
                    }, ANIMATION_TIME)
                }
            });
        }
    }

    //functions fetch data

    const fetchScheduleBooking = async (): Promise<IScheduleBooking[]> => {
        const params: Record<string, unknown> = {
            query: {
                'user_id.keyword_is': AuthenticationClient.getInfo().primarysid,
                'state.keyword_is': 'active',
                'slot.end_range_gte': moment().format('YYYY-MM-DDTHH:mm:ss.000+00:00')
            },
            sort: { 'slot.end': 'desc' },
            limit: 10
        };

        const scheduleBooking = await SchedulesClient.listScheduleBookings(params);
        return scheduleBooking.data;
    }

    const fetchSchedulingContext = async (): Promise<ISchedulingContext[]> => {
        const scheduleContext = await SchedulesClient.listSchedulesContext({ limit: 1000 });
        return scheduleContext.data;
    }

    const cancelSchedule = async () => {
        const { cancelId } = scheduleEventSelected!;
        setMode("LOADING");
        setLoadingMessage("Cancelando...");
        try {
            await SchedulesClient.updatePartial(cancelId!, {
                state: 'cancelled'
            });
            setMode("CANCEL_SUCCESS");
        } catch (e) {
            setMode("CONFIRM_SURE");
            setStateErrorModal({
                title: "Hubo un problema",
                message: "No pudimos cancelar el evento.",
                onCancel: () => {
                    setStateErrorModal(undefined);
                    setTimeout(() => {
                        onbackHistory(true);
                    }, ANIMATION_TIME);
                }
            });
        }
    }

    //functions on
    const onbackHistory = (navigate = true): void => {
        navHistory.pop();
        if (navigate) {
            if (!navHistory.length) {
                props.history.goBack();
                return;
            }
            setMode(navHistory[navHistory.length - 1]);
        }
    }

    const onListEvents = async (
        events: IScheduleBooking[],
        contexts: ISchedulingContext[]
    ): Promise<IScheduleEvent[]> => {

        let arrayEvents: IScheduleEvent[] = [];
        events.map(event => {
            const eventFind = contexts.find(context => context.id === event.slot.schedule_id);
            const data = {
                id: event.slot.id,
                avatar: eventFind?.avatar_image ? eventFind.avatar_image : ImageSchedule,
                title: eventFind?.schedule_name,
                subtitle: StringFormatter.capFirstLetter(moment(event.slot.start, 'YYYY-MM-DD hh:mm:ss').format('dddd DD MMMM')),
                start_event: moment(event.slot.start, 'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
                end_event: moment(event.slot.end, 'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
                mall: eventFind?.mall,
                schedule_id: eventFind?.id,
                cancelId: event.id,
                type: eventFind?.type
            } as unknown as IScheduleEvent;
            arrayEvents = [...arrayEvents, data];
        });
        return arrayEvents;
    }

    const onRefreshHandler = async (event: CustomEvent<RefresherEventDetail>) => {
        try {
            await fetchAll(true)
        } catch (error) {
            eureka.error('An error has occurred trying to refresh scheduled-events data', error);
            eureka.debug((error as Error).message)
        } finally {
            event.detail.complete();
        }

    }

    /**
    * Loading Render
    */
    const renderLOADING = () => {
        return (
            <Fragment>
                <BackdropLoading message={loadingMessage!} />
            </Fragment>
        )
    }

    /**
    * Scheduled Events Render
    */
    const renderEVENTS = () => {
        return (
            <Page
                header={<DefaultHeader onBack={() => { props.history.push(`/mall-home/${props.match.params.id}`) }} />}
                content={
                    <Fragment>
                        <IonRefresher slot="fixed" onIonRefresh={onRefreshHandler}>
                            <IonRefresherContent
                                pullingIcon={ellipsisHorizontalOutline}
                                refreshingSpinner="dots">
                            </IonRefresherContent>
                        </IonRefresher>
                        <div className="content-events">
                            <div className="title">
                                <h1>Eventos Agendados</h1>
                                <div className="subtitle">Revisa los eventos agendados y sus detalles ...</div>
                            </div>
                        </div>
                        <div>
                            <hr className="separation-line" />
                        </div>
                        <div className="list-events">
                            {scheduleEvent.map((item: IScheduleEvent, i: number) => {
                                return (
                                    <Fragment key={`${item.id}-${i}`}>
                                        <ListItem
                                            avatar={item.avatar}
                                            title={item.title}
                                            subtitle={item.subtitle}
                                            onContinue={() => {
                                                const event = scheduleEvent.find(event => event.id === item.id);
                                                if (event) {
                                                    console.log(event)
                                                    setScheduleEventSelected(event);
                                                    setShowModal(true);
                                                }
                                            }}
                                            heightPx={80}
                                            widthPercent={82}
                                            marginLeftPx={34}
                                            marginRightPx={34}
                                            marginTopPx={20}
                                            marginBottomPx={20}
                                        />
                                    </Fragment>
                                )
                            })}
                            {showModal && (
                                <EmptyModal
                                    height="650px"
                                    onClose={() => {
                                        setShowModal(false);
                                        setMode("EVENTS");
                                    }}
                                    hidden={false}
                                    cssClass="modal-events-poiybgw"
                                >
                                    <div className="content-modal">
                                        <div className="image">
                                            <img src={!scheduleEventSelected?.avatar ? ImageSchedule : scheduleEventSelected.avatar} />
                                        </div>
                                        <div>
                                            <div className="title">
                                                <h1>{scheduleEventSelected?.title}</h1>
                                            </div>
                                            <div className="list-boxes">
                                                <div className="box-disclaimer">
                                                    <div className="title-1">
                                                        Centro Comercial
                                                    </div>
                                                    <div className="title-2">
                                                        {scheduleEventSelected?.mall[0]?.name}
                                                    </div>
                                                </div>
                                                <div className="box-disclaimer">
                                                    <div className="title-1">
                                                        Fecha
                                                    </div>
                                                    <div className="title-2">
                                                        {scheduleEventSelected?.subtitle}
                                                    </div>
                                                </div>
                                                <div className="box-disclaimer">
                                                    <div className="title-1">
                                                        Rango Horario
                                                    </div>
                                                    <div className="title-2">
                                                        {`${moment(scheduleEventSelected?.start_event).format('HH:mm')} - ${moment(scheduleEventSelected?.end_event).format('HH:mm')} hrs`}
                                                    </div>
                                                </div>
                                                <div className="footer-modal">
                                                    <div>
                                                        <IonButton
                                                            onClick={() => {
                                                                setShowModal(false);
                                                                if (scheduleEventSelected?.type === "INSCRIPTION") {
                                                                    setMode("CANCEL_INSCRIPTION_MODAL");
                                                                } else {
                                                                    setMode("CONFIRM_SURE");
                                                                }

                                                            }}
                                                        >
                                                            Cancelar {scheduleEventSelected?.type === "INSCRIPTION" ? "Inscripción" : "Evento"}
                                                        </IonButton>
                                                    </div>
                                                    <div>
                                                        <IonButton
                                                            className="white"
                                                            onClick={() => {
                                                                setShowModal(false);
                                                                setMode("EVENTS");
                                                            }}
                                                        >
                                                            Volver
                                                        </IonButton>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </EmptyModal>
                            )}
                        </div>
                    </Fragment>
                }
            />
        )
    }

    /**
    *  Events Empty Render
    */
    const renderEVENTS_EMPTY = () => {
        return (
            <Page
                header={<DefaultHeader onBack={() => { onbackHistory(true) }} />}
                content={
                    <Fragment>
                        <div className="header-events">
                            <div className="title">
                                <h1>Eventos Agendados</h1>
                                <div className="subtitle">Revisa los eventos agendados y sus detalles</div>

                            </div>
                        </div>
                        <div>
                            <hr className="separation-line" />
                        </div>
                        <div className="content">
                            <div className="img-emty-result">
                                <img src={ImageScheduleEmptyState} />
                            </div>
                            <div className="text">
                                <span>Por ahora no hay eventos agendados</span>
                            </div>
                            <div className="button-disclaimer">
                                <IonButton
                                    className="button-scheduling-empty"
                                    onClick={() => {
                                        //TODO: Navigate to events
                                        eureka.info("Navigate to events")
                                        props.history.push(`/events-list`);
                                    }}
                                >
                                    Revisa aquí los eventos disponibles
                                </IonButton>
                            </div>
                        </div>
                    </Fragment>
                }
            />
        )
    }

    const renderCANCEL_INSCRIPTION_MODAL = () => {
        const { schedule_id, mall } = scheduleEventSelected!;
        return (
            <Page
                header={<DefaultHeader onBack={() => { setMode("EVENTS") }} />}
                content={
                    <Fragment>
                        <div className="confirm-content">
                            <div className="icon">
                                <img src={ImageAlert} />
                            </div>
                            <div className="title">
                                <h1>¿Estás seguro?</h1>
                            </div>
                            <div className="subtitle">
                                <span>Si eliminas la inscripción ya no podrás recuperarla y deberás inscribirte nuevamente en caso de querer asistir.</span>
                            </div>
                            <div className="buttons">
                                <div>
                                    <IonButton
                                        onClick={cancelSchedule}
                                    >
                                        Si, quiero eliminar
                                    </IonButton>
                                </div>
                            </div>
                        </div>
                    </Fragment>
                }
            />
        )
    }

    /*
    * Renders confirm sure
    */
    const renderCONFIRM_SURE = () => {
        const { schedule_id, mall } = scheduleEventSelected!;
        return (
            <Page
                header={<DefaultHeader onBack={() => { setMode("EVENTS") }} />}
                content={
                    <Fragment>
                        <div className="confirm-content">
                            <div className="icon">
                                <img src={ImageAlert} />
                            </div>
                            <div className="title">
                                <h1>¿Estás seguro?</h1>
                            </div>
                            <div className="subtitle">
                                <span>Si eliminas el agendamiento ya no podrás recuperarlo y deberás buscar otro horario para reagendar.</span>
                            </div>
                            <div className="buttons">

                                <div>
                                    <IonButton
                                        onClick={() => {
                                            props.history.push(`/schedules/${schedule_id}/${mall[0].id}`);
                                        }}
                                    >
                                        Quiero reagendar
                                    </IonButton>
                                </div>
                                <div>
                                    <IonButton
                                        className="white"
                                        onClick={cancelSchedule}
                                    >
                                        Cancelar Evento
                                    </IonButton>
                                </div>
                            </div>
                        </div>
                    </Fragment>
                }
            />
        )
    }

    const renderCANCEL_SUCCESS = () => {
        const { schedule_id, type } = scheduleEventSelected!;
        return (
            <Page
                header={undefined}
                content={
                    <Fragment>
                        <div className="confirm-content">
                            <div className="icon">
                                <img src={CheckedWhite} />
                            </div>
                            <div className="title">
                                {
                                    type === "INSCRIPTION" ? <h1>Inscripción Cancelada</h1> : <h1>Evento Cancelado</h1>
                                }
                            </div>
                            <div className="subtitle">
                                {
                                    type === "INSCRIPTION" ? <span>La inscripción al evento ha sido cancelada.</span> : <span>La cancelación del evento ha sido exitosa.</span>
                                }
                            </div>
                            <div className="buttons">

                                <div>
                                    <IonButton href={`/mall-home/${props.match.params.id}`}>
                                        Finalizar
                                    </IonButton>
                                </div>
                                <div>
                                    <IonButton
                                        className="white"
                                        onClick={() => {
                                            const notCanceled = [...scheduleEvent].filter((event) => event.schedule_id !== schedule_id);
                                            setScheduleEvent(notCanceled);
                                            setMode(notCanceled.length === 0 ? 'EVENTS_EMPTY' : 'EVENTS');
                                        }}
                                    >
                                        Ir a mis Eventos
                                    </IonButton>
                                </div>
                            </div>
                        </div>
                    </Fragment>
                }
            />
        )
    }

    const renders: Record<typeof mode, () => JSX.Element> = {
        LOADING: renderLOADING,
        EVENTS: renderEVENTS,
        EVENTS_EMPTY: renderEVENTS_EMPTY,
        CONFIRM_SURE: renderCONFIRM_SURE,
        CANCEL_SUCCESS: renderCANCEL_SUCCESS,
        CANCEL_INSCRIPTION_MODAL: renderCANCEL_INSCRIPTION_MODAL
    };

    /**
    * Main Render
    */
    const render = (mode: IMode) => {

        return (
            <IonPage className={`scheduled-events ${mode.replaceAll("_", "-").toLocaleLowerCase()}`}>
                {(() => {
                    const customRender = renders[mode];
                    if (!customRender) {
                        return <div>{mode}</div>;
                    }
                    return customRender();
                })()}
                {error_modal &&
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
                }
            </IonPage>
        )
    }

    return render(mode);

}

export default ScheduledEventsPage;
