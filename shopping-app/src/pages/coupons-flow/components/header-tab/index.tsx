import React, { Fragment } from 'react';
import { animated } from 'react-spring';
import { IonIcon } from '@ionic/react';

/**
* styles
*/
import './index.less';

/**
* Assets
*/
import checkImage from '../../../../assets/media/icon-check.svg';


interface IProps {
    id: number;
    onClick: (id:number) => void;
}

const HeaderTab: React.FC<IProps> = ({ id, onClick }) => { 
    const states = [
        {
            id: 1,
            alias : 'Disponibles'
        },
        {
            id: 2,
            alias : 'Canjeados'
        },
        {
            id: 3,
            alias : 'Expirados'
        }
    ];

    const onClickTab = (id: number): void => {
        onClick(id);
    };

    return (
        <Fragment>
            <div className="tab-header-component">
                <animated.div className='tab-header-component-content'>
                    {states.map((state) => {
                    const isSelected = state.id === id;
                    return (
                        <div key={state.id} className={`tab-style ${isSelected && 'selected'}`} onClick={() => { onClickTab(state.id)}}>
                            <div className='tab-content'>
                                <span>{state.alias}</span>
                                <IonIcon src={checkImage} />
                            </div>
                        </div>
                    )
                    })}
                </animated.div>
        </div>
        </Fragment>
    )
}

export default HeaderTab;