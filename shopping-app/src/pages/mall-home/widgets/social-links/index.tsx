/**
 * Styles
 */
// import './index.less';

/**
 * Components
 */

/**
 * Lib
 */

/**
 * Clients
 */

/**
 * Models
 */
import { ISocialLinksWidget } from '../../../../models/widgets/IWidget';
import SocialLink from './components/social-link';

/**
 * Assets
 */



const SocialLinks:React.FC<ISocialLinksWidget> = (props) => {
  
  return (
    <div className='social-links'>
      { props.links.map((link) => <SocialLink key={link.url} icon={link.icon} url={link.url} />) }
    </div>
  );

}

export default SocialLinks;