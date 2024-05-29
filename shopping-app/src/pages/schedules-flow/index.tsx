import React, { Fragment, useEffect, useState } from 'react';
import { IonButton,  IonPage, useIonPicker } from '@ionic/react';
import { RouteComponentProps } from 'react-router';
import { AxiosError } from 'axios';
import moment from 'moment';

/**
* Style
*/
import './index.less';

/**
* Assets
*/
import ImageCheckOk from '../../assets/media/icon-checked-white-bg.svg';
import ImageStar from '../../assets/media/scheduling/star.svg';
import ImageLocation from '../../assets/media/scheduling/location.svg';
import ImageCalendar from '../../assets/media/scheduling/calendar.svg';
import ImageHour from '../../assets/media/scheduling/hour.svg';
import ImageAlert from '../../assets/media/delete-card.svg';
import ImageQuestion from '../../assets/media/icon-question.svg';

/**
* Components
*/
import BackdropLoading from '../../components/backdrop-loading';
import ErrorModal, { IErrorModalProps } from '../../components/error-modal';
import Page from '../../components/page/index';
import DefaultFooter from '../../components/page/components/default-footer/index';
import DefaultHeader from '../../components/page/components/default-header/index';
import SelectInput from '../../components/select-input';
import EmptyModal from '../../components/empty-modal';
import Block from '../../components/block/index';
import HourBox from './components/hour-box';
import RegisterModal from '../../components/register_modal';
import RutScreen from '../../components/rut-screen';

/**
* Clients
*/
import UserClient from '../../clients/UserClient';
import SchedulesClient from '../../clients/SchedulesClient';
import AuthenticationClient from '../../clients/AuthenticationClient';
import { IArrayRestResponse } from '../../clients/RESTClient';

/**
* Libs
*/
import EurekaConsole from '../../lib/EurekaConsole';

/**
* Models
*/
import { IUser } from '../../models/users/IUser';
import { ISchedulingContext, IMall } from '../../models/schedules/ISchedulesContext';
import { ISlot } from '../../models/schedules/ISlot';
import { IScheduleBooking } from '../../models/schedules/IScheduleBooking';
import { IDates } from '../../models/schedules/IDates';
import FirebaseAnalytics from '../../lib/FirebaseAnalytics';

type IMode = "LOADING" | "RUT" | "REGISTER_POPUP" | "SCHEDULING" | "HOURS" | "SCHEDULING_SUCCESS" | "ERROR_ACCOUNT_SAVE" | "RESCHEDULING_MODAL";

interface IProps extends RouteComponentProps<{ id: string, param?: string }> { };

interface IForm {
    form: {
        submitted: boolean,
        fields: {
          [key: string]: {
            value: string;
            has_error: boolean
          }
        }
    }
}

const ANIMATION_TIME = 200;
const eureka = EurekaConsole({ label: "schedules-flow" });

