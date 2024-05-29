import React, { Fragment, useEffect, useState } from 'react';
import { IonButton, IonPage, useIonPicker } from '@ionic/react';
import { RouteComponentProps } from 'react-router';
import moment from 'moment';

/**
* Style
*/
import './index.less';

/**
* Assets 
*/
import ShapeUser from './../../assets/media/shape.png'
import EmailIcon from './../../assets/media/email-icon.png'
import ImageLocation from '../../assets/media/scheduling/location.svg';
import ImagePlace from '../../assets/media/place.svg';
import CheckedWhite from '../../assets/media/icon-checked-white-bg.svg';
import BannerTitleImg from '../../assets/media/cencosud-points/banner-title.jpeg';
import ImageAlert from '../../assets/media/delete-card.svg';

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

/**
* Clients
*/
import UserClient from '../../clients/UserClient';
import SchedulesClient from '../../clients/SchedulesClient';
import DistrictsClient from '../../clients/DistrictsClient';
import AuthenticationClient from '../../clients/AuthenticationClient';

/**
* Libs
*/
import EurekaConsole from '../../lib/EurekaConsole';

/**
* Models 
*/
import { IUser } from '../../models/users/IUser';
import { ISchedulingContext } from '../../models/schedules/ISchedulesContext';
import Landing from '../../components/landing';
import RegisterModal from '../../components/register_modal';
import RutScreen from '../../components/rut-screen';
import InputText from '../../components/input-text';
import DatePicker from '../../components/date-picker';
import DniFormatter from '../../lib/formatters/DniFormatter';
import { AxiosError } from 'axios';


type IMode = "LOADING" | "LANDING" | "FORM_INSCRIPTION" | "RUT_FORM" | "INSCRIPTION_SUCCESS" | "EVENT_EXIST";

type IValidation = "required" | "email" | "document" | "phone" | "min_length";

interface IRegionCounty {
    id: string;
    name: string;
}

interface IRegion {
    id: string;
    name: string;
    counties: IRegionCounty[];
}

interface IProps extends RouteComponentProps<{ id: string, param?: string }> { };

interface IForm {
    form: {
        submitted: boolean,
        fields: {
            [key: string]: {
                value: string | number | Date;
                has_error: boolean
            }
        }
    }
}

interface IPresenterItem {
    text: string,
    value: string | number
}

const eureka = EurekaConsole({ label: "event-inscription-flow" });

