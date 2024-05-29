import { IonButton } from '@ionic/react';
import React, { ChangeEvent, Fragment, useState } from 'react';
import { AxiosError } from 'axios';
/**
 * styles
 */
import './index.less';
/**
 * assets
 */
import iconError from '../../../../../../assets/media/coupons-discounts/error.svg';

interface IProps {
    onClickCoupon: (coupon:string) => Promise<boolean|AxiosError>;
}

const AddCoupon: React.FC<IProps> = ({ onClickCoupon }) => {

    const [coupon, setCoupon] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [errorClass, setErrorClass] = useState<string>("");

    const onAddCoupon = async (): Promise<void> => {
        if(coupon.trim().length === 0) {
            setError("Debes ingresar un cupón");
            setErrorClass("error");
            return;
        }

        const response_code = await onClickCoupon(coupon);

        if((response_code as AxiosError).response?.status === 404 ){
            setError("El cupón no existe");
            setErrorClass("error");
            return;
        }

        if((response_code as AxiosError).response?.status === 409 ){
            setError("Este cupón ya fue usado");
            setErrorClass("error");
            return;
        }
    }

    const onChangeInput = (event: ChangeEvent<HTMLInputElement>): void => {
        const value = event.target.value.toUpperCase();
        if(value.charAt(0) != "") {
            setError("");
            setErrorClass("");
        }

        setCoupon(value);
    }

    return (
        <Fragment>
            <div className="component-add-coupon">
                <div className="component-add-coupon-content">
                    <input type="text" placeholder="Ingresa el código" className={errorClass} onChange={(event) => onChangeInput(event)} value={coupon} />
                    <IonButton onClick={onAddCoupon} className={`${coupon && 'black-button'}`}>Aplicar</IonButton>
                </div>
                <div className="coupon-add-content-error">
                    {error.length > 0 && <><img src={iconError} alt="error" /> {error}</>}
                </div>
            </div>
        </Fragment>
    )
}

export default AddCoupon;