const SchedulesPage: React.FC<IProps> = (props) => {
    let intervalId: NodeJS.Timeout | undefined;
    const [present] =  useIonPicker();
    //props
    const scheduleId = props.match.params.id;
    const mallId = props.match.params.param;
    //states
    const [mode, setMode] = useState<IMode>("LOADING");
    const [loadingMessage, setLoadingMessage] = useState<string>("Cargando ...");
    const [navHistory, setNavHistory] = useState<IMode[]>([]);
    const [error_modal, setStateErrorModal] = useState<IErrorModalProps>();
    const [user, setUser] = useState<IUser>();
    const [schedule, setSchedule] = useState<ISchedulingContext>();
    const [modalCalendar, setModalCalendar] = useState<boolean>(false);
    const [slots, setSlots] = useState<ISlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<ISlot>();
    const [hourSelected, setHourSelected] = useState<IForm>();
    const [selectedMallId, setSelectedMallId] = useState<string>();
    const [selectedDate, setSelectedDate] = useState<IDates[]>([]);
    const [schedulingStatus, setSchedulingStatus] = useState<boolean>();
    const [reschedule, setReschedule] = useState<IScheduleBooking>()
    const [form, setForm] = useState<IForm>({
        form: {
            submitted: false,
            fields: {}
        }
    });

    useEffect(() => {
        async function fetchData() {
            await fetchAll();
        }
        fetchData();
        FirebaseAnalytics.customLogEvent("ionic_app", "agendamiento");
    }, []);
    const changeName = (name?: string) => {
      if (name?.toLocaleUpperCase() === 'portal florida'.toLocaleUpperCase()) return 'Florida Center'
      if (name?.toLocaleUpperCase() === 'portal nunoa'.toLocaleUpperCase()) return 'Portal Ñuñoa'
      if (name?.toLocaleUpperCase() === 'portal dehesa'.toLocaleUpperCase()) return 'Portal la Dehesa'
      if (name?.toLocaleUpperCase() === 'costanera center'.toLocaleUpperCase()) return 'Costanera Center'
      if (name?.toLocaleUpperCase() === 'alto las condes'.toLocaleUpperCase()) return 'Alto las Condes'


      return name
    }
    const fetchAll = async (hiddenLoading?:boolean) => {
        try {
            if(!hiddenLoading){
                setMode("LOADING");
                setLoadingMessage("Cargando...");
            }

            const [user, schedules, scheduling_status] = await Promise.all([
                fetchUser(),
                fetchSchedules(),
                fetchCheckSchedulingStatus(mallId || '')
            ]);

            setUser(user);
            setSchedule(schedules);
            setSchedulingStatus(scheduling_status);

            //case of rescheduling
            if(mallId){
                await onMallSelectedReschedule(mallId, schedules);
            }

            if(!user.document_number) {
                setMode("RUT");
                return;
            }

            if(user?.email === 'invited'){
                setMode("REGISTER_POPUP");
                return;
            }

            setMode("SCHEDULING");
            return;

        }
        catch (error) {
            eureka.error('Unexpected error fetching all', error);

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

    const onLoginClickHandler = async (): Promise<void> => {
        await AuthenticationClient.signOut();
        window.location.reload();
    };

    const onValidateSubmitted = (): boolean => {
        const formUser = form?.form;
        if(Object.keys(formUser.fields).length != 3) {
            return true;
        }
        return false;
    }


    const onSendForm = async (): Promise<void> => {

        const formUser = form?.form;

        const inputs = ['mall', 'date', 'hour']
        inputs.forEach((input) => {
            //validate if input exist in fields
            if(!formUser.fields[input])
            {
                formUser.fields[input] = {
                    value: '',
                    has_error: true
                }
            }
        });

        for(let key in formUser.fields) {
            if(formUser.fields[key].has_error) {
                setForm({
                    form: {
                        submitted: false,
                        fields: formUser.fields
                    }
                })
                return;
            }
        }

        const newForm = {
            form: {
                submitted: true,
                fields: formUser.fields
            }
        };

        setForm(newForm);

        //data save to IScheduleBooking
        const mall = schedule?.mall.filter((mall) => mall.id === selectedMallId)[0] as IMall;

        const data: IScheduleBooking = {
            slot: selectedSlot as ISlot,
            mall: mall,
            user_id: user?.primarysid as string,
            email: user?.email as string,
            name: user?.full_name as string,
            created_at: new Date(),
            updated_at: new Date()
        };

        setMode("LOADING");
        //schedule
        if(!schedulingStatus){
            //execute create schedule booking
            onCreateScheduleBooking(data);
            return;
        }
        //reschedule
        await onChangeStateScheduleBooking(data);

    }

    const onChangeStateScheduleBooking = async (data: IScheduleBooking): Promise<void> => {

        intervalId = setInterval(async () => {

            const update = {
                ...data,
                id: reschedule?.id,
                state: "rescheduled"
            } as IScheduleBooking;

            try {

                const schedule_booking_id = reschedule?.id;
                const response_schedule_booking = await SchedulesClient.getScheduleBookingById(schedule_booking_id!) as unknown as IScheduleBooking;

                if(response_schedule_booking.state === "rescheduled"){
                    //create new schedule booking
                    await onCreateScheduleBooking(data);
                    return;
                }

                const update_schedule_booking = await SchedulesClient.updateScheduleBooking(update);

                if(update_schedule_booking.state === "rescheduled"){

                    await onCreateScheduleBooking(data);

                }
                intervalId && clearInterval(intervalId);
            } catch (error) {
                eureka.error('An error has ocurred trying to rescheduling', error);
                eureka.error((error as Error).message, error);

                // clear interval
                intervalId && clearInterval(intervalId);
                // start again
                onChangeStateScheduleBooking(data);
            }
        }, 3000);
    }

    const onCreateScheduleBooking = async (data: IScheduleBooking): Promise<void> => {
        try {
            await SchedulesClient.create(data);
            eureka.info('Schedule booking created', data);
            setTimeout(() => {
                setMode("SCHEDULING_SUCCESS");
            }, 800);
        } catch (error) {
            eureka.error('Unexpected error creating schedule booking', error);

            if ((error as AxiosError).response?.status === 409) {
                setMode("ERROR_ACCOUNT_SAVE");
                return;
            }
            //others generic error
            setStateErrorModal({
                title: "Hubo un problema",
                message: "No pudimos crear la reserva de agendamiento. ¿Deseas reintentar?",
                onRetry: () => {
                    setStateErrorModal(undefined);
                    setTimeout(async () => {
                        await onCreateScheduleBooking(data);
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

    const onMallSelectedReschedule = async (
        mall_id:string,
        schedule:ISchedulingContext
    ) => {

        const filterMall = schedule.mall.filter((mall) => mall.id === mall_id)[0] as IMall;

        setForm({
            form: {
                submitted: false,
                fields: {
                    ...form.form.fields,
                    mall: {
                        value: filterMall.name,
                        has_error: false
                    }
                }
            }
        });

        setSelectedMallId(mall_id);

        const dates = await fetchDates(schedule!.id, mallId!) as unknown as IDates[];
        setSelectedDate(dates);
    }

    //functions fetch data
    const fetchUser = async (): Promise<IUser> => {
        const user = await UserClient.me();
        return user;
    }

    const fetchSchedules = async (): Promise<ISchedulingContext> => {
        const data = await SchedulesClient.getById(scheduleId);
        return data;
    }

    const fetchCheckSchedulingStatus = async (mall_id:string): Promise<boolean> => {
        const params: Record<string, unknown> = {
            query: {
                'user_id.keyword_is': AuthenticationClient.getInfo().primarysid,
                'state.keyword_is': 'active',
                'slot.schedule_id.keyword_is': scheduleId,
                'mall.id.keyword_is': mall_id,
                'slot.end_range_gte': moment().format('YYYY-MM-DDTHH:mm:ss.000+00:00')
            },
            limit: 1
        };

        const scheduleBooking = await SchedulesClient.listScheduleBookings(params);

        setReschedule(scheduleBooking.data[0]);

        return scheduleBooking.data.length > 0 ? true : false;
    }

    const fetchDates = async (
        schedule_context_id: string,
        mall_id: string
    ): Promise<IArrayRestResponse<IDates>> => {
        const data = await SchedulesClient.getContextDates({
            schedule_context_id,
            mall_id
        }) as IArrayRestResponse<IDates>;

        return data;
    }

    const fetchSlots = async (
        schedule_context_id: string,
        date: string,
        mall_id: string
    ): Promise<IArrayRestResponse<ISlot>> => {
        const data = await SchedulesClient.getSlots({
            schedule_context_id,
            date,
            mall_id
        }) as IArrayRestResponse<ISlot>;
        return data;
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
    * Rut Render
    */

    const renderRUT = () => {
        return (
            <RutScreen
                title={'Necesitamos que ingreses tu RUT'}
                subtitle={'Esto es necesario para seguir con el proceso'}
                onBack={() => onbackHistory(true) }
                onContinue={() => {
                    setMode('LOADING');
                    setLoadingMessage("Guardando Rut...");

                    setTimeout(async () => {
                        setMode("SCHEDULING");
                    }, 1000);
                }}
                onValue={(rut: string) => {
                    eureka.info("Update rut", rut);
                    setUser((prev: any) => ({ ...prev, user: { ...prev.user, document_number: rut } }));
                }}
            />
        )
    }

    /**
    * RegisterPopup Render
    */
    const renderREGISTER_POPUP = () => {
        return (
            <RegisterModal
                type="NEW"
                userInfo={user}
                onClose={() => onbackHistory(true)}
                onClick={onLoginClickHandler}
            />
        )
    }

    /**
    * Scheduling Render
    */
    const renderSCHEDULING = () => {
        return (
            <Page
                header={
                    <Fragment>
                        <div className="scheduling-header">
                            <div className="scheduling-image-title" style={{ 'background': `url(${schedule!.url_image})`}} ></div>
                            <DefaultHeader onBack={() => { onbackHistory(true) }} />
                        </div>
                    </Fragment>
                }
                content={
                    <div className="content-scheduling">
                        <div className="title">
                            <h1>Datos del agendamiento</h1>
                            <div className="subtitle">Esto es necesario para poder gestionar tu inscripción</div>
                            <div className="input-star">
                                <SelectInput icon={ImageStar} text={schedule!.schedule_name} />
                            </div>
                        </div>
                        <div className="text-body title">
                            <h1>Para agendar</h1>
                            <div className="config-scheduling">
                                <div className="input-mall space">
                                    <SelectInput
                                        icon={ImageLocation}
                                        placeholder={'Centro Comercial'}
                                        text={form.form.fields.mall?.value}
                                        onClick={async () => {
                                            if(!schedulingStatus){
                                                const options = schedule!.mall.map((mall) => {
                                                    return {
                                                        text: changeName(mall.name),
                                                        value: mall.id
                                                    }
                                                });

                                            present({
                                                cssClass: 'select-modal-opigf009',
                                                buttons: [
                                                  {
                                                    text: 'Confirmar',
                                                    handler: (selected): any => {
                                                        const mall = selected.mall.text;

                                                        //save mall id in state
                                                        setSelectedMallId(selected.mall.value);

                                                        //load data dates of calendar
                                                        (async () => {
                                                            const existScheduled = await fetchCheckSchedulingStatus(selected.mall.value);
                                                            if(existScheduled) {
                                                                setMode("RESCHEDULING_MODAL");
                                                            }
                                                            const dates = await fetchDates(schedule!.id, selected.mall.value) as unknown as IDates[];
                                                            setSelectedDate(dates);
                                                        })();

                                                            setForm({
                                                                form: {
                                                                    submitted: false,
                                                                    fields: {
                                                                        ...form.form.fields,
                                                                        mall: {
                                                                            value: mall,
                                                                            has_error: false
                                                                        }
                                                                    }
                                                                }
                                                            });
                                                        },
                                                    },
                                                    ],
                                                    columns: [
                                                    {
                                                        name: 'mall',
                                                        options: [...options]
                                                    },
                                                    ],
                                                });
                                            }
                                        }}
                                        formError={form.form.fields.mall?.has_error}
                                    />
                                </div>
                                <div className="input-calendar space">
                                    <SelectInput
                                        icon={ImageCalendar}
                                        placeholder={'Fecha'}
                                        formError={form.form.fields.date?.has_error}
                                        text={form.form.fields.date?.value}
                                        onClick={() => {
                                            if(form.form.fields.mall?.value){
                                                setModalCalendar(true);
                                            }
                                        }}
                                    />
                                    {modalCalendar &&
                                        <EmptyModal
                                            title={'Selecciona la fecha de tu visita'}
                                            height={'450px'}
                                            onClose={() => setModalCalendar(false)}
                                            hidden={false}
                                            cssClass="schedule-calendar-modal-oPwQaZ2"
                                        >
                                        <div className="schedule-modal-body">
                                            <div className="schedule-modal-body-subtitle">
                                                <h4>Escoge un día para agendar este evento.</h4>
                                                <div className="list-box">
                                                    {selectedDate.map((d:IDates, i:number) => {
                                                        const title = moment(d.date, 'YYYY-MM-DD hh:mm:ss').format('D');
                                                        const value_date = moment(d.date, 'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD');
                                                        const subtitle = moment(d.date, 'YYYY-MM-DD hh:mm:ss').format('ddd').slice(0, -1);
                                                        return (
                                                            <Fragment key={i}>
                                                                <Block
                                                                    title={title}
                                                                    subtitle={subtitle}
                                                                    value={value_date}
                                                                    onChange={async (value: string) => {

                                                                        setModalCalendar(false);
                                                                        const date = value;
                                                                        const slots = await fetchSlots(scheduleId, date, selectedMallId!) as unknown as ISlot[];
                                                                        //update IForm state, when user select a date
                                                                        delete form.form.fields.hour;
                                                                        const new_data : IForm = {
                                                                            form: {
                                                                                submitted: false,
                                                                                fields: {
                                                                                    ...form.form.fields,
                                                                                    date: {
                                                                                        value: value,
                                                                                        has_error: false
                                                                                    }
                                                                                }
                                                                            }
                                                                        };

                                                                        setForm(new_data);
                                                                        setHourSelected(new_data);
                                                                        //slots data
                                                                        setSlots(slots);
                                                                    }}
                                                                    disabled={d.available ? false : true}
                                                                />
                                                            </Fragment>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        </EmptyModal>
                                    }
                                </div>
                                <div className="input-hour space">
                                    <SelectInput
                                        icon={ImageHour}
                                        placeholder={'Hora'}
                                        formError={form.form.fields.hour?.has_error}
                                        text={form.form.fields.hour?.value}
                                        onClick={() => {
                                            if(form.form.fields.date?.value) {
                                                setMode('HOURS');
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                }
                footer={(
                    <DefaultFooter
                        mainActionText={ !schedulingStatus ? 'Agendar' : 'Reagendar' }
                        onClickMainAction={onSendForm}
                        mainActionIsDisabled={onValidateSubmitted()}
                    />
                )}
            />

        )
    }

    /**
    * Hours Render
    */
   const renderHOURS = () => {
        return (
            <Page
                header={<DefaultHeader onBack={() => { setMode('SCHEDULING') }} />}
                content={
                    <Fragment>
                        <div className="content-hours-text">
                            <div className="title">
                                <h1>Selecciona tu hora</h1>
                                <div className="subtitle">
                                    Escoge tu rango horario para tu visita el {moment(form.form.fields.date.value).format('[del] dddd DD [de] MMMM')}
                                </div>
                            </div>
                        </div>
                        <div>
                            <hr className="separation-line" />
                        </div>
                        <div className="content-hours">
                            <div className="hours-box">
                                {slots.map((slot: ISlot) => {
                                    const { id, start, end, ticket_avalaible, enabled } = slot;
                                    const title = `${moment(start, 'YYYY-MM-DD hh:mm:ss').format('HH:mm')}`;
                                    const subtitle =  enabled ? `Hay ${ticket_avalaible} cupos disponibles`: 'Ya no hay cupos disponibles';
                                    const values_hours = `${moment(start, 'YYYY-MM-DD hh:mm:ss').format('HH:mm')} - ${moment(end, 'YYYY-MM-DD hh:mm:ss').format('HH:mm')}`;
                                    const selected_slot = selectedSlot?.id === id ? true : false;
                                    return (
                                        <Fragment key={id}>
                                            <HourBox
                                                title={title}
                                                subtitle={subtitle}
                                                value={values_hours}
                                                onClick={(value: string) => {
                                                    if(ticket_avalaible != 0){
                                                        setHourSelected({
                                                            form: {
                                                                submitted: false,
                                                                fields: {
                                                                    ...form.form.fields,
                                                                    hour: {
                                                                        value: value,
                                                                        has_error: false
                                                                    }
                                                                }
                                                            }
                                                        });
                                                        setSelectedSlot(slot);
                                                    }
                                                }}
                                                selected={selected_slot}
                                                inactive={slot.enabled ? false : true}
                                            />
                                        </Fragment>
                                    )
                                })}
                            </div>
                        </div>
                    </Fragment>
                }
                footer={(
                    <Fragment>
                        <div><hr className="separation-line" /></div>
                        <div className="footer-hours">
                            <DefaultFooter
                                mainActionText={'Quiero este horario'}
                                onClickMainAction={() => {
                                    setForm(hourSelected!);
                                    setMode('SCHEDULING');
                                }}
                                mainActionIsDisabled={selectedSlot ? false : true}
                            />
                        </div>
                    </Fragment>
                )}
            />

        )
    }

    /**
    * Scheduling Success Render
    */
    const renderSCHEDULING_SUCCESS = () => {
        const content = (
            <div className="body-schedule-success">
                <div className="body-schedule-content">
                    <div className="schedule-header">
                        <div className="icon-check-ok">
                            <img src={ImageCheckOk} alt="icon-check" />
                        </div>
                        <h2 className="title">Evento Agendado</h2>
                        <h3 className="subtitle">
                            <p>
                                Tu inscripción ha sido exitosa.<br />
                                Recuerda presentar el correo que te hemos enviado para validar tu reserva.
                            </p>
                        </h3>
                    </div>
                </div>
            </div>
        );

        const footer = (
            <Fragment>
                <div className="footer">
                    <div>
                        <IonButton
                            href={ reschedule ? `/scheduled-events/${encodeURI(user?.mall_selected?.name as string)}` : undefined }
                            className='white-centered'
                            onClick={() => {
                                if(!reschedule){
                                    onbackHistory(true);
                                    return;
                                }
                            }}
                        >
                            Finalizar
                        </IonButton>
                    </div>
                </div>
            </Fragment>
        )

        return (
            <Page
                content={content}
                footer={footer}
            />
        )
    }

    /**
    * Error Modal Error Account Save Render
    */

    const renderERROR_ACCOUNT_SAVE = () => {
        return (
            <EmptyModal
                    title={'No se pudo agendar'}
                    height={'450px'}
                    onClose={() => onbackHistory(true)}
                    hidden={false}
                    cssClass="error-account-save-plkght"
                    icon={ImageAlert}
                >
                    <div className="body-text">
                        <div className="subtitle">
                            Las alternativas de agendamiento han cambiado durante el proceso, vuelve a revisar las opciones disponibles.
                        </div>
                        <div className="buttons-footer">
                            <IonButton className='white-centered' onClick={() => setMode("SCHEDULING")}>
                                Modificar Agenda
                            </IonButton>
                        </div>
                    </div>
            </EmptyModal>
        )
    }

    const renderRESCHEDULING = () => {
        return (
            <EmptyModal
                title={'¡Ya tienes un agendamiento!'}
                height={'370px'}
                onClose={() => {
                    setForm({
                        form: {
                            submitted: false,
                            fields: {}
                        }
                    });
                    setMode("SCHEDULING")
                }}
                hidden={false}
                icon={ImageQuestion}
                okText={'¿Quieres Reagendar?'}
                onOkClick={() => {
                    setMode("SCHEDULING");
                    setSchedulingStatus(true);
                }}
                cssClass={"resheduling"}
            >
                <div className="body-text">
                    <div className='description'>
                        <p>¿Te gustaría volver a agendar este evento?</p>
                    </div>

                </div>

            </EmptyModal>
        )
    }

    const renders: Record<typeof mode, () => JSX.Element> = {
        LOADING: renderLOADING,
        RUT: renderRUT,
        REGISTER_POPUP: renderREGISTER_POPUP,
        SCHEDULING: renderSCHEDULING,
        HOURS: renderHOURS,
        SCHEDULING_SUCCESS: renderSCHEDULING_SUCCESS,
        ERROR_ACCOUNT_SAVE: renderERROR_ACCOUNT_SAVE,
        RESCHEDULING_MODAL: renderRESCHEDULING
    };

    /**
    * Main Render
    */
    const render = (mode: IMode) => {
        return (
            <IonPage className={`schedules-flow ${mode.replaceAll("_", "-").toLocaleLowerCase()}`}>
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

export default SchedulesPage;
