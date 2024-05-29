import React, { useState } from 'react';
/**
* Styles
*/
import './index.less';
/*
* Clients
*/
import UserClient from '../../clients/UserClient';
/*
* Libs
*/
import EurekaConsole from '../../lib/EurekaConsole';
import DniFormatter from '../../lib/formatters/DniFormatter';
/** 
 * Models 
 */
import { IErrorModalProps } from '../error-modal';
/**
 * Components
 */
import Page, { DefaultFooter, DefaultHeader } from '../page';
import ErrorModal from '../error-modal/index';

export interface IProps {
    title: string;
    subtitle?: string;
    onBack: () => void;
    onContinue: () => void;
    onValue?: (value: string) => void;
    disabledHeader?: boolean;
    valueDefault?: string;
}

const eureka = EurekaConsole({ label: "component-rut-screen" });
const ANIMATION_TIME = 200;

const RutScreen: React.FC<IProps> = (props) => {

    const value = props.valueDefault && props.valueDefault.length > 0 ? props.valueDefault : '';
    const validationDefault = props.valueDefault && props.valueDefault.length > 0 ? true : false;
    const [isValidStatesInputs, setStateIsValidStatesInputs] = useState<{ document_number: boolean }>({ document_number: false });
    const [document_number, setStateDocumentNumber] = useState<string>(value);
    const [document_number_actived, setStateDocumentNumberActived] = useState<boolean>(false);
    const [error_modal, setStateErrorModal] = useState<IErrorModalProps>();

    const onSaveRutHandler = async () => {
        try {
            await UserClient.update('document_number', document_number);
            onOnContinue();
            props.onValue?.(document_number);
        } catch (error: any) {
            eureka.error('Unexpected error in save rut handler', error);
            setStateErrorModal({
                title: "Hubo un problema",
                message: (error.response?.status === 500 && error.response.data) ? error.response.data : "No pudimos registrar la información. ¿Deseas reintentar?",
                onRetry: () => {
                    setStateErrorModal(undefined);
                    setTimeout(() => {
                        onSaveRutHandler();
                    }, ANIMATION_TIME);
                },
                onCancel: () => {
                    setStateErrorModal(undefined);
                }
            }
            );
        }
    }

    const onInputChangeHandler = (key: string, value: string): void => {
        //evaluate if rut has (-) delimiter 
        const has_delimeter = value.includes('-');
        const isValids = Object.assign(isValidStatesInputs, {});
        if (value !== undefined) {
            switch (key) {
                case "document_number":
                    isValids.document_number = DniFormatter.isRutValid(value);
                    break;
                default:
                    return;
            }
        }

        if (!isValids.document_number && has_delimeter) {
            setStateDocumentNumberActived(false);
        }

        if (!isValids.document_number && !has_delimeter) {
            setStateDocumentNumberActived(true);
        }

        setStateIsValidStatesInputs({ document_number: isValids.document_number });
        setStateDocumentNumber(value)
    }

    const onOnBack = () => {
        props.onBack();
    }

    const onOnContinue = () => {
        props.onContinue();
    }

    return (
        <>
            <Page
                header={!props.disabledHeader ? <DefaultHeader onBack={onOnBack} /> : undefined}
                content={
                    <div className="component-screen-rut">
                        <div className="rut-text">
                            <h1>{props.title}</h1>
                            <p>{props.subtitle}</p>
                        </div>
                        <div className="rut-input">
                            <input value={document_number} placeholder={'12345678-9'} onChange={e => {
                                onInputChangeHandler('document_number', e.currentTarget.value?.toString()!)
                            }} disabled={validationDefault} />
                        </div>
                        {!validationDefault &&
                            <div className="rut-text-error">
                                {document_number_actived ? <p>Debes ingresarlo sin puntos y con guión</p> : !isValidStatesInputs.document_number ? <p>Debes ingresar un RUT válido</p> : null}
                            </div>
                        }
                    </div>
                }
                footer={(
                    <DefaultFooter
                        mainActionText='Continuar'
                        onClickMainAction={!isValidStatesInputs.document_number ? () => { } : onSaveRutHandler}
                        mainActionIsDisabled={validationDefault}
                    />
                )}
            />
            {error_modal &&
                <ErrorModal
                    cssClass={error_modal.cssClass}
                    icon={error_modal.icon}
                    title={error_modal.title}
                    message={error_modal.message}
                    cancelMessage={error_modal.cancelMessage}
                    retryMessage={error_modal.retryMessage}
                    onRetry={error_modal.onRetry}
                    onCancel={error_modal.onCancel} />}
        </>
    )
}

export default RutScreen;
