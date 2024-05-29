import { IonIcon } from '@ionic/react';

/**
 * Models
 */
import { ILink } from '../../../../../../models/widgets/IWidget';

const SocialLink:React.FC<ILink> = ({icon, url}) => {

  const openLink = () => window.open(url);

  return (
    <IonIcon className='social-icon' onClick={ openLink } icon={icon}/>
  );
}

export default SocialLink;