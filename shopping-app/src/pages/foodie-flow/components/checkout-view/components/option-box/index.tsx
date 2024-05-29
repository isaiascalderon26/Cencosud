/**
 * Styles
 */
import { IonIcon } from '@ionic/react';
import './index.less';

/**
 * Assets
 */
 import checkIcon from '../../../../../../assets/media/icon-check.svg';

const UNIQUE_CLASS = "ynkfflzbsi";

interface IProps {
  text: string
  secondaryText?: string
  icon?: string
  selected: boolean
  styles?: React.CSSProperties
  onClick: () => void
}

const OptionBox:React.FC<IProps> = ({ text, secondaryText, icon, selected, onClick, styles }) => {
  return (
    <div className={`option-box-${UNIQUE_CLASS} ${selected ? 'selected': ''}`} onClick={onClick} style={styles}>
      {icon && selected && <IonIcon src={checkIcon} /> }
      {icon && !selected && <IonIcon src={icon} /> }
      <span className='text main-text'>{text}</span>
      { secondaryText && <span className='text secondary-text'>{secondaryText}</span> }
    </div>
  );
}

export default OptionBox;