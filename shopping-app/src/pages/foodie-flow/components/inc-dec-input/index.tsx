import { IonIcon } from '@ionic/react';
import React from 'react';
import { addOutline, removeOutline } from 'ionicons/icons';

/**
 * Style
 */
import './index.less';

const UNIQUE_CLASS = 'qvhfuchlcg';

export interface IIncDecInputProps {
    value: number;
    onDecrement: (cant?: number) => void;
    onIncrement: () => void;
    removeOnly?: boolean
    minValue?: number;
    leftIconBeforeMin?: string;
    disableLeftOnMin?: boolean;
}

const IncDecInput: React.FC<IIncDecInputProps> = ({ value, onDecrement, onIncrement, minValue = 0, leftIconBeforeMin = removeOutline, disableLeftOnMin = true, removeOnly }) => {

    const onClickDecrement = (event: any) => {
        event.preventDefault();
        if(value >= minValue) {
            onDecrement();
        }
    }

    const onClickRemove = (event: any) => {
        event.preventDefault();
        if(value >= minValue) {
            onDecrement(value);
        }
    }

    const onClickIncrement = (event: any) => {
        event.preventDefault();
        onIncrement();
    }
    
    let iconClasses = 'icon'
    let iconDisabled = '';
    let icon = removeOutline;
    if(value <= minValue + 1) {
        if(disableLeftOnMin && value === minValue) {
            iconDisabled = 'icon-disabled';
        }
        icon = leftIconBeforeMin;
        if(leftIconBeforeMin !== removeOutline){
            iconClasses = 'icon-trash';
        }
    }
    if(removeOnly){
        return (
            <div className={`${UNIQUE_CLASS} wrapper_remove`}>
                <IonIcon icon={leftIconBeforeMin} onClick={onClickRemove} className={`${iconClasses} ${iconDisabled}`}/>
            </div>
        )
    }
    return (
        <div className={`${UNIQUE_CLASS} wrapper`}>
            <IonIcon icon={icon} onClick={onClickDecrement} className={`left ${iconClasses} ${iconDisabled}`}/>
                <span className='value'>{value}</span>
            <IonIcon icon={addOutline} onClick={onClickIncrement} className={`right icon`}/>
        </div>
    )
}

export default IncDecInput;