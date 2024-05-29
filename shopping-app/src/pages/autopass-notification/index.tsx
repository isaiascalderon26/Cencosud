import React, { Fragment, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { IonButton, IonHeader, IonIcon, IonPage } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';

/* styles */
import './index.less';

/** 
* Components 
*/
import Page from '../../components/page';
import FancyTicket from '../../components/parking-ticket';
import CalificationModal from '../../components/califications';
import ErrorModal, { IErrorModalProps } from '../../components/error-modal';
import BackdropLoading from '../../components/backdrop-loading';

/** 
* Clients 
*/
import PaymentIntentionClient from '../../clients/PaymentIntentionClient';
import UserClient from '../../clients/UserClient';

/** 
* Models 
*/
import IPaymentIntention from '../../models/payments/IPaymentIntention';
import { IUser } from '../../models/users/IUser';

/**
* Libs
*/
import EurekaConsole from '../../lib/EurekaConsole';

/**
* assets
*/
import checkedImg from '../../assets/media/atom/icon/checked.png';
import flowQualificationImg from '../../assets/media/icon-flow-qualification.svg';

interface IProps extends RouteComponentProps<{
    id: string,
  }> {
  }

type IMode = "LOADING" | "HOME";
const eureka = EurekaConsole({ label: "autopass-notification" });
const ANIMATION_TIME = 200;

const AutopassNotificationPage: React.FC<IProps> = (props) => { 
    const [mode, setMode] = useState<IMode>("LOADING");
    const [loadingMessage, setLoadingMessage] = useState<string>("Cargando ...");
    const [error_modal, setStateErrorModal] = useState<IErrorModalProps>();
    const [paymentIntention, setStatePaymentIntention] = useState<IPaymentIntention>();
    const [user, setStateUser] = useState<IUser>();
    const [selectedHistory, setStateSelectedHistory] = useState<Record<string,any>>();
    const [hasQuestions, setStateHasQuestions] = useState<boolean>(false);
    const [isVisibleCalifications, setStateIsVisibleCalifications] = useState<boolean>(false);
   
    useEffect(() => {
		async function fetchData() {
			await fetchAll();
		}
		fetchData();
	}, []);

	const fetchAll = async () => {
        try {
			setMode("LOADING");
			setLoadingMessage("Cargando...");

            const [user, paymentIntention] = await Promise.all([
                getUser(),
				getPaymentIntention(),
            ]);

            eureka.log("paymentIntention", paymentIntention);

            setStateUser(user);
            setStateSelectedHistory({
                state: paymentIntention.state,
                userId: paymentIntention.payment_method.details.user_id,
                location: paymentIntention.metadata.facility_id,
                locationName: paymentIntention.metadata.facility_name,
                plate: paymentIntention.metadata.plate,
                entranceDateTime: new Date(paymentIntention.metadata.entrance_date_time as string),
                exitDateTime: new Date(paymentIntention.metadata.exit_date_time as string),
                payment: {
                    fee: {
                        amount: paymentIntention.transaction.amount.total,
                        discount: paymentIntention.transaction.amount.discount,
                        currencyCode: paymentIntention.transaction.currency,
                    }
                },
                discounts: paymentIntention.discounts
            });
            setStatePaymentIntention(paymentIntention);
            setMode("HOME");
        }
        catch (error) {
            eureka.error('Unexpected error fetching all', error);

            setStateErrorModal({
				title: "Hubo un problema",
				message: "No pudimos cargar toda la información. ¿Deseas reintentar?",
				onRetry: () => {
					setStateErrorModal(undefined);
					setTimeout(async() => {
						await fetchAll();
					}, ANIMATION_TIME);
				},
				onCancel: () => {		
					setTimeout(() => {
                        setStateErrorModal(undefined);
                        props.history.push('/');
					}, ANIMATION_TIME)
				}
            });
        }
    }


    const getPaymentIntention = async (): Promise<IPaymentIntention> => {
        const paymentIntentionId = props.match.params.id;
        const paymentIntention = await PaymentIntentionClient.getById(paymentIntentionId);
        return paymentIntention;
    }

    const getUser = async (): Promise<IUser> => {
        const user = await UserClient.me();
        return user;    
    }

    const onCloseCalification = (): void => {
        setStateIsVisibleCalifications(false);
    }

    const onSaveCalification = (): void => {
        setStateIsVisibleCalifications(false);
        setStateHasQuestions(false);
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
    * Home Render
    */
    const renderHOME = () => {

        const header = <IonHeader>
            <div onClick={() => {
                props.history.push('', `/mall-home/${paymentIntention?.metadata.facility_name}`);
            }} >
            <IonIcon icon={closeOutline} />
            </div>
        </IonHeader>; 

        const content = (
            <div className='autopass-history'>
                <FancyTicket selectedHistory={selectedHistory!} />
                <div className="history-item status-section">
                {(selectedHistory!.state === 'APPROVED') &&
                    <>
                    <div className="status-big-icon">
                        <img src={checkedImg} alt="Todo listo y pagado..." />
                    </div>
                    <h2>¡Todo listo!</h2>
                    <div className="process-status">Ticket pagado</div>
                    {hasQuestions && 
                        <div className="button-califications">
                            <IonButton className='white-centered' onClick={() => { setStateIsVisibleCalifications(true) }}>
                                Calificar Experiencia
                            </IonButton>
                        </div>
                    }
                    <>
                        <CalificationModal
                            flow='AUTOPASS'
                            show={isVisibleCalifications}
                            initialPage={{
                                mainText: `${user?.full_name === '' || user?.full_name === '-' ? 'Hola' : user?.full_name}, ya pagaste tu ticket`,
                                mainImage: flowQualificationImg
                            }}
                            cancelButtonText={'Ahora no'}
                            payment_intention_id={paymentIntention!.id}
                            payment_date={paymentIntention!.created_at.toString()}
                            
                            user={user}
                            metadata={{
                                "mall_id": paymentIntention!.metadata.facility_id as string
                            }}

                            onClose={() => { onCloseCalification() }}
                            onSaveCalification={() => { onSaveCalification() }}
                            hasQuestions={(question:boolean) => { setStateHasQuestions(question) }}
                        >
                            <div>Cuéntanos cómo fue tu experiencia utilizando el servicio de Escanea tu ticket.</div>
                            <div>Te tomará menos de un minuto.</div>
                        </CalificationModal>
                    </>
                    </>
                }
                </div>
            </div>
        );
        return (
            <Page
                header={header}
                content={content}
            />
        )
    }

    const renders: Record<typeof mode, () => JSX.Element> = {
		LOADING: renderLOADING,
		HOME: renderHOME,
	};

    /**
     * Main Render
     */
     const render = (mode:IMode) => {
        return (
        	<IonPage className={`autopass-notifications ${mode.replaceAll("_", "-").toLocaleLowerCase()}`}>
            	{(() => {
              		const customRender = renders[mode];
              		if (!customRender) {
                		return <div>{mode}</div>;
              		}
              		return customRender();
            	})()}
				{error_modal && <ErrorModal cssClass={error_modal.cssClass} icon={error_modal.icon} title={error_modal.title} message={error_modal.message} cancelMessage={error_modal.cancelMessage} retryMessage={error_modal.retryMessage} onRetry={error_modal.onRetry} onCancel={error_modal.onCancel} />}
          	</IonPage>
        )
    }

	return render(mode);
}

export default AutopassNotificationPage;