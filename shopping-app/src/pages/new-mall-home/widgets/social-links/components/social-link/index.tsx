import { IonIcon } from '@ionic/react';
import Expr from '../../../../../../lib/Expr';

/**
 * Models
 */
import { ILink } from '../../../../../../models/widgets/IWidget';
import { logEventSocialLinksWidgetAnalytics } from '../../../utils/registerAnalyticsUtils';
interface IProps{
  link : ILink;
  homeState: any;
}
const SocialLink:React.FC<IProps> = ({link, homeState}) => {

  const openLink = () => {
    Expr.whenInNativePhone(async () => {
      logEventSocialLinksWidgetAnalytics(link.url, homeState.site.name,homeState?.user?.email); 
    }) 
    window.open(link.url);
  }

  return (
    <IonIcon className='social-icon' onClick={ openLink } icon={link.icon}/>
  );
}

export default SocialLink;