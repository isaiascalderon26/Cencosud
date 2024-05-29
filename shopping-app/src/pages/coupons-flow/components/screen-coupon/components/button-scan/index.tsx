import { IonButton } from '@ionic/react';
import React, { Fragment } from 'react';
/**
 * styles
 */
import './index.less';
/**
* assets
*/
import iconCodeQR from '../../../../../../assets/media/coupons-discounts/icon-code-qr.svg'; 

interface IProps {
    onClickScan: () => void;
}

const ButtonScan: React.FC<IProps> = ({ onClickScan }) => {

    const Scan = () => {
        onClickScan();
    }

    return (
        <Fragment>
            <div className="component-scan-button">
                <IonButton className="button-scan-light" onClick={Scan}>
                    <img src={iconCodeQR} alt="qr"/> Escanear código
                </IonButton>
            </div>
        </Fragment>
    )
}

export default ButtonScan;