import { IonIcon } from '@ionic/react';

/**
 * Styles
 */
import './index.less';

/**
 * Assets
 */
import starEmptyIcon from '../../../../assets/media/calification/star-empty-icon.svg';
import starFullIcon from '../../../../assets/media/calification/star-full-icon.svg';

const UNIQUE_CLASS = 'ngkmqhkuif'

interface IProps {
  quantitySelected: number,
  maxStars: number,
  onSelect: (pos:number) => void
}

const StarSelector:React.FC<IProps> = ({maxStars, quantitySelected, onSelect}) => {

  
  const stars = Array<number>(maxStars).fill(0, 0, maxStars).map((v, i) => i+1);

  return (
    <div className={`star-row-${UNIQUE_CLASS}`}>
      { stars.map(val => <IonIcon key={val} src={quantitySelected >= val ? starFullIcon: starEmptyIcon} onClick={() => onSelect(val)} /> )}
    </div>
  );
}

export default StarSelector;