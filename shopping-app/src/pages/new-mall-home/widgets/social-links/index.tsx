/**
 * Styles
 */
import './index.less';

/**
 * Models
 */
import { ISocialLinksWidget } from '../../../../models/widgets/IWidget';
import SocialLink from './components/social-link';


 const UNIQUE_CLASS = 'vdbhylmbse';

interface IProps {
  widget: ISocialLinksWidget,
  homeState: any
} 
const SocialLinks:React.FC<IProps> = ({ widget, homeState}) => {
  
  return (
    <div className={`${UNIQUE_CLASS} social-links`}>
      { widget.links.map((link,i) => <SocialLink key={i} link={link} homeState={homeState} />) }
    </div>
  );

}

export default SocialLinks;