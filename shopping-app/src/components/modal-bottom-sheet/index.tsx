import { IonButton, IonIcon } from "@ionic/react";
import React from "react";
import ActionSheet from "../action-sheet";
import './index.less';
import alertSvg from '../../assets/media/delete-card.svg';


interface IModalBottomSheet {
    /**
     * Indicates that modal show be displayed
     */
    show: boolean;
    /**
     * Modal icon indicator
     */
    icon?: string;
    /**
     * Main headline text
     */
    headLine: string;
    /**
     * Modal description text
     */
    caption?: string;
    /**
     * Event applied when Close button pressed
     * @returns 
     */
    onClose?: () => void;
    /**
    * Event applied when OK button pressed
    * @returns 
    */
    onOk?: () => void;
    /**
     * Text for Ok Button
     */
    okButtonText?: string;
    /**
    * Event applied when Cancel button pressed
    * @returns 
    */
    onCancel?: () => void;
    /**
     * Text for Cancel Button
     */
    cancelButtonText?: string;
    showButtonSeparator?: boolean;
    buttonSeparatorText?: string;
}

const ModalBottomSheet: React.FC<IModalBottomSheet> = ({
    icon,
    show = false,
    headLine,
    caption,
    onClose = () => { },
    onOk,
    okButtonText,
    onCancel,
    cancelButtonText,
    showButtonSeparator,
    buttonSeparatorText
}) => {
    return (
        <ActionSheet show={show} onClose={onClose}>
            <div className="modal-bottom-sheet">
                <div className="modal-bottom-sheet-header">
                    <div className="status-icon">
                        {icon
                            ? <IonIcon className="icon" icon={icon} />
                            : <IonIcon className="icon" src={alertSvg} />}
                    </div>
                    <h1 className="modal-headline">{headLine}</h1>
                    <p className="modal-caption">{caption}</p>
                </div>
                <div className="modal-bottom-sheet-footer">

                    {
                        showButtonSeparator && <div className='caption-text'><span>{buttonSeparatorText || 'O también puedes'}</span></div>
                    }

                    {
                        onOk && <IonButton className='ok-button' onClick={onOk}>
                            {okButtonText || 'OK'}
                        </IonButton>
                    }
                    {
                        onCancel && <IonButton className='cancel-button' onClick={onCancel}>
                            {cancelButtonText || 'Cancelar'}
                        </IonButton>
                    }
                </div>
            </div>
        </ActionSheet>
    )
}

export default ModalBottomSheet;