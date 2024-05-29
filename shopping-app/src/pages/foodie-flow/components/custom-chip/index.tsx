import { IonChip, IonIcon, IonLabel } from '@ionic/react';
import { warningOutline, checkmarkOutline } from 'ionicons/icons'

/**
 * Styles
 */
import './index.less';

const UNIQUE_CLASS = 'auljvossjr';

type ChipTypes = 'SUCCESS' | 'WARNING' | 'DANGER';

export interface IProps {
  text: string;
  type?: ChipTypes;
  icon?: string | boolean
}

const CustomChip:React.FC<IProps> = ({text, type, icon}) => {

  let chipIcon;
  if(icon === true){  
    if(type === 'SUCCESS') {
      chipIcon = checkmarkOutline;
    } else {
      chipIcon = warningOutline;
    }
  } else if (icon !== false) {
    chipIcon = icon;
  }
  

  return (
    <IonChip className={`chip-wrapper-${UNIQUE_CLASS} ${type ? type?.toLowerCase() : 'default'}-bgcolor` } /*color={type?.toLowerCase()}*/>
      {icon && <IonIcon icon={chipIcon} className={`${type ? type?.toLowerCase() : 'default'}-color`} />}
      <IonLabel className={`text ${type?.toLowerCase()}-color`} >{text}</IonLabel>
    </IonChip>
  )
}

export default CustomChip;