import React from 'react';

/**
 * Style
 */
import './index.less';

/**
 * Components
 */


/**
 * Models
 */

export interface IButtonStyle1Props {
  icon: string;
  text: string;
  action: () => void;
}

const ButtonStyle1: React.FC<IButtonStyle1Props> = ({ icon, text, action }) => {

  return (
    <div className="button-style-1">
        <button className="button" onClick={action}>
            <div className="icon">
                <img src={icon} alt="info" />
            </div>
            <div className="text" dangerouslySetInnerHTML={{ __html: `${text}` }}></div>
        </button>
    </div>
  )
  
}

export default ButtonStyle1;