const EventInscriptionPage: React.FC<IProps> = (props) => {
    const phoneNumberMinLength = 9;
    const validPhoneNumberFormat = /^(\+\d{2})*\d{9}$/;

    const [present] = useIonPicker();
    //props
    const scheduleId = props.match.params.id;
    //states 
    const [mode, setMode] = useState<IMode>("LOADING");
    const [loadingMessage, setLoadingMessage] = useState<string>("Cargando ...");
    const [navHistory, setNavHistory] = useState<IMode[]>([]);
    const [error_modal, setStateErrorModal] = useState<IErrorModalProps>();
    const [user, setUser] = useState<IUser>();
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [currentSchedule, setCurrentSchedule] = useState<ISchedulingContext | null>(null);
    const [newEvent, setNewEvent] = useState<boolean>();
 
    const [regions, setRegions] = useState<IRegion[]>([]);

    const [form, setForm] = useState<IForm>({
        form: {
            submitted: false,
            fields: {}
        }
    });

    const validateFormat = (value: string, validation: Array<IValidation>) => {
        if (validation.includes('required') && value === '') {
            return {
                has_error: true,
                message_error: 'Campo requerido'
            };
        }

        if (validation.includes('document') && value !== '') {
            const validate = DniFormatter.isRutValid(value);

            if (!validate) {
                return {
                    has_error: true,
                    message_error: 'Rut inválido, debes ingresarlo sin puntos y con guión'
                };
            }
        }

        if (validation.includes('email') && value !== '') {
            const regex = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
            if (!regex.test(value)) {
                return {
                    has_error: true,
                    message_error: 'Formato de email inválido'
                };
            }
        }

        if (validation.includes('phone') && value !== '') {
            if (value?.length < phoneNumberMinLength || !validPhoneNumberFormat.test(value)) {
                return {
                    has_error: true,
                    message_error: 'Formato de teléfono inválido (9 dígitos)'
                };
            }
        }

        if (validation.includes('min_length') && value !== '') {
            if (value?.length < 2) {
                return {
                    has_error: true,
                    message_error: 'debe tener al menos 2 caracteres'
                };
            }
        }
    }


    const loadUserData = async () => {
        try {
            const myInfo = await UserClient.me();
            setUser({ ...myInfo });
        } catch (e) {
        }
    }

    useEffect(() => {
        loadUserData();

        async function fetchData() {
            await fetchAll();
            try {
                const data = await DistrictsClient.loadRegions();
                setRegions(data);
            } catch (e) {

            }
        }
        fetchData();

    }, []);

    useEffect(() => {
        setForm({
            form: {
                submitted: false,
                fields: {
                    ...form.form.fields,
                    name: {
                        value: user?.full_name!,
                        has_error: false
                    },
                    ...(isAppleRelay() ? (user?.meta_data?.alternative_mail ? {
                        email: {
                            value: user?.meta_data.alternative_mail,
                            has_error: false
                        }
                    } : {}) : {
                        email: {
                            value: user?.email,
                            has_error: false
                        }
                    })
                }
            }
        });
    }, [user]);

    const isAppleRelay = (): boolean => {
        const domain = "@privaterelay.appleid.com";
        return user?.email.includes(domain) ?? false;
    }

    const getCounties = (regionName: string): IPresenterItem[] => {
        const index = regions.findIndex((region) => region.name === regionName);
        return regions[index].counties.map((county) => ({ text: county.name, value: county.id }));
    }

    const fetchAll = async (hiddenLoading?: boolean) => {
        try { 
            const params: Record<string, unknown> = {
                query: {
                    'user_id.keyword_is': AuthenticationClient.getInfo().primarysid,
                    'slot.schedule_id.keyword_is': scheduleId,
                    'state.keyword_is': 'active'
                },
                limit: 1
            };

            const [
                scheduleObj,
                scheduleBookings
            ] = await Promise.all([
                await SchedulesClient.getById(scheduleId),
                await SchedulesClient.listScheduleBookings(params)
            ]);
            setCurrentSchedule(scheduleObj);
            setNewEvent(scheduleBookings.data.length > 0 ? true : false);
            setMode("LANDING");
        } catch (error) {
            eureka.error('Unexpected error fetching all', error);
        }
    }

    const onInputChangeHandler = (name: string, value: string): void => {

        let typeValidation: Array<IValidation>;

        switch (name) {
            case 'firstname':
                typeValidation = ['required', 'min_length'];
                break;
            case 'email':
                typeValidation = ['required', 'email'];
                break;
        }

        setForm({
            form: {
                submitted: false,
                fields: {
                    ...form.form.fields,
                    [name]: {
                        value,
                        has_error: validateFormat(value, typeValidation!)?.has_error || false,
                    }
                }
            }
        });
    }

    const updateUserMetaData = async (data: Partial<IUser>) => {
        return UserClient.updatePartial({
            ...data
        })
    }

    const handleSubmitSubscription = async () => {

        try {
            setMode("LOADING")

            // is apple relay email update metadata alternative email
            if (isAppleRelay() && !user?.meta_data?.alternative_mail) {
                await updateUserMetaData({
                    meta_data: {
                        ...user?.meta_data,
                        alternative_mail: form.form.fields.email?.value
                    }
                });
            }

            // if user havent birthday update
            if (!user?.birthday) {
                await updateUserMetaData({
                    birthday: new Date(form.form.fields.birthday!.value)
                })
            }

            // if havent metadata region/commune update
            if (!user?.meta_data?.region || !user?.meta_data?.commune) {

                const region = regions.find((reg) => reg.name === form.form.fields.region?.value);

                await updateUserMetaData({
                    meta_data: {
                        ...user?.meta_data,
                        commune: JSON.stringify(region?.counties.find((county) => county.name === form.form.fields.county.value)),
                        region: JSON.stringify({ id: region?.id, name: region?.name })
                    }
                })


            }

            const email = isAppleRelay() ? (user?.meta_data?.alternative_mail ? user?.meta_data?.alternative_mail : form.form.fields.email.value) : user?.email

            // finally create inscription
            await SchedulesClient.create({
                slot: {
                    schedule_id: currentSchedule?.id!,
                    start: moment(currentSchedule?.start_date!).format("YYYY-MM-DDTHH:mm:ssZ"),
                    end: moment(currentSchedule?.end_date!).format("YYYY-MM-DDTHH:mm:ssZ"),
                    enabled: true,
                    ticket_avalaible: 0
                },
                mall: currentSchedule?.mall.find((mall) => mall.name === form.form.fields.mall.value)!,
                user_id: user!.primarysid,
                email: email,
                name: form.form.fields.name!.value.toString(),
                type: "inscription"
            })

            setMode("INSCRIPTION_SUCCESS")

        } catch (e) {

            if ((e as AxiosError).response?.status === 409) {
           
                setStateErrorModal({
                    title: "¡Lo Sentimos! este evento ya está completo",
                    message: "Al paracer no quedan cupos en el evento seleccionado.",
                    retryMessage: "Entiendo",
                    onRetry: () => {
                        setStateErrorModal(undefined);
                        props.history.push(`/events-list`);
                    },
                });

                return
            }

            setMode("FORM_INSCRIPTION");
            setStateErrorModal({
                title: "Hubo un problema",
                message: "No pudimos crear la inscripción.",
                onCancel: () => {
                    setStateErrorModal(undefined);
                    setTimeout(() => {
                        setMode("FORM_INSCRIPTION");
                    }, 200);
                }
            });
        }

    }

    const shouldDisableSubmitSubscription = () => {

        const errors: any = {};

        if (!user?.meta_data?.commune && !form.form.fields.region?.value)
            errors["region"] = true;

        if (!user?.meta_data?.commune && !form.form.fields.county?.value)
            errors["county"] = true;

        if (!form.form.fields.name?.value)
            errors["name"] = true;

        if (!form.form.fields.email?.value)
            errors["email"] = true;

        if (!user?.birthday && !form.form.fields.birthday?.value)
            errors["birthday"] = true;

        if (!form.form.fields.mall?.value)
            errors["mall"] = true;

        return Object.keys(errors).length > 0;

    }

    const handleUpdateUserRUT = async (rut: string) => {

        try {

            setMode("LOADING");

            await UserClient.updatePartial({
                document_number: rut
            });

            setMode("FORM_INSCRIPTION");

        } catch (e) {
            setMode("RUT_FORM")
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

    const renderINSCRIPTION_SUCCESS = () => {
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
                                <h1>Inscripción creada</h1>
                            </div>
                            <div className="subtitle">
                                <span>La Inscripción al evento ha sido exitosa.</span>
                            </div>
                            <div className="buttons">
                                <div>
                                    <IonButton
                                        className="white"
                                        onClick={() => {
                                            onbackHistory(true);
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
   * Scheduling Render
   */
    const renderFORM_INSCRIPTION = () => {
        return (
            <Page
                header={
                    <Fragment>
                        <div className="scheduling-header">
                            <div className="scheduling-image-title" style={{ 'background': `url(${currentSchedule!.url_image})` }} ></div>
                            <DefaultHeader onBack={() => { onbackHistory(true) }} />
                        </div>
                    </Fragment>
                }
                content={
                    <div className="content-scheduling">
                        <div className="title">
                            <h1>Necesitamos algunos datos</h1>
                            <div className="subtitle">Completa los datos requeridos para continuar con la inscripción.</div>
                        </div>
                        <div className="text-body title">
                            <div className="config-scheduling">
                                <div className="input-mall space">
                                    <SelectInput
                                        cssClass="select-input"
                                        icon={ImageLocation}
                                        placeholder={'Centro Comercial'}
                                        text={form.form.fields.mall?.value.toString()}
                                        onClick={async () => {

                                            if (true) {
                                                const options = currentSchedule!.mall.map((mall) => {
                                                    return {
                                                        text: mall.name,
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

                                <h3 className='form-section-header' >Datos personales</h3>

                                <InputText
                                    name="name"
                                    placeholder='Nombre y Apellidos'
                                    icon={ShapeUser}
                                    onValueChange={(value: string) => {
                                        onInputChangeHandler('name', value)
                                    }}
                                    disabled={false}
                                    error={
                                        validateFormat(form.form.fields.name?.value.toString(), ["required", "min_length"])?.has_error && form.form.submitted
                                            ? validateFormat(form.form.fields.name?.value.toString(), ["required", "min_length"])?.message_error
                                            : ''
                                    }
                                    defaultValue={user?.full_name}
                                />


                                <InputText
                                    name="email"
                                    placeholder='Email'
                                    disabled={!isAppleRelay() || user?.meta_data?.alternative_mail}
                                    icon={EmailIcon}
                                    onValueChange={(value: string) => {
                                        onInputChangeHandler('email', value)
                                    }}
                                    error={
                                        validateFormat(form.form.fields.email?.value.toString(), ["required", "min_length"])?.has_error && form.form.submitted
                                            ? validateFormat(form.form.fields.email?.value.toString(), ["required", "min_length"])?.message_error
                                            : ''
                                    }
                                    defaultValue={isAppleRelay() ? (user?.meta_data?.alternative_mail ? user?.meta_data?.alternative_mail : "") : user?.email}
                                />

                                {
                                    (!user?.meta_data?.commune || !user?.meta_data?.region) && <h3 className='form-section-header' >¿De dónde eres?</h3>
                                }

                                {
                                    (!user?.meta_data?.commune || !user?.meta_data?.region) &&
                                    <div className="input-mall mb-2">
                                        <SelectInput
                                            cssClass="select-input"
                                            icon={ImagePlace}
                                            placeholder={'Región'}
                                            text={form.form.fields.region?.value.toString()}
                                            onClick={async () => {

                                                if (true) {

                                                    present({
                                                        cssClass: 'select-modal-opigf009',
                                                        buttons: [
                                                            {
                                                                text: 'Confirmar',
                                                                handler: (selected): any => {
                                                                    const value = selected.region.text;

                                                                    setForm({
                                                                        form: {
                                                                            submitted: false,
                                                                            fields: {
                                                                                ...form.form.fields,
                                                                                region: {
                                                                                    value,
                                                                                    has_error: false
                                                                                },
                                                                                county: {
                                                                                    value: "",
                                                                                    has_error: true
                                                                                }
                                                                            }
                                                                        }
                                                                    });
                                                                },
                                                            },
                                                        ],
                                                        columns: [
                                                            {
                                                                name: 'region',
                                                                options: regions.map((reg) => ({ text: reg.name, value: reg.id }))
                                                            },
                                                        ],
                                                    });
                                                }

                                            }}
                                            formError={form.form.fields.mall?.has_error}
                                        />
                                    </div>
                                }

                                {
                                    (!user?.meta_data?.commune || !user?.meta_data?.region) &&
                                    <div className="input-mall">
                                        <SelectInput
                                            cssClass="select-input"
                                            disabled={form.form.fields.region === undefined}
                                            icon={ImagePlace}
                                            placeholder={'Comuna'}
                                            text={form.form.fields.county?.value.toString()}
                                            onClick={async () => {

                                                if (true) {

                                                    present({
                                                        cssClass: 'select-modal-opigf009',
                                                        buttons: [
                                                            {
                                                                text: 'Confirmar',
                                                                handler: (selected): any => {
                                                                    const value = selected.county.text;

                                                                    setForm({
                                                                        form: {
                                                                            submitted: false,
                                                                            fields: {
                                                                                ...form.form.fields,
                                                                                county: {
                                                                                    value: value,
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
                                                                name: 'county',
                                                                options: getCounties(form.form.fields.region.value.toString() ?? "")
                                                            },
                                                        ],
                                                    });
                                                }

                                            }}
                                            formError={form.form.fields.mall?.has_error}
                                        />
                                    </div>
                                }

                                {!user?.birthday && <h3 className='form-section-header' >¿Cuál es tu fecha de nacimiento?</h3>}

                                {
                                    !user?.birthday && <DatePicker
                                        maxDate={moment().add("years", "-12")}
                                        onChange={(date) => {

                                            if (date !== null)
                                                setForm({
                                                    form: {
                                                        submitted: false,
                                                        fields: {
                                                            ...form.form.fields,
                                                            birthday: {
                                                                value: date,
                                                                has_error: false
                                                            }
                                                        }
                                                    }
                                                });
                                        }}
                                    />
                                }

                            </div>
                        </div>
                    </div>
                }
                footer={(
                    <DefaultFooter
                        mainActionText="¡Quiero inscribirme!"
                        onClickMainAction={handleSubmitSubscription}
                        mainActionIsDisabled={shouldDisableSubmitSubscription()}
                    />
                )}
            />

        )
    }

    const renderRUT_FORM = () => {

        return (
            <Fragment>
                <RutScreen
                    title={'Necesitamos que ingreses tu RUT'}
                    subtitle={'Esto es necesario para seguir con el proceso.'}
                    onBack={() => {
                        setMode('LANDING')
                    }}
                    onValue={handleUpdateUserRUT}
                    onContinue={() => { }}
                />
            </Fragment>
        )
    }


    const eventDateString = (): string => {
        if (new Date(currentSchedule!.start_date).getTime() > new Date().getTime())
            return moment(currentSchedule!.start_date).format('dddd D [de] MMMM');
        else
            return moment(currentSchedule!.end_date).format('dddd D [de] MMMM');
    }

    /**
    * Landing Page Render
    */
    const renderLANDING = () => {
        return (
            <Fragment>
                <Landing
                    imageTitle={currentSchedule!.url_image ?? BannerTitleImg}
                    title={currentSchedule!.schedule_name}
                    subtitle={eventDateString()}
                    textBody={currentSchedule!.schedule_detail}
                    onBack={() => { onbackHistory(true) }}
                    onContinue={() => {
                        if (user?.email === "invited") {
                            setShowRegisterForm(true);
                        } else {
                            if (user?.document_number === "no") {
                                setMode("RUT_FORM");
                            } 
                            else if (newEvent) {
                                setMode("EVENT_EXIST");
                                return;
                                
                            }
                            else {
                                setMode("FORM_INSCRIPTION");
                            }
                        }

                    }}
                    textContinue={"¡Quiero Inscribirme!"}
                    cssClass="event-inscription-flow"
                />

                {showRegisterForm && <RegisterModal
                    type="NEW"
                    userInfo={user}
                    onClose={() => {
                        setShowRegisterForm(false);
                    }}
                    onClick={() => {
                        setShowRegisterForm(false);
                        setMode("FORM_INSCRIPTION");
                    }}
                />}

            </Fragment>

        )
    }

    const renderEVENT_EXIST = () => {
        return (
            <EmptyModal 
                    title={'¡Ya estas inscrito!'}
                    height={'450px'}
                    onClose={() => setMode("LANDING")}
                    hidden={false}
                    cssClass="event-exist-plkght"
                    icon={ImageAlert}
                >
                    <div className="body-text">
                        <div className="subtitle">
                            Revisa los eventos que ya tienes inscritos
                        </div>
                        <div className="buttons-footer">
                            <IonButton className='white-centered' href={`/scheduled-events/${encodeURI(user?.mall_selected?.name!)}`}>
                                Ver tus eventos
                            </IonButton>
                        </div>
                    </div>
            </EmptyModal>
        )
    }


    const renders: Record<typeof mode, () => JSX.Element> = {
        LOADING: renderLOADING,
        LANDING: renderLANDING,
        FORM_INSCRIPTION: renderFORM_INSCRIPTION,
        RUT_FORM: renderRUT_FORM,
        INSCRIPTION_SUCCESS: renderINSCRIPTION_SUCCESS,
        EVENT_EXIST: renderEVENT_EXIST
    };

    /**
    * Main Render
    */
    const render = (mode: IMode) => {
        return (
            <IonPage className={`event-inscription-flow ${mode.replaceAll("_", "-").toLocaleLowerCase()}`}>
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

export default EventInscriptionPage;