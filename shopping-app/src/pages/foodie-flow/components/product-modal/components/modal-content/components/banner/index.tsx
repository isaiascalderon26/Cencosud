import { IonIcon } from "@ionic/react";
import { closeOutline } from 'ionicons/icons';

/**
 * Style
 */
 import './index.less';

/**
 * Components
 */
import Image from '../../../../../image';

const UNIQUE_CLASS = 'bnqbmkxuvx';

interface IProps {
  image?: string;
}

const Banner:React.FC<IProps> = ({image}) => {

  return (
    <div className={`banner-wrapper-${UNIQUE_CLASS}`}>
      <Image src={image} alt="image" type="PRODUCT" /*styles={{height: '230px', width: '100%', objectFit: 'cover'}}*//>
    </div>
  );
}

export default Banner