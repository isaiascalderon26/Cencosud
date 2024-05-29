/**
 * Style
 */
import './index.less';

import { IonSlide } from '@ionic/react';

const UNIQUE_CLASS = 'llavgmjkoo';

export interface IProps {
  name: string;
  image: string;
  onClick: () => void;
}

const FoodieCategoryItem: React.FC<IProps> = ({ name, image, onClick }) => {
  return (
    <IonSlide className={`${UNIQUE_CLASS}`} onClick={onClick}>
      <div className="foodie-category-item--content">
        <div className="item-image">
          <img src={image} alt={`foodie-category-${name}`} />
        </div>

        <h4 className="name">{name}</h4>
      </div>
    </IonSlide>
  );
};

export default FoodieCategoryItem;
