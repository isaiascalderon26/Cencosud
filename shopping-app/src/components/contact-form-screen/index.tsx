import { arrowBack, checkmarkCircleOutline } from 'ionicons/icons';
import { IonContent, IonHeader, IonIcon, IonPage, IonFooter, IonButton } from '@ionic/react';
import { Fragment, useState } from "react";
import i18n from '../../lib/i18n';
import locales from "../faq-detail/locales";
import EmailService from "./send-email.service";
import IMessage from "./models/IMessage.interface";
const localize = i18n(locales);

interface IMainForm {
    onBack: () => void;
    onEmailSent?: () => void;
    phone_enable?: boolean;
    user_email?: string;
    user_phone?: string;
    user_fullname?: string;
};



const ContactFormScreen: React.FC<IMainForm> = ({
    onBack,
    onEmailSent = () => { },
    phone_enable,
    user_email,
    user_phone,
    user_fullname
}) => {
    return (
        <MainForm
            onBack={onBack}
            onEmailSent={onEmailSent}
            phone_enable={phone_enable}
            user_email={user_email}
            user_phone={user_phone}
            user_fullname={user_fullname}
        />
    );
}


const MainForm: React.FC<IMainForm> = ({
    onBack,
    onEmailSent = () => { },
    phone_enable,
    user_email,
    user_phone,
    user_fullname
}) => {

    /**
     * Flag that indicate that email has been sent, success
     */
    const [emailSent, setEmailSent] = useState(false);

    const [formData, setFormData] = useState<IMessage | any>(null);

    const [errorData, setErrorData] = useState<any>({});

    const onInputChangeHandler = (evt: any) => {
        const { value, dataset } = evt.currentTarget;
        setFormData({ ...formData, [dataset.value]: value });
    }

    const handleSendEmail = async () => {
        try {
            setErrorData({});
            const { success, errors } = EmailService.isValidMessage({
                ...formData,
                user_fullname,
                user_phone,
                user_email,
            }, phone_enable);

            if (success) {
                await EmailService.send({
                    ...formData,
                    user_fullname,
                    user_phone,
                    user_email
                }, phone_enable);

                setEmailSent(true);

            } else {
                setErrorData(errors);
            };
        } catch (e) {

        }
    }


    if (emailSent)
        return (<SuccessView full_name={user_fullname} onEmailSent={onEmailSent} />);

    return (
        <Fragment>
            <IonPage className='service-client'>
                <IonHeader>
                    <div onClick={onBack}>
                        <IonIcon icon={arrowBack}></IonIcon>
                    </div>
                </IonHeader>
                <IonContent className='body-service-client'>
                    <div>
                        <h1>{localize('SERVICE_CLIENT_TITLE')}</h1>
                        <p className="subtitle">{localize('SERVICE_CLIENT_SUBTITLE')}</p><br />
                        <p>{localize('SERVICE_CLIENT_DESCRIPTION')}</p>
                    </div>
                    <div>
                        {phone_enable ? <input type="tel" value={formData?.phone} className={errorData.phone_error ? "input-error" : ""} placeholder="Teléfono" data-value='phone' onChange={onInputChangeHandler} /> : null}
                    </div>
                    <div>
                        <input value={formData?.subject} className={errorData.subject_error ? "input-error" : ""} placeholder="Asunto" data-value='subject' onChange={onInputChangeHandler} />
                    </div>
                    <div>
                        <textarea value={formData?.message} className={errorData.message_error ? "textarea-error" : ""} placeholder="Mensaje" data-value='message' onChange={onInputChangeHandler} />
                    </div>
                    <div>
                        {formData?.subject_error || formData?.message_error || formData?.phone_error ? <span className="error">{localize('SERVICE_CLIENT_REQUIRED')}</span> : null}
                    </div>
                </IonContent>
                <IonFooter>
                    <div className='pad-buttons'>
                        <IonButton className='white-centered' onClick={handleSendEmail}>
                            Enviar
                        </IonButton>
                    </div>
                </IonFooter>
            </IonPage>
        </Fragment>
    );

}

const SuccessView: React.FC<{ full_name?: string, onEmailSent?: () => void }> = ({
    full_name,
    onEmailSent = () => { }
}) => (
    <Fragment>
        <IonPage>
            <IonContent className="email-sac-success">
                <div>
                    <div className="email-sac-success-body">
                        <IonIcon icon={checkmarkCircleOutline} />
                        <h1 className="font-bold">¡{localize('SAC_EMAIL_SUCCESS_TITLE')}, {full_name}!</h1>
                    </div>
                    <div>
                        <h3 className="feature-disclaimer-success">{localize('SAC_EMAIL_SUCCESS_SUBTITLE')}</h3>
                    </div>
                </div>
            </IonContent>
            <IonFooter>
                <div className='pad-buttons'>
                    <IonButton onClick={onEmailSent}>Finalizar</IonButton>
                </div>
            </IonFooter>
        </IonPage>
    </Fragment>
)

export default ContactFormScreen;